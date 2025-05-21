import AppDataSource from '../config/ConfigDB.js';
import VentaHelpers from '../helpers/venta.helpers.js';
import CuponHelper from '../helpers/cupon.helpers.js';
import HelperServices from './helpers.services.js';
import FinancierosHelpers from '../helpers/financieros.helpers.js';
import { Prenda, Estado, Usuario, Venta, Cobro } from '../entities/index.js';
import ResumenVentasService from '../services/ResumenVentasService.js';

const VentaService = {
  async crearVenta({
    tipo_venta,
    usuario_id,
    detalle,
    cliente = null,
    pago = {},
    cupon = null,
    generar_ticket_cambio
  }) {
    
    const generarTicket = generar_ticket_cambio === true;
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const { estadoDisponible, estadoVendida } = await VentaHelpers.obtenerEstados(qr.manager);

 
      const detalleReal = await Promise.all(
        detalle.map(async item => {
          const pr = await qr.manager.findOne(Prenda, {
            where: { codigo_barra_prenda: item.codigo_barra },
            relations: ['categoria']
          });
          if (!pr) throw new Error(`Prenda ${item.codigo_barra} no encontrada`);
          return { ...item, precio: pr.precio, categoria: pr.categoria };
        })
      );

      for (const item of detalleReal) {
        const pr = await qr.manager.findOne(Prenda, { where: { codigo_barra_prenda: item.codigo_barra } });
        if (!pr || pr.cantidad < item.cantidad) {
          throw new Error(`Stock insuficiente para ${item.codigo_barra}`);
        }
      }

      let descTotal = 0, motivo = null, cuponEntity = null;
      let detallesProc = detalleReal;
      if (cupon) {
        const res = await CuponHelper.validarYAplicarCupon({
          cuponCodigo: cupon,
          prendas: detalleReal,
          manager: qr.manager
        });
        detallesProc = res.items;
        descTotal = res.descuentoTotal;
        motivo = `Cupón ${res.cupon.codigo}`;
        cuponEntity = res.cupon;
      }
      const bruto = FinancierosHelpers.calcularMontoBruto(detallesProc.map(item => ({
        cantidad: item.cantidad,
        costo_unitario_venta: item.precio
      })));
      const descuentoManual = FinancierosHelpers.calcularDescuentos(detallesProc.map(item => ({
        descuento: item.descuento || 0
      })));
      const neto = FinancierosHelpers.calcularMontoNeto(bruto, descuentoManual + (descTotal || 0));
      
      const pagado = FinancierosHelpers.calcularTotalPagado(pago);
      const saldoPend = FinancierosHelpers.calcularSaldoPendiente(neto, pagado);
      
      let estadoPago = 'pagada';

      if (tipo_venta === 'credito') {
        if (saldoPend > 0) {
          estadoPago = 'pendiente';
        }
      } else {
        if (pagado !== neto) {
          throw new Error(`Pagos (${pagado}) no coinciden con total (${neto})`);
        }
      }

      if (cupon && saldoPend > 0) {
        throw new Error('No se puede aplicar cupón sin pago completo');
      }

      const estPagoEnt = await qr.manager.findOne(Estado, { where: { nombre_estado: estadoPago } });
      if (!estPagoEnt) throw new Error(`Estado de pago "${estadoPago}" no existe`);

      let cliEnt = null;
      if ((tipo_venta === 'credito' || saldoPend > 0) && cliente?.nombre) {
        cliEnt = await VentaHelpers.crearClientePendiente(qr.manager, cliente);
      }

      let codCamb = null;
      if (!cupon && generarTicket) {
        codCamb = await HelperServices.generateBarCodeCambio();
        console.log(`✅ Generando ticket de cambio: ${codCamb}`);
      } else {
        console.log(`❌ No se genera ticket de cambio. Valor: ${generarTicket}, Tiene cupón: ${!!cupon}`);
      }
      const cajaSesion = await qr.manager.findOne('caja_sesion', {
        where: { usuario: { id: usuario_id }, estado: { nombre_estado: 'abierta' } },
        relations: ['estado']
      });
      if (!cajaSesion) throw new Error('El usuario no tiene una caja abierta');
      
      const ventaEntity = await VentaHelpers.crearVentaEntity(qr.manager, {
        caja_sesion: { id: cajaSesion.id },
        tipo_venta,
        total_venta: neto,
        saldo_pendiente: saldoPend,
        estado_pago: estPagoEnt,
        cliente: cliEnt,
        cupon: cuponEntity,
        usuario: { id: usuario_id },
        codigo_cambio: codCamb
      });

      for (const item of detallesProc) {
        await VentaHelpers.procesarItemVenta({
          item,
          manager: qr.manager,
          ventaEntity,
          estadoDisponible,
          estadoVendida,
          usuario_id,
          totalBruto: bruto,
          descuento_total: descTotal,
          motivo_descuento: motivo
        });
      }

        await VentaHelpers.registrarCobros(
          qr.manager,
          ventaEntity,
          pago,
          usuario_id,
          cajaSesion.id      
          );        const fechaVenta = ventaEntity.fecha_venta.toISOString().slice(0, 10);
        
        const categorias = {};
        detallesProc.forEach(detalle => {
          const categoria = detalle.categoria?.nombre_categoria || 'Sin categoría';
          const cantidad = detalle.cantidad || 0;
          const precioUnitario = detalle.precio || 0;
          const descuento = detalle.descuento || 0;
          const monto = (precioUnitario * cantidad) - descuento;
          
          if (!categorias[categoria]) {
            categorias[categoria] = { cantidad: 0, monto: 0 };
          }
          
          categorias[categoria].cantidad += cantidad;
          categorias[categoria].monto += monto;
        });
        
        await ResumenVentasService.actualizarResumenDelDia(
          qr.manager,
          fechaVenta,
          {
            total:           ventaEntity.total_venta,
            descuento_total: descTotal + descuentoManual,
            metodo_pago:     FinancierosHelpers.detectarMetodoPago(pago),
            total_prendas:   detallesProc.reduce((sum, d) => sum + d.cantidad, 0),
            es_credito:      estadoPago === 'pendiente',
            categorias:      categorias // Incluimos la información de categorías
          }
        );
        await qr.commitTransaction();

    const detallesVenta = detallesProc.map(item => ({
      codigo_barra: item.codigo_barra,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      descuento: item.descuento || 0
    }));

    return {
      venta_id: ventaEntity.id,
      codigo_cambio: ventaEntity.codigo_cambio,
      total_venta: ventaEntity.total_venta,
      pagado,
      saldo_pendiente: saldoPend,
      tipo_venta,
      cliente: cliEnt,
      estado_pago: estPagoEnt.nombre_estado,
      fecha_venta: ventaEntity.fecha_venta,
      detalle: detallesVenta 
    };

    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  },
  async validarPrendaParaVenta(manager, codigo_barra) {
    const estadoDisponible = await manager.findOne(Estado, {
      where: { nombre_estado: 'disponible' },
    });
  
    if (!estadoDisponible) {
      throw new Error('Estado "disponible" no encontrado.');
    }
  
    const prendasDisponibles = await manager.find(Prenda, {
      where: {
        codigo_barra_prenda: codigo_barra,
        estado: { id: estadoDisponible.id },
        
      },
      relations: ['estado', 'categoria'],
    });
  
    if (!prendasDisponibles || prendasDisponibles.length === 0) {
      throw new Error('La prenda ya fue vendida o no está disponible.');
    }
  
    const prenda = prendasDisponibles[0];
  
    if (!prenda.precio || Number(prenda.precio) <= 0) {
      throw new Error('La prenda no tiene un precio válido.');
    }
  
    return prenda;
  },
  async resumenDiario({ fecha, page = 1, limit = 50 }) {
    const manager = AppDataSource.manager;
    const offset = (page - 1) * limit;
    
    return VentaHelpers.resumenDiario(manager, fecha, { limit, offset });
  },
  
  async validarCodigoCambio(codigo) {
    if (!codigo || !codigo.startsWith('TCC')) {
      throw new Error('Código de cambio inválido. Debe comenzar con TCC.');
    }
    
    try {
      const venta = await AppDataSource.getRepository(Venta).findOne({
        where: { codigo_cambio: codigo },
        relations: ['detallesVenta', 'detallesVenta.prenda', 'detallesVenta.prenda.categoria', 'usuario', 'cliente', 'estado_pago']
      });
      
      if (!venta) {
        throw new Error(`No se encontró ninguna venta con el código de cambio ${codigo}.`);
      }
      
      if (!venta.detallesVenta || !venta.detallesVenta.length) {
        throw new Error(`La venta con código ${codigo} no tiene detalles asociados.`);
      }
      
      
      return {
        id: venta.id,
        fecha_venta: venta.fecha_venta,
        total_venta: venta.total_venta,
        tipo_venta: venta.tipo_venta,
        estado_pago: venta.estado_pago.nombre_estado,
        cliente: venta.cliente ? {
          id: venta.cliente.id,
          nombre: venta.cliente.nombre,
          telefono: venta.cliente.telefono
        } : null,
        detalle: venta.detallesVenta.map(detalle => ({
          id: detalle.id,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.costo_unitario_venta,
          descuento: detalle.descuento,
          categoria: detalle.prenda.categoria?.nombre_categoria || 'Sin categoría',
          codigo_barra: detalle.prenda.codigo_barra_prenda
        }))
      };
    } catch (error) {
      console.error('Error al validar código de cambio:', error);
      throw new Error(error.message || 'Error al validar el código de cambio.');
    }
  },

  async obtenerVentasPendientes() {
    try {
      const ventaRepo = AppDataSource.getRepository(Venta);
      
      const ventasPendientes = await ventaRepo.find({
        where: {
          saldo_pendiente: ventaRepo.createQueryBuilder().where('saldo_pendiente > 0'),
          estado_pago: { nombre_estado: 'pendiente' }
        },
        relations: ['cliente', 'estado_pago'],
        order: { fecha_venta: 'DESC' }
      });

      return ventasPendientes.map(venta => ({
        id: venta.id,
        fecha_venta: venta.fecha_venta,
        total_venta: parseFloat(venta.total_venta),
        saldo_pendiente: parseFloat(venta.saldo_pendiente),
        tipo_venta: venta.tipo_venta,
        cliente: venta.cliente ? {
          id: venta.cliente.id,
          nombre: venta.cliente.nombre,
          telefono: venta.cliente.telefono || 'Sin teléfono'
        } : null
      }));
    } catch (error) {
      console.error('Error al obtener ventas pendientes:', error);
      throw new Error('No se pudieron obtener las ventas pendientes: ' + error.message);
    }
  },


  async registrarCobro({ venta_id, monto, metodo_pago, usuario_id }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ventaRepo = queryRunner.manager.getRepository(Venta);
      const venta = await ventaRepo.findOne({ 
        where: { id: venta_id },
        relations: ['estado_pago', 'cliente']
      });

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      if (parseFloat(venta.saldo_pendiente) <= 0) {
        throw new Error('Esta venta ya fue pagada completamente');
      }

      const montoCobro = parseFloat(monto);
      if (montoCobro <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      if (montoCobro > parseFloat(venta.saldo_pendiente)) {
        throw new Error(`El monto no puede ser mayor al saldo pendiente (${venta.saldo_pendiente})`);
      }

      const cajaSesion = await queryRunner.manager.findOne('caja_sesion', {
        where: { usuario: { id: usuario_id }, estado: { nombre_estado: 'abierta' } }
      });
      
      if (!cajaSesion) {
        throw new Error('El usuario no tiene una caja abierta');
      }

      const metodoPagoRepo = queryRunner.manager.getRepository('metodo_pago');
      const metodoPagoEntity = await metodoPagoRepo.findOne({
        where: { nombre_metodo: metodo_pago }
      });

      if (!metodoPagoEntity) {
        throw new Error(`Método de pago "${metodo_pago}" no encontrado`);
      }

      const cobroEntity = queryRunner.manager.create(Cobro, {
        monto: montoCobro,
        venta: { id: venta_id },
        usuario: { id: usuario_id },
        metodoPago: metodoPagoEntity,
        caja_sesion: cajaSesion
      });

      await queryRunner.manager.save(cobroEntity);

      await queryRunner.manager.save(Movimiento, {
        accion: 'cobro_venta',
        cantidad: montoCobro,
        observacion: `Cobro de venta #${venta_id}`,
        caja_sesion: cajaSesion,
        usuario: { id: usuario_id }
      });

      const nuevoSaldo = FinancierosHelpers.calcularSaldoPendiente(
        parseFloat(venta.saldo_pendiente), 
        montoCobro
      );
      venta.saldo_pendiente = nuevoSaldo;

      if (nuevoSaldo <= 0) {
        const estadoPagada = await queryRunner.manager.findOne(Estado, {
          where: { nombre_estado: 'pagada' }
        });
        
        if (!estadoPagada) {
          throw new Error('Estado "pagada" no encontrado');
        }
        
        venta.estado_pago = estadoPagada;
        venta.saldo_pendiente = 0; 
      }

      await queryRunner.manager.save(venta);
      
      await queryRunner.commitTransaction();
      
      return {
        id: cobroEntity.id,
        monto: montoCobro,
        fecha_cobro: cobroEntity.fecha_cobro,
        metodo_pago: metodo_pago,
        venta_id: venta_id,
        saldo_actualizado: nuevoSaldo,
        estado_actual: nuevoSaldo <= 0 ? 'pagada' : 'pendiente'
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al registrar cobro:', error);
      throw new Error(error.message || 'Error al registrar el cobro');
    } finally {
      await queryRunner.release();
    }
  },

  /**
   * Obtiene un resumen de ventas de los últimos días
   * @param {number} dias - Número de días a consultar (por defecto: 7)
   * @returns {Promise<Array>} - Resumen de ventas por día
   */  async obtenerResumenUltimosDias(dias = 7) {
    try {
      // Vamos a utilizar la tabla de resumen para un acceso rápido a los datos
      return await ResumenVentasService.obtenerResumenUltimosDias(null, dias);
    } catch (error) {
      console.error('Error al obtener resumen de últimos días:', error);
      throw new Error('No se pudo obtener el resumen de ventas');
    }
  },
  
  /**
   * Obtiene un resumen consolidado para un rango de fechas
   * @param {string} fechaInicio - Fecha de inicio en formato 'YYYY-MM-DD'
   * @param {string} fechaFin - Fecha de fin en formato 'YYYY-MM-DD'
   * @returns {Promise<Object>} - Objeto con el resumen consolidado
   */  async obtenerResumenPorRango(fechaInicio, fechaFin) {
    try {
      return await ResumenVentasService.obtenerResumenPorRango(null, fechaInicio, fechaFin);
    } catch (error) {
      console.error('Error al obtener resumen por rango:', error);
      throw new Error('No se pudo obtener el resumen por rango');
    }
  },
  
  /**
   * Obtiene estadísticas de ventas agrupadas por día de la semana
   * @param {number} semanas - Número de semanas a considerar (por defecto: 4)
   * @returns {Promise<Array>} - Estadísticas por día de la semana
   */
  async obtenerResumenPorDiaSemana(semanas = 4) {
    try {
      return await ResumenVentasService.obtenerResumenPorDiaSemana(null, semanas);
    } catch (error) {
      console.error('Error al obtener resumen por día de semana:', error);
      throw new Error('No se pudo obtener el resumen por día de semana');
    }
  }
};

export default VentaService;
