import AppDataSource from '../config/ConfigDB.js';
import CajaHelpers, { ESTADOS_CAJA } from '../helpers/caja.helpers.js';
import { CajaSesion, Estado, Gasto, ResumenCaja } from '../entities/index.js';
import { Between } from 'typeorm';

const CajaService = {
  async abrirCaja(usuario_id, monto_inicial) {
    console.log(`🔔 APERTURA DE CAJA - Usuario: ${usuario_id}, Monto inicial: $${monto_inicial}`);
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const cajaActiva = await CajaHelpers.obtenerCajaActiva(qr.manager, usuario_id);
      if (cajaActiva) {
        console.log(`⚠️ Error: El usuario ${usuario_id} ya tiene una caja abierta con ID: ${cajaActiva.id}`);
        
        if (cajaActiva.fecha_cierre) {
          console.log(`🔄 Se detectó una caja en estado inconsistente (ID: ${cajaActiva.id}). Actualizando a cerrada...`);
          const estadoCerrada = await CajaHelpers.obtenerEstado(qr.manager, ESTADOS_CAJA.CERRADA);
          cajaActiva.estado = estadoCerrada;
          await qr.manager.save(CajaSesion, cajaActiva);
          console.log(`✅ Caja ID: ${cajaActiva.id} marcada como cerrada correctamente`);
          const estadoAbierta = await CajaHelpers.obtenerEstado(qr.manager, ESTADOS_CAJA.ABIERTA);
          const nuevaCaja = await qr.manager.save(CajaSesion, {
            monto_inicial,
            usuario: { id: usuario_id },
            estado: estadoAbierta,
          });
          
          console.log(`✅ Nueva caja abierta exitosamente - ID: ${nuevaCaja.id}, Fecha: ${nuevaCaja.fecha_apertura}, Monto inicial: $${nuevaCaja.monto_inicial}`);
          await qr.commitTransaction();
          
          const verificacion = await CajaHelpers.verificarCajaPorId(AppDataSource.manager, nuevaCaja.id);
          if (!verificacion.activa) {
            console.error(`❌ ERROR CRÍTICO: La caja recién creada con ID ${nuevaCaja.id} no está activa`);
          }
          
          return verificacion.caja || nuevaCaja;
        }
        
        throw new Error('Ya tienes una caja abierta. Debes cerrarla antes de abrir una nueva.');
      }
      const estadoAbierta = await CajaHelpers.obtenerEstado(qr.manager, ESTADOS_CAJA.ABIERTA);
      console.log(`🔍 Estado 'abierta' obtenido: ID=${estadoAbierta.id}, Nombre=${estadoAbierta.nombre_estado}`);

      const cajaGuardada = await qr.manager.save(CajaSesion, {
        monto_inicial,
        usuario: { id: usuario_id },
        estado: estadoAbierta,
      });
      
      console.log(`✅ Caja abierta exitosamente - ID: ${cajaGuardada.id}, Fecha: ${cajaGuardada.fecha_apertura}, Monto inicial: $${cajaGuardada.monto_inicial}`);

      await qr.commitTransaction();
      
      const verificacion = await CajaHelpers.verificarCajaPorId(AppDataSource.manager, cajaGuardada.id);
      console.log(`🔍 Verificación post-apertura: Caja existe=${verificacion.existe}, Activa=${verificacion.activa}`);
      
      if (!verificacion.activa) {
        console.error(`❌ ERROR CRÍTICO: La caja recién creada con ID ${cajaGuardada.id} no está activa`);
      }
      return verificacion.caja || {
        id: cajaGuardada.id,
        fecha_apertura: cajaGuardada.fecha_apertura,
        monto_inicial: cajaGuardada.monto_inicial,
        usuario_id: usuario_id,
        estado: estadoAbierta.nombre_estado,
        totales: {
          ventas: 0,
          cobros: {},
          gastos: 0,
          balance_actual: Number(monto_inicial)
        }
      };
    } catch (e) {
      console.log(`❌ Error al abrir caja: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  },

  async obtenerResumenDeCaja(usuario_id) {
    console.log(`🔍 Consultando resumen de caja para usuario: ${usuario_id}`);
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    try {
      const cajaActiva = await CajaHelpers.obtenerCajaActiva(qr.manager, usuario_id);
      if (!cajaActiva) {
        console.log(`⚠️ No hay caja abierta para usuario: ${usuario_id}`);
        throw new Error('No tienes una caja abierta.');
      }
      
      console.log(`📊 Calculando totales para caja ID: ${cajaActiva.id}`);
      const { 
        totalVentas, 
        totalCobros,
        totalCobrosDelDia,
        totalCobrosPendientes,
        totalGastos, 
        totalPrendas, 
        prendasDevueltas,
        devolucionesRealizadas,
        cobrosPorMetodo,
        cobrosDelDiaPorMetodo,
        cobrosPendientesPorMetodo,
        pendientesPorMetodo,
        gastosPorMetodo,
        reembolsosPorMetodo,
        balancePorMetodo,
        ventasConCupon,
        ventasConTicketCambio,
        totalDescuentos,
        montoInicial
      } = await CajaHelpers.calcularTotalesCaja(qr.manager, cajaActiva);
      
      const montoFinalCalculado = balancePorMetodo?.total || montoInicial || 0;
      
      console.log(`💰 Resultado del cálculo:
        - Monto inicial: $${cajaActiva.monto_inicial}
        - Total ventas: $${totalVentas}
        - Total cobros: $${totalCobros}
        - Total cobros del día: $${totalCobrosDelDia || 0}
        - Total cobros pendientes: $${totalCobrosPendientes || 0}
        - Total gastos: $${totalGastos}
        - Total prendas vendidas: ${totalPrendas}
        - Total prendas devueltas: ${prendasDevueltas || 0}
        - Devoluciones realizadas: ${devolucionesRealizadas || 0}
        - Ventas con cupón: ${ventasConCupon || 0}
        - Ventas con ticket cambio: ${ventasConTicketCambio || 0}
        - Total descuentos: $${totalDescuentos || 0}
        - Monto final calculado: $${montoFinalCalculado}`);
      
      const movimientos = await CajaHelpers.listarMovimientos(qr.manager, cajaActiva.id);
      console.log(`📝 Total movimientos: ${movimientos.length}`);

      const totales = {
        ventas: totalVentas || 0,
        totalPrendas: totalPrendas || 0,
        prendasDevueltas: prendasDevueltas || 0,
        devolucionesRealizadas: devolucionesRealizadas || 0,
        cobros: totalCobros || 0,
        cobrosDelDia: totalCobrosDelDia || 0,
        cobrosPendientes: totalCobrosPendientes || 0,
        gastos: totalGastos || 0,
        cobrosPorMetodo: cobrosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobrosDelDiaPorMetodo: cobrosDelDiaPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobrosPendientesPorMetodo: cobrosPendientesPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        pendientesPorMetodo: pendientesPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        gastosPorMetodo: gastosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        reembolsosPorMetodo: reembolsosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        balancePorMetodo: balancePorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0, total: 0 },
        ventasConCupon: ventasConCupon || 0,
        ventasConTicketCambio: ventasConTicketCambio || 0,
        totalDescuentos: totalDescuentos || 0,
        saldo_calculado: montoFinalCalculado || 0,
      };
      
      if (!totales.balancePorMetodo || typeof totales.balancePorMetodo.efectivo === 'undefined') {
        console.warn('⚠️ El campo balancePorMetodo.efectivo no está definido. Se usará valor por defecto.');
        totales.balancePorMetodo = {
          efectivo: montoInicial || 0,
          tarjeta: 0,
          transferencia: 0,
          total: montoInicial || 0
        };
      }
      
      totales.balanceFinal = totales.balancePorMetodo;
      
      console.log('✅ Totales construidos para caja (resumen):', {
        ventas: totales.ventas,
        cobros: totales.cobros,
        gastos: totales.gastos,
        efectivo: totales.balancePorMetodo?.efectivo,
        total: totales.balancePorMetodo?.total,
      });
      
      
      return {
        caja: {
          id: cajaActiva.id,
          fecha_apertura: cajaActiva.fecha_apertura,
          monto_inicial: cajaActiva.monto_inicial,
        },
        totales,
        movimientos,
      };
    } catch (error) {
      console.error(`❌ Error al obtener resumen de caja: ${error.message}`, error);
      throw error;
    } finally {
      await qr.release();
    }
  },

  async obtenerCajaPorFecha(usuario_id, fecha) {
    console.log(`🔍 Consultando caja por fecha: ${fecha} para usuario: ${usuario_id}`);
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    try {
      const inicio = new Date(fecha);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fecha);
      fin.setHours(23, 59, 59, 999);
    const sesiones = await qr.manager.find(CajaSesion, {
        where: { usuario: { id: usuario_id }, fecha_apertura: Between(inicio, fin) },
        relations: ['estado', 'usuario'],
        order: { fecha_apertura: 'DESC' },
      });
      
      if (!sesiones.length) {
        console.log(`⚠️ No se encontraron cajas para la fecha ${fecha}`);
        return {
          state: "Empty",
          message: `No hay registros de caja para la fecha ${fecha}`,
          data: null
        };
      }
      
      console.log(`✅ Encontradas ${sesiones.length} sesiones de caja`);
      
      const cajasConResumen = await Promise.all(
        sesiones.map(async (sesion) => {
          const cajaDatos = {
            id: sesion.id,
            fecha_apertura: sesion.fecha_apertura,
            fecha_cierre: sesion.fecha_cierre,
            monto_inicial: sesion.monto_inicial,
            monto_final: sesion.monto_final,
            observacion_cierre: sesion.observacion_cierre,
            estado: sesion.estado.nombre_estado,
            usuario: sesion.usuario.nombre,
          };
          
          if (sesion.estado.nombre_estado === ESTADOS_CAJA.CERRADA && !sesion.resumen_final) {
            console.warn(`⚠️ Caja cerrada ID ${sesion.id} no tiene un resumen_final guardado`);
            return {
              ...cajaDatos,
              resumen_final: null,
              warning: "Esta caja fue cerrada sin guardar un snapshot completo"
            };
          }
          if (sesion.resumen_final) {
            console.log(`📊 Caja ID ${sesion.id} tiene snapshot guardado`);
            return {
              ...cajaDatos,
              resumen_final: sesion.resumen_final
            };
          }
          
          return {
            ...cajaDatos,
            resumen_final: null,
            warning: sesion.estado.nombre_estado === ESTADOS_CAJA.ABIERTA 
              ? "Esta caja está abierta y no tiene un snapshot final" 
              : "No hay snapshot disponible para esta caja"
          };
        })
      );
      
      return {
        state: "Success",
        data: cajasConResumen,
        fecha: fecha
      };
    } catch (error) {
      console.error(`❌ Error al obtener caja por fecha: ${error.message}`, error);
      throw error;
    } finally {
      await qr.release();
    }
  },

  async verificarCajaActiva(usuario_id) {
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    try {
      const cajaActiva = await CajaHelpers.obtenerCajaActiva(qr.manager, usuario_id);
      return !!cajaActiva;
    } finally {
      await qr.release();
    }
  },

  async cerrarCaja(usuario_id, monto_declarado, observacion = '') {
    console.log(`🔔 CIERRE DE CAJA - Usuario: ${usuario_id}, Monto declarado: $${monto_declarado || 'no especificado'}`);
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const cajaActiva = await CajaHelpers.obtenerCajaActiva(qr.manager, usuario_id);
      if (!cajaActiva) {
        console.log(`⚠️ Error: No hay caja abierta para usuario ${usuario_id}`);
        throw new Error('No tienes caja abierta.');
      }
      
      console.log(`📊 Calculando totales finales para cierre de caja ID: ${cajaActiva.id}`);
      console.log('📦 Generando snapshot final completo de la caja...');
      const resumenCompleto = await CajaHelpers.calcularTotalesCaja(qr.manager, cajaActiva);
      
      const { 
        totalVentas, 
        totalCobros, 
        totalGastos, 
        totalPrendas, 
        prendasDevueltas,
        devolucionesRealizadas,
        cobrosPorMetodo, 
        cobrosDelDiaPorMetodo,
        cobrosPendientesPorMetodo,
        totalCobrosDelDia,
        totalCobrosPendientes,
        gastosPorMetodo,
        reembolsosPorMetodo,
        balancePorMetodo,
        pendientesPorMetodo,
        ventasConCupon,
        ventasConTicketCambio,
        totalDescuentos,
        montoInicial
      } = resumenCompleto;
      const montoFinalCalculado = balancePorMetodo?.total || montoInicial || 0;
      
      console.log(`💰 Resultado del cálculo final:
        - Fecha apertura: ${cajaActiva.fecha_apertura}
        - Monto inicial: $${cajaActiva.monto_inicial}
        - Total ventas: $${totalVentas}
        - Total cobros: $${totalCobros}
        - Total cobros del día: $${totalCobrosDelDia || 0}
        - Total cobros ventas pendientes: $${totalCobrosPendientes || 0}
        - Total gastos: $${totalGastos}
        - Total prendas vendidas: ${totalPrendas || 0}
        - Total prendas devueltas: ${prendasDevueltas || 0}
        - Devoluciones realizadas: ${devolucionesRealizadas || 0}
        - Ventas con cupón: ${ventasConCupon || 0}
        - Ventas con ticket cambio: ${ventasConTicketCambio || 0}
        - Total descuentos: $${totalDescuentos || 0}
        - Monto final calculado: $${montoFinalCalculado}
        - Monto final declarado: $${monto_declarado || montoFinalCalculado}`);

      const estadoCerrada = await CajaHelpers.obtenerEstado(qr.manager, ESTADOS_CAJA.CERRADA);
      
      // Crear objeto para ResumenCaja
      const resumenParaGuardar = {
        caja_sesion: { id: cajaActiva.id },
        usuario: { id: usuario_id },
        fecha_apertura: cajaActiva.fecha_apertura,
        fecha_cierre: new Date(),
        monto_inicial: Number(cajaActiva.monto_inicial) || 0,
        monto_final_calculado: montoFinalCalculado,
        monto_final_declarado: monto_declarado ?? montoFinalCalculado,
        diferencia: (monto_declarado ?? montoFinalCalculado) - montoFinalCalculado,
        total_ventas: totalVentas || 0,
        total_prendas: totalPrendas || 0,
        prendas_devueltas: prendasDevueltas || 0,
        devoluciones_realizadas: devolucionesRealizadas || 0,
        total_cobros: totalCobros || 0,
        total_cobros_del_dia: totalCobrosDelDia || 0,
        total_cobros_pendientes: totalCobrosPendientes || 0,
        total_gastos: totalGastos || 0,
        total_descuentos: totalDescuentos || 0,
        cobros_por_metodo: cobrosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobros_del_dia_por_metodo: cobrosDelDiaPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobros_pendientes_por_metodo: cobrosPendientesPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        pendientes_por_metodo: pendientesPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        gastos_por_metodo: gastosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        reembolsos_por_metodo: reembolsosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        balance_por_metodo: balancePorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0, total: 0 },
        ventas_con_cupon: ventasConCupon || 0,
        ventas_con_ticket_cambio: ventasConTicketCambio || 0,
        observacion: observacion || '',
        timestamp_cierre: new Date().toISOString()
      };

      // Guardar en la tabla ResumenCaja
      console.log('📊 Guardando el resumen de caja en la nueva entidad ResumenCaja...');
      await qr.manager.save(ResumenCaja, resumenParaGuardar);
      
      cajaActiva.fecha_cierre = new Date();
      cajaActiva.monto_final = monto_declarado ?? montoFinalCalculado;
      cajaActiva.observacion_cierre = observacion;
      cajaActiva.estado = estadoCerrada; 
      
      // Ya no guardamos el snapshot en resumen_final
      // cajaActiva.resumen_final = snapshotFinal;
      
      await qr.manager.save(CajaSesion, cajaActiva);
      
      const cajaVerificacion = await qr.manager.findOne(CajaSesion, {
        where: { id: cajaActiva.id },
        relations: ['estado']
      });
      
      if (cajaVerificacion.estado.nombre_estado !== ESTADOS_CAJA.CERRADA) {
        console.error(`⚠️ ERROR CRÍTICO: La caja ID ${cajaActiva.id} no se actualizó correctamente a estado 'cerrada'`);
        throw new Error('Error al actualizar el estado de la caja a cerrada');
      }
      
      console.log(`✅ Caja cerrada exitosamente - ID: ${cajaActiva.id}, Estado: ${cajaVerificacion.estado.nombre_estado}, Fecha cierre: ${cajaActiva.fecha_cierre}`);
      console.log('✅ Resumen final guardado en la entidad ResumenCaja');
      
      const diferencia = (monto_declarado ?? montoFinalCalculado) - montoFinalCalculado;
      if (Math.abs(diferencia) > 1) {
        console.log(`⚖️ Registrando ajuste por diferencia de $${diferencia} (${diferencia < 0 ? 'faltante' : 'sobrante'})`);
        
        const ajuste = {
          monto: Math.abs(diferencia),
          motivo: `Ajuste por cierre (${diferencia < 0 ? 'faltante' : 'sobrante'}).`,
          tipo: 'ajuste',
          caja_sesion: { id: cajaActiva.id },
          usuario: { id: usuario_id },
        };
        await qr.manager.insert(Gasto, ajuste);
      }

      await qr.commitTransaction();
      return {
        caja: {
          id: cajaActiva.id,
          fecha_apertura: cajaActiva.fecha_apertura,
          fecha_cierre: cajaActiva.fecha_cierre,
          monto_inicial: cajaActiva.monto_inicial,
          monto_final: cajaActiva.monto_final,
          observacion_cierre: cajaActiva.observacion_cierre
        },
        totales: {
          ventas: totalVentas,
          cobros: totalCobros,
          cobrosDelDia: totalCobrosDelDia || 0,
          cobrosPendientes: totalCobrosPendientes || 0,
          gastos: totalGastos,
          saldo_calculado: montoFinalCalculado,
          monto_declarado: monto_declarado ?? montoFinalCalculado,
          diferencia,
        },
      };
    } catch (e) {
      console.log(`❌ Error al cerrar caja: ${e.message}`);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  },

  async obtenerDetalleCajaActiva(usuario_id) {
    console.log(`🔍 Obteniendo detalle completo de caja activa para usuario: ${usuario_id}`);
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    try {
      const cajaActiva = await CajaHelpers.obtenerCajaActiva(qr.manager, usuario_id);
      if (!cajaActiva) {
        console.log(`⚠️ No hay caja abierta para usuario: ${usuario_id}`);
        return null;
      }
      const { totalVentas, totalCobros, totalGastos, montoFinalCalculado } =
        await CajaHelpers.calcularTotalesCaja(qr.manager, cajaActiva);
      
      console.log(`💰 Detalle de caja activa ID ${cajaActiva.id}:
        - Monto inicial: $${cajaActiva.monto_inicial}
        - Total ventas: $${totalVentas || 0}
        - Total cobros: $${JSON.stringify(totalCobros) || 0}
        - Total gastos: $${totalGastos || 0}
        - Balance actual: $${montoFinalCalculado || cajaActiva.monto_inicial}`);
      
      return {
        id: cajaActiva.id,
        fecha_apertura: cajaActiva.fecha_apertura,
        monto_inicial: cajaActiva.monto_inicial,
        usuario_id: usuario_id,
        totales: {
          ventas: totalVentas || 0,
          cobros: totalCobros || {},
          gastos: totalGastos || 0,
          balance_actual: montoFinalCalculado || cajaActiva.monto_inicial
        }
      };
    } catch (error) {
      console.error(`❌ Error obteniendo detalle de caja activa: ${error.message}`);
      throw error;
    } finally {
      await qr.release();
    }
  },

  async obtenerHistoricoCajas() {
    console.log('🔍 Obteniendo histórico de cajas desde la nueva entidad ResumenCaja');
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    try {
      const historicos = await qr.manager.find(ResumenCaja, { 
        relations: ['caja_sesion', 'usuario'],
        order: { fecha_cierre: 'DESC' } 
      });
      
      console.log(`✅ Se encontraron ${historicos.length} registros históricos de caja`);
      
      return historicos.map(r => ({
        id: r.id,
        caja_sesion_id: r.caja_sesion?.id,
        usuario: r.usuario?.nombre || r.usuario?.email || 'Desconocido',
        fecha_apertura: r.fecha_apertura,
        fecha_cierre: r.fecha_cierre,
        monto_inicial: r.monto_inicial,
        monto_final_calculado: r.monto_final_calculado,
        monto_final_declarado: r.monto_final_declarado,
        diferencia: r.diferencia,
        total_ventas: r.total_ventas,
        total_prendas: r.total_prendas,
        prendas_devueltas: r.prendas_devueltas,
        total_cobros: r.total_cobros,
        total_cobros_del_dia: r.total_cobros_del_dia,
        total_cobros_pendientes: r.total_cobros_pendientes,
        total_gastos: r.total_gastos,
        cobros_por_metodo: r.cobros_por_metodo,
        balance_por_metodo: r.balance_por_metodo,
        observacion: r.observacion,
        cerrada_automaticamente: r.cerrada_automaticamente || false
      }));
    } catch (error) {
      console.error(`❌ Error al obtener histórico de cajas: ${error.message}`, error);
      throw error;
    } finally {
      await qr.release();
    }
  },

  async cerrarCajaAutomaticamente(caja_id) {
    console.log(`🔔 CIERRE AUTOMÁTICO DE CAJA - ID: ${caja_id}`);
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // Obtener la caja por ID
      const caja = await qr.manager.findOne(CajaSesion, {
        where: { id: caja_id },
        relations: ['estado', 'usuario']
      });
      
      if (!caja) {
        console.log(`⚠️ Error: No se encontró la caja con ID ${caja_id}`);
        throw new Error(`Caja con ID ${caja_id} no encontrada.`);
      }
      
      if (caja.estado.nombre_estado !== ESTADOS_CAJA.ABIERTA) {
        console.log(`⚠️ La caja ID ${caja_id} no está en estado abierta (estado actual: ${caja.estado.nombre_estado})`);
        throw new Error('La caja no está en estado abierta.');
      }
      
      console.log(`📊 Calculando totales finales para cierre automático de caja ID: ${caja.id}`);
      const resumenCompleto = await CajaHelpers.calcularTotalesCaja(qr.manager, caja);
      
      const { 
        totalVentas, 
        totalCobros, 
        totalGastos, 
        totalPrendas, 
        prendasDevueltas,
        devolucionesRealizadas,
        cobrosPorMetodo, 
        cobrosDelDiaPorMetodo,
        cobrosPendientesPorMetodo,
        totalCobrosDelDia,
        totalCobrosPendientes,
        gastosPorMetodo,
        reembolsosPorMetodo,
        balancePorMetodo,
        pendientesPorMetodo,
        ventasConCupon,
        ventasConTicketCambio,
        totalDescuentos,
        montoInicial
      } = resumenCompleto;
      const montoFinalCalculado = balancePorMetodo?.total || montoInicial || 0;
      
      console.log(`💰 Resultado del cálculo final (cierre automático):
        - Fecha apertura: ${caja.fecha_apertura}
        - Monto inicial: $${caja.monto_inicial}
        - Total ventas: $${totalVentas || 0}
        - Total cobros: $${totalCobros || 0}
        - Monto final calculado: $${montoFinalCalculado}`);
      
      const estadoCerrada = await CajaHelpers.obtenerEstado(qr.manager, ESTADOS_CAJA.CERRADA);
      const observacion = "Cierre automático generado por el sistema.";
      
      // Crear objeto para ResumenCaja
      const resumenParaGuardar = {
        caja_sesion: { id: caja.id },
        usuario: { id: caja.usuario.id },
        fecha_apertura: caja.fecha_apertura,
        fecha_cierre: new Date(),
        monto_inicial: Number(caja.monto_inicial) || 0,
        monto_final_calculado: montoFinalCalculado,
        monto_final_declarado: montoFinalCalculado, // Mismo valor que el calculado
        diferencia: 0, // No hay diferencia en el cierre automático
        total_ventas: totalVentas || 0,
        total_prendas: totalPrendas || 0,
        prendas_devueltas: prendasDevueltas || 0,
        devoluciones_realizadas: devolucionesRealizadas || 0,
        total_cobros: totalCobros || 0,
        total_cobros_del_dia: totalCobrosDelDia || 0,
        total_cobros_pendientes: totalCobrosPendientes || 0,
        total_gastos: totalGastos || 0,
        total_descuentos: totalDescuentos || 0,
        cobros_por_metodo: cobrosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobros_del_dia_por_metodo: cobrosDelDiaPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        cobros_pendientes_por_metodo: cobrosPendientesPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        pendientes_por_metodo: pendientesPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        gastos_por_metodo: gastosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        reembolsos_por_metodo: reembolsosPorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0 },
        balance_por_metodo: balancePorMetodo || { efectivo: 0, tarjeta: 0, transferencia: 0, total: 0 },
        ventas_con_cupon: ventasConCupon || 0,
        ventas_con_ticket_cambio: ventasConTicketCambio || 0,
        observacion: observacion,
        cerrada_automaticamente: true, // Marcamos como cierre automático
        timestamp_cierre: new Date().toISOString()
      };
      
      // Guardar en la tabla ResumenCaja
      console.log('📊 Guardando el resumen de caja automático en la entidad ResumenCaja...');
      await qr.manager.save(ResumenCaja, resumenParaGuardar);
      
      // Actualizar la caja
      caja.fecha_cierre = new Date();
      caja.monto_final = montoFinalCalculado;
      caja.observacion_cierre = observacion;
      caja.estado = estadoCerrada;
      
      await qr.manager.save(CajaSesion, caja);
      
      // Verificar que se haya actualizado correctamente
      const cajaVerificacion = await qr.manager.findOne(CajaSesion, {
        where: { id: caja.id },
        relations: ['estado']
      });
      
      if (cajaVerificacion.estado.nombre_estado !== ESTADOS_CAJA.CERRADA) {
        console.error(`⚠️ ERROR CRÍTICO: La caja ID ${caja.id} no se actualizó correctamente a estado 'cerrada'`);
        throw new Error('Error al actualizar el estado de la caja a cerrada');
      }
      
      console.log(`✅ Caja cerrada automáticamente - ID: ${caja.id}, Estado: ${cajaVerificacion.estado.nombre_estado}, Fecha cierre: ${caja.fecha_cierre}`);
      
      await qr.commitTransaction();
      return {
        caja_id: caja.id,
        fecha_apertura: caja.fecha_apertura,
        fecha_cierre: caja.fecha_cierre,
        monto_inicial: caja.monto_inicial,
        monto_final: caja.monto_final,
        observacion_cierre: caja.observacion_cierre,
        cerrada_automaticamente: true
      };
    } catch (error) {
      console.log(`❌ Error al cerrar caja automáticamente: ${error.message}`);
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  },
};

export default CajaService;
