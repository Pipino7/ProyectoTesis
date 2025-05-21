import {
  CajaSesion,
  Estado,
  Movimiento,
  Venta,
  Cobro,
  Gasto,
  Usuario
} from '../entities/index.js';
import { Between, MoreThan  } from 'typeorm';
import FinancierosHelpers from './financieros.helpers.js';

export const ESTADOS_CAJA = {
  ABIERTA: 'abierta',
  CERRADA: 'cerrada'
};

const CajaHelpers = {
  async obtenerEstado(manager, nombre) {
    const estado = await manager.findOne(Estado, { where: { nombre_estado: nombre } });
    if (!estado) throw new Error(`Estado "${nombre}" no encontrado.`);
    return estado;
  },

  async obtenerCajaActiva(manager, usuario_id) {
    if (!usuario_id) {
      throw new Error('Usuario no identificado para obtener la sesión de caja.');
    }
  
    const estadoAbierta = await CajaHelpers.obtenerEstado(manager, ESTADOS_CAJA.ABIERTA);
    
    console.log(`🔍 Buscando cajas activas para usuario ${usuario_id} con estado ID: ${estadoAbierta.id}`);
    const sesiones = await manager
      .createQueryBuilder('caja_sesion', 'caja')
      .innerJoinAndSelect('caja.estado', 'estado')
      .innerJoinAndSelect('caja.usuario', 'usuario')
      .where('usuario.id = :usuarioId', { usuarioId: usuario_id })
      .andWhere('estado.id = :estadoId', { estadoId: estadoAbierta.id })
      .getMany();
      
    console.log(`🔎 Consulta de cajas activas completada - Encontradas: ${sesiones.length}`);
  
    if (sesiones.length > 1) {
      console.error(`⚠️ ERROR DE INTEGRIDAD: Usuario ${usuario_id} tiene ${sesiones.length} cajas abiertas`);
      throw new Error(`Error de integridad: el usuario ${usuario_id} tiene múltiples cajas abiertas.`);
    }
    
    if (sesiones.length === 1) {
      console.log(`✅ Caja activa encontrada - ID: ${sesiones[0].id}, Estado: ${sesiones[0].estado.nombre_estado}`);
    } else {
      console.log(`ℹ️ No se encontraron cajas activas para el usuario ${usuario_id}`);
    }
  
    return sesiones[0] || null;
  },
  
  async verificarCajaPorId(manager, cajaId) {
    console.log(`🔍 Verificando existencia y estado de caja ID: ${cajaId}`);
    
    try {
      const caja = await manager
        .createQueryBuilder('caja_sesion', 'caja')
        .innerJoinAndSelect('caja.estado', 'estado')
        .innerJoinAndSelect('caja.usuario', 'usuario')
        .where('caja.id = :cajaId', { cajaId })
        .getOne();
        
      if (!caja) {
        console.log(`⚠️ No se encontró la caja con ID: ${cajaId}`);
        return { existe: false, activa: false, caja: null };
      }
      
      const esActiva = caja.estado.nombre_estado === ESTADOS_CAJA.ABIERTA;
      console.log(`✅ Caja ID: ${cajaId} encontrada - Estado: ${caja.estado.nombre_estado}, Activa: ${esActiva}`);
      
      return {
        existe: true,
        activa: esActiva,
        caja: {
          id: caja.id,
          fecha_apertura: caja.fecha_apertura,
          monto_inicial: caja.monto_inicial,
          usuario_id: caja.usuario.id,
          estado: caja.estado.nombre_estado,
          totales: {
            ventas: 0,
            cobros: {},
            gastos: 0,
            balance_actual: Number(caja.monto_inicial)
          }
        }
      };
    } catch (error) {
      console.error(`❌ Error al verificar caja por ID: ${error.message}`);
      return { existe: false, activa: false, caja: null, error: error.message };
    }
  },

  async calcularTotalesCaja(manager, caja) {
    console.log(`🧮 Calculando totales para Caja ID: ${caja.id}`);
  
    const [ventas, cobros, gastos, devoluciones, ventasPendientes] = await Promise.all([
      manager.find(Venta, {
        where: { caja_sesion: { id: caja.id } },
        relations: ['estado_pago', 'detallesVenta']
      }),

      manager.find(Cobro, {
        where: { caja_sesion: { id: caja.id } },
        relations: ['metodoPago', 'venta']
      }),
  
      manager.find(Gasto, {
        where: { 
          caja_sesion: { id: caja.id },
          fuera_de_caja: false 
        },
        relations: ['metodo_pago']
      }),
      manager.find(Movimiento, {
        where: {
          caja_sesion: { id: caja.id },
          accion: 'devolucion_caja'
        },
        relations: ['cobro']
      }),
  
      manager.find(Venta, {
        where: {
          saldo_pendiente: MoreThan(0),
          estado_pago: { nombre_estado: 'pendiente' }
        },
        relations: ['cobros', 'cobros.metodoPago']
      })
    ]);
  
    console.log(`📊 DATOS ENCONTRADOS:
    - Ventas registradas para caja ${caja.id}: ${ventas.length}
    - Cobros registrados para caja ${caja.id}: ${cobros.length}
    - Gastos registrados para caja ${caja.id}: ${gastos.length}
    - Devoluciones registradas para caja ${caja.id}: ${devoluciones.length}
    - Ventas con saldo pendiente: ${ventasPendientes.length}`);
    
    const prendasDevueltas = devoluciones.reduce((total, movimiento) => {
      return total + (Number(movimiento.cantidad) || 0);
    }, 0);
    const devolucionesRealizadas = devoluciones.length;
    
    console.log(`👚 Total prendas devueltas: ${prendasDevueltas}`);
    console.log(`🔄 Total devoluciones realizadas: ${devolucionesRealizadas}`);
    
    const cobrosNormales = cobros.filter(cobro => Number(cobro.monto) >= 0);
    const cobrosReembolsos = cobros.filter(cobro => Number(cobro.monto) < 0);
    
    try {
      const resultado = FinancierosHelpers.calcularTotalesCajaCompletos(
        caja, 
        ventas, 
        cobrosNormales,  
        gastos,
        cobrosReembolsos  
      );
      resultado.prendasDevueltas = prendasDevueltas || 0;
      resultado.devolucionesRealizadas = devolucionesRealizadas || 0;
      const fechaAperturaCaja = new Date(caja.fecha_apertura);
      fechaAperturaCaja.setHours(0, 0, 0, 0); 
      
      const cobrosDelDiaPorMetodo = {
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0
      };
      
      const cobrosPendientesPorMetodo = {
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0
      };
      
      cobrosNormales.forEach(cobro => {
        const metodo = cobro.metodoPago?.nombre_metodo;
        if (!metodo || cobrosDelDiaPorMetodo[metodo] === undefined) return;
        
        const monto = Number(cobro.monto || 0);
        
        if (cobro.venta?.fecha_venta) {
          const fechaVenta = new Date(cobro.venta.fecha_venta);
          fechaVenta.setHours(0, 0, 0, 0); 
          
          if (fechaVenta.getTime() === fechaAperturaCaja.getTime()) {
            cobrosDelDiaPorMetodo[metodo] += monto;
          } else if (fechaVenta.getTime() < fechaAperturaCaja.getTime()) {
            cobrosPendientesPorMetodo[metodo] += monto;
          } else {
            cobrosDelDiaPorMetodo[metodo] += monto;
          }
        } else {
          cobrosDelDiaPorMetodo[metodo] += monto;
        }
      });
      
      const totalCobrosDelDia = Object.values(cobrosDelDiaPorMetodo).reduce((sum, monto) => sum + monto, 0);
      const totalCobrosPendientes = Object.values(cobrosPendientesPorMetodo).reduce((sum, monto) => sum + monto, 0);
      
      resultado.cobrosDelDiaPorMetodo = cobrosDelDiaPorMetodo;
      resultado.cobrosPendientesPorMetodo = cobrosPendientesPorMetodo;
      resultado.totalCobrosDelDia = totalCobrosDelDia;
      resultado.totalCobrosPendientes = totalCobrosPendientes;
      
      if (!resultado.cobrosPorMetodo) {
        console.warn('⚠️ cobrosPorMetodo es undefined, se usará un objeto por defecto');
        resultado.cobrosPorMetodo = { efectivo: 0, tarjeta: 0, transferencia: 0 };
      }
      
      resultado.cobrosPorMetodo = {
        efectivo: cobrosDelDiaPorMetodo.efectivo + cobrosPendientesPorMetodo.efectivo,
        tarjeta: cobrosDelDiaPorMetodo.tarjeta + cobrosPendientesPorMetodo.tarjeta,
        transferencia: cobrosDelDiaPorMetodo.transferencia + cobrosPendientesPorMetodo.transferencia
      };
      
      resultado.totalCobros = totalCobrosDelDia + totalCobrosPendientes;
      

      const pendientesPorMetodo = { efectivo: 0, tarjeta: 0, transferencia: 0 };

      for (const venta of ventasPendientes) {

        let metodoPreferido = 'efectivo'; 
        

        if (venta.cobros && venta.cobros.length > 0) {
          const metodosCobro = {};
          venta.cobros.forEach(cobro => {
            const metodo = cobro.metodoPago?.nombre_metodo || 'efectivo';
            metodosCobro[metodo] = (metodosCobro[metodo] || 0) + 1;
          });
          
          let maxOcurrencias = 0;
          for (const [metodo, ocurrencias] of Object.entries(metodosCobro)) {
            if (ocurrencias > maxOcurrencias) {
              maxOcurrencias = ocurrencias;
              metodoPreferido = metodo;
            }
          }
        }
        

        if (pendientesPorMetodo[metodoPreferido] !== undefined) {
          pendientesPorMetodo[metodoPreferido] += Number(venta.saldo_pendiente || 0);
        }
      }
      

      resultado.pendientesPorMetodo = pendientesPorMetodo;

      if (!resultado.gastosPorMetodo) {
        console.warn('⚠️ gastosPorMetodo es undefined, se usará un objeto por defecto');
        resultado.gastosPorMetodo = { efectivo: 0, tarjeta: 0, transferencia: 0 };
      }
      
      console.log(`🧾 RESUMEN DE CÁLCULOS ACTUALIZADOS (Caja ID: ${caja.id}):
      - Monto inicial: $${resultado.montoInicial || caja.monto_inicial || 0}
      - Total ventas: $${resultado.totalVentas || 0}
      - Total prendas: ${resultado.totalPrendas || 0}
      - Prendas devueltas: ${resultado.prendasDevueltas || 0}
      - Cobros por método (total): ${JSON.stringify(resultado.cobrosPorMetodo)}
      - Cobros del día por método: ${JSON.stringify(resultado.cobrosDelDiaPorMetodo)}
      - Cobros de pendientes por método: ${JSON.stringify(resultado.cobrosPendientesPorMetodo)}
      - Pendientes por cobrar: ${JSON.stringify(resultado.pendientesPorMetodo)}
      - Gastos por método: ${JSON.stringify(resultado.gastosPorMetodo)}
      - Reembolsos por método: ${JSON.stringify(resultado.reembolsosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 })}
      - Balance actual (efectivo en caja): $${resultado.balanceFinal?.efectivo || 0}
      - Fórmula: $${resultado.montoInicial || 0} + ${resultado.cobrosPorMetodo?.efectivo || 0} - ${resultado.gastosPorMetodo?.efectivo || 0} - ${resultado.reembolsosPorMetodo?.efectivo || 0} = $${resultado.balanceFinal?.efectivo || 0}`);

      return resultado;
    } catch (error) {
      console.error(`❌ Error en calcularTotalesCaja: ${error.message}`);
      

      const resultadoPorDefecto = {
        montoInicial: Number(caja?.monto_inicial || 0),
        totalVentas: 0,
        totalCobros: 0,
        totalCobrosDelDia: 0,
        totalCobrosPendientes: 0,
        totalGastos: 0,
        totalPrendas: 0,
        prendasDevueltas: prendasDevueltas || 0,
        devolucionesRealizadas: devolucionesRealizadas || 0,
        cobrosPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobrosDelDiaPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobrosPendientesPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
        pendientesPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
        gastosPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
        reembolsosPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
        balancePorMetodo: { 
          efectivo: Number(caja?.monto_inicial || 0), 
          tarjeta: 0, 
          transferencia: 0,
          total: Number(caja?.monto_inicial || 0)
        },
        balanceFinal: { 
          efectivo: Number(caja?.monto_inicial || 0), 
          tarjeta: 0, 
          transferencia: 0,
          total: Number(caja?.monto_inicial || 0)
        }
      };
      
      console.log(`⚠️ Retornando valores por defecto debido al error: ${JSON.stringify(resultadoPorDefecto)}`);
      return resultadoPorDefecto;
    }
  },


  async listarMovimientos(manager, caja_id) {
    console.log(`📋 Listando movimientos para Caja ID: ${caja_id}`);
    
    const movimientos = await manager.find(Movimiento, {
      where: { caja_sesion: { id: caja_id } },
      relations: ['usuario'],
      order: { fecha: 'ASC' },
    });

    console.log(`🔄 Total de movimientos encontrados: ${movimientos.length}`);
    
    return movimientos.map(mov => ({
      id: mov.id,
      accion: mov.accion,
      cantidad: mov.cantidad,
      observacion: mov.observacion,
      fecha: mov.fecha,
      usuario: mov.usuario?.email || 'Desconocido',
    }));
  },
};

export default CajaHelpers;
