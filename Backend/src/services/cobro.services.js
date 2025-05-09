// src/services/cobro.services.js
import AppDataSource from '../config/ConfigDB.js';
import { Venta, Cobro, Estado } from '../entities/index.js';

const CobroService = {

  async obtenerCobrosPorVenta(ventaId) {
    try {
      const cobros = await AppDataSource.getRepository(Cobro).find({
        where: { venta: { id: ventaId } },
        relations: ['usuario', 'metodoPago', 'caja_sesion'],
        order: { fecha_cobro: 'DESC' }
      });

      return cobros.map(cobro => ({
        id: cobro.id,
        monto: parseFloat(cobro.monto),
        fecha_cobro: cobro.fecha_cobro,
        metodo_pago: cobro.metodoPago?.nombre_metodo || 'No especificado',
        usuario: cobro.usuario ? {
          id: cobro.usuario.id,
          nombre: cobro.usuario.nombre
        } : null,
        caja: cobro.caja_sesion ? {
          id: cobro.caja_sesion.id,
          fecha_apertura: cobro.caja_sesion.fecha_apertura
        } : null
      }));
    } catch (error) {
      console.error('Error al obtener cobros por venta:', error);
      throw new Error('No se pudieron obtener los cobros: ' + error.message);
    }
  },


  async obtenerVentasPendientes() {
    try {
      const ventaRepo = AppDataSource.getRepository(Venta);
      
      const ventasPendientes = await ventaRepo
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.cliente', 'cliente')
        .leftJoinAndSelect('venta.estado_pago', 'estado_pago')
        .where('venta.saldo_pendiente > 0')
        .andWhere('estado_pago.nombre_estado = :estado', { estado: 'pendiente' })
        .orderBy('venta.fecha_venta', 'DESC')
        .getRawMany();

      return ventasPendientes.map(venta => ({
        id: venta.venta_id,
        fecha_venta: venta.venta_fecha_venta,
        total_venta: parseFloat(venta.venta_total_venta),
        saldo_pendiente: parseFloat(venta.venta_saldo_pendiente),
        tipo_venta: venta.venta_tipo_venta,
        cliente: venta.cliente_id ? {
          id: venta.cliente_id,
          nombre: venta.cliente_nombre,
          telefono: venta.cliente_telefono || 'Sin teléfono'
        } : null
      }));
    } catch (error) {
      console.error('Error al obtener ventas pendientes:', error);
      throw new Error('No se pudieron obtener las ventas pendientes: ' + error.message);
    }
  },


  async registrarCobro({ venta_id, monto, metodo_pago, usuario_id, caja_sesion_id = null }) {
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

      let cajaSesion = null;
      if (caja_sesion_id) {
        cajaSesion = await queryRunner.manager.findOne('caja_sesion', {
          where: { id: caja_sesion_id, estado: { nombre_estado: 'abierta' } }
        });
      } else {
        const usuario = await queryRunner.manager.findOne('usuario', {
          where: { id: usuario_id }
        });
        
        if (!usuario) {
          throw new Error(`Usuario con ID ${usuario_id} no encontrado`);
        }
        
        cajaSesion = await queryRunner.manager.findOne('caja_sesion', {
          where: { usuario: { id: usuario_id }, estado: { nombre_estado: 'abierta' } }
        });
      }
      
      const metodoPagoRepo = queryRunner.manager.getRepository('metodo_pago');
      const metodoPagoEntity = await metodoPagoRepo.findOne({
        where: { nombre_metodo: metodo_pago }
      });

      if (!metodoPagoEntity) {
        throw new Error(`Método de pago "${metodo_pago}" no encontrado`);
      }
      
      let usuarioEntity = null;
      if (usuario_id) {
        usuarioEntity = await queryRunner.manager.findOne('usuario', {
          where: { id: usuario_id }
        });
        
        if (!usuarioEntity) {
          throw new Error(`Usuario con ID ${usuario_id} no encontrado`);
        }
      }

      const cobroEntity = queryRunner.manager.create(Cobro, {
        monto: montoCobro,
        venta: venta, 
        usuario: usuarioEntity, 
        metodoPago: metodoPagoEntity, 
        caja_sesion: cajaSesion 
      });

      await queryRunner.manager.save(Cobro, cobroEntity);

      const nuevoSaldo = parseFloat(venta.saldo_pendiente) - montoCobro;
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

      await queryRunner.manager.save(Venta, venta);
      
      await queryRunner.commitTransaction();
      
      return {
        id: cobroEntity.id,
        monto: montoCobro,
        fecha_cobro: cobroEntity.fecha_cobro,
        metodo_pago: metodo_pago,
        venta_id: venta_id,
        caja_id: cajaSesion?.id || null,
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


  async obtenerResumenCobros(fechaInicio, fechaFin) {
    try {
      const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); 
      const fin = fechaFin || new Date();

      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);

      const cobroRepo = AppDataSource.getRepository(Cobro);

      const totalCobrado = await cobroRepo
        .createQueryBuilder("cobro")
        .where("cobro.fecha_cobro BETWEEN :inicio AND :fin", { inicio, fin })
        .select("SUM(cobro.monto)", "total")
        .getRawOne();


      const cobrosMetodo = await cobroRepo
        .createQueryBuilder("cobro")
        .innerJoin("cobro.metodoPago", "metodo")
        .where("cobro.fecha_cobro BETWEEN :inicio AND :fin", { inicio, fin })
        .select("metodo.nombre_metodo", "metodo")
        .addSelect("SUM(cobro.monto)", "total")
        .groupBy("metodo.nombre_metodo")
        .getRawMany();

      const cobrosPorDia = await cobroRepo
        .createQueryBuilder("cobro")
        .where("cobro.fecha_cobro BETWEEN :inicio AND :fin", { inicio, fin })
        .select("DATE(cobro.fecha_cobro)", "fecha")
        .addSelect("SUM(cobro.monto)", "total")
        .groupBy("DATE(cobro.fecha_cobro)")
        .orderBy("fecha", "ASC")
        .getRawMany();

      return {
        total: parseFloat(totalCobrado?.total || 0),
        por_metodo: cobrosMetodo.map(item => ({
          metodo: item.metodo,
          total: parseFloat(item.total)
        })),
        por_dia: cobrosPorDia.map(item => ({
          fecha: item.fecha,
          total: parseFloat(item.total)
        }))
      };
    } catch (error) {
      console.error('Error al obtener resumen de cobros:', error);
      throw new Error('No se pudo obtener el resumen de cobros: ' + error.message);
    }
  },


  async registrarCobroMultiple({ cliente_id, monto_total, metodo_pago, usuario_id, caja_sesion_id = null }) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cliente = await queryRunner.manager.findOne('cliente', {
        where: { id: cliente_id }
      });

      if (!cliente) {
        throw new Error(`Cliente con ID ${cliente_id} no encontrado`);
      }
      
      let usuarioEntity = null;
      if (usuario_id) {
        usuarioEntity = await queryRunner.manager.findOne('usuario', {
          where: { id: usuario_id }
        });
        
        if (!usuarioEntity) {
          throw new Error(`Usuario con ID ${usuario_id} no encontrado`);
        }
      }

      const ventasData = await queryRunner.manager
        .createQueryBuilder(Venta, 'venta')
        .leftJoinAndSelect('venta.estado_pago', 'estado')
        .where('venta.cliente_id = :clienteId', { clienteId: cliente_id })
        .andWhere('estado.nombre_estado = :estadoNombre', { estadoNombre: 'pendiente' })
        .andWhere('venta.saldo_pendiente > 0')
        .orderBy('venta.fecha_venta', 'ASC')
        .getMany();

      if (!ventasData.length) {
        throw new Error(`El cliente no tiene ventas pendientes de pago`);
      }
      
      const ventasPendientes = ventasData.map(venta => ({
        id: venta.id,
        saldo_pendiente: parseFloat(venta.saldo_pendiente),
        entity: venta 
      }));

      const deudaTotal = ventasPendientes.reduce(
        (sum, venta) => sum + venta.saldo_pendiente, 
        0
      );
      const montoAPagar = parseFloat(monto_total);
      if (montoAPagar <= 0) {
        throw new Error('El monto a pagar debe ser mayor a 0');
      }

      if (montoAPagar > deudaTotal) {
        throw new Error(`El monto a pagar (${montoAPagar}) no puede ser mayor al total adeudado (${deudaTotal})`);
      }

      let cajaSesion = null;
      if (caja_sesion_id) {
        cajaSesion = await queryRunner.manager.findOne('caja_sesion', {
          where: { id: caja_sesion_id, estado: { nombre_estado: 'abierta' } }
        });
        
        if (!cajaSesion) {
          throw new Error(`La caja con ID ${caja_sesion_id} no está abierta o no existe`);
        }
      } else {
        cajaSesion = await queryRunner.manager.findOne('caja_sesion', {
          where: { usuario: { id: usuario_id }, estado: { nombre_estado: 'abierta' } }
        });
      }

      const metodoPagoEntity = await queryRunner.manager.findOne('metodo_pago', {
        where: { nombre_metodo: metodo_pago }
      });

      if (!metodoPagoEntity) {
        throw new Error(`Método de pago "${metodo_pago}" no encontrado`);
      }
      const estadoPagada = await queryRunner.manager.findOne(Estado, {
        where: { nombre_estado: 'pagada' }
      });
      
      if (!estadoPagada) {
        throw new Error('Estado "pagada" no encontrado');
      }
      let montoRestante = montoAPagar;
      const cobrosRealizados = [];
      
      for (const ventaInfo of ventasPendientes) {
        if (montoRestante <= 0) break;
        
        const venta = ventaInfo.entity;
        const saldoPendiente = parseFloat(venta.saldo_pendiente);
        let montoAplicado = 0;
        
        if (montoRestante >= saldoPendiente) {
          montoAplicado = saldoPendiente;
          venta.saldo_pendiente = 0;
          venta.estado_pago = estadoPagada; 
        } else {
          montoAplicado = montoRestante;
          venta.saldo_pendiente = saldoPendiente - montoRestante;
        }
        
        const cobroEntity = queryRunner.manager.create(Cobro, {
          monto: montoAplicado,
          venta: venta, 
          usuario: usuarioEntity, 
          metodoPago: metodoPagoEntity, 
          caja_sesion: cajaSesion 
        });
        const cobroGuardado = await queryRunner.manager.save(Cobro, cobroEntity);
        await queryRunner.manager.save(Venta, venta);
        montoRestante -= montoAplicado;
        
        cobrosRealizados.push({
          id: cobroGuardado.id,
          venta_id: venta.id,
          monto: montoAplicado,
          fecha_cobro: cobroGuardado.fecha_cobro,
          saldo_actualizado: parseFloat(venta.saldo_pendiente),
          estado_actual: venta.saldo_pendiente <= 0 ? 'pagada' : 'pendiente'
        });
      }

      const ventasActualizadas = await queryRunner.manager
        .createQueryBuilder(Venta, 'venta')
        .where('venta.cliente_id = :clienteId', { clienteId: cliente_id })
        .andWhere('venta.saldo_pendiente > 0')
        .select('SUM(venta.saldo_pendiente)', 'deuda_actual')
        .getRawOne();
        
      const nuevaDeudaTotal = parseFloat(ventasActualizadas?.deuda_actual || 0);

      await queryRunner.commitTransaction();
      
      return {
        cliente_id,
        monto_pagado: montoAPagar,
        deuda_anterior: deudaTotal,
        deuda_actual: nuevaDeudaTotal,
        metodo_pago,
        cobros_realizados: cobrosRealizados,
        ventas_procesadas: cobrosRealizados.length
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al registrar cobro múltiple:', error.message);
      throw new Error(error.message || 'Error al registrar el cobro múltiple');
    } finally {
      await queryRunner.release();
    }
  },
  

  async obtenerDeudaCliente(cliente_id) {
    try {
      const ventaRepo = AppDataSource.getRepository(Venta);
      const ventasPendientes = await ventaRepo
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.estado_pago', 'estado')
        .where('venta.cliente_id = :clienteId', { clienteId: cliente_id })
        .andWhere('estado.nombre_estado = :estadoNombre', { estadoNombre: 'pendiente' })
        .andWhere('venta.saldo_pendiente > 0')
        .orderBy('venta.fecha_venta', 'ASC')
        .select([
          'venta.id as id',
          'venta.fecha_venta as fecha_venta',
          'venta.total_venta as total_venta',
          'venta.saldo_pendiente as saldo_pendiente'
        ])
        .getRawMany();
      const deudaTotal = ventasPendientes.reduce(
        (sum, venta) => sum + parseFloat(venta.saldo_pendiente), 
        0
      );
      
      return {
        cliente_id,
        total_ventas_pendientes: ventasPendientes.length,
        deuda_total: deudaTotal,
        ventas_detalle: ventasPendientes.map(venta => ({
          id: venta.id,
          fecha_venta: venta.fecha_venta,
          total_venta: parseFloat(venta.total_venta),
          saldo_pendiente: parseFloat(venta.saldo_pendiente)
        }))
      };
    } catch (error) {
      console.error('Error al obtener deuda del cliente:', error);
      throw new Error('No se pudo obtener la deuda del cliente: ' + error.message);
    }
  }
};

export default CobroService;