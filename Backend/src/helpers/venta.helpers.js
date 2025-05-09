import {
  Estado,
  Cliente,
  Prenda,
  DetalleVenta,
  Movimiento,
  Cobro,
  Venta,
  MetodoPago,
  Cambio,
  Gasto,
} from '../entities/index.js';
import { Between } from 'typeorm';
import FinancierosHelpers from './financieros.helpers.js';

const VentaHelpers = {
  async obtenerEstados(manager) {
    const [disp, vend] = await Promise.all([
      manager.findOne(Estado, { where: { nombre_estado: 'disponible' } }),
      manager.findOne(Estado, { where: { nombre_estado: 'vendida' } })
    ]);
    if (!disp || !vend) {
      throw new Error('❌ Estados "disponible" o "vendida" no encontrados');
    }
    return { estadoDisponible: disp, estadoVendida: vend };
  },

  async crearClientePendiente(manager, cliente) {
    const existente = await manager.findOne(Cliente, {
      where: { telefono: cliente.telefono }
    });
    if (existente) return existente;

    const ent = manager.create(Cliente, cliente);
    return manager.save(Cliente, ent);
  },

  async crearVentaEntity(manager, data) {
    if (data.usuario?.id)      data.usuario     = { id: data.usuario.id };
    if (data.estado_pago?.id)  data.estado_pago = { id: data.estado_pago.id };
    if (data.cliente?.id)      data.cliente     = { id: data.cliente.id };
    if (data.cupon?.id)        data.cupon       = { id: data.cupon.id };

    if (data.total_venta !== undefined && data.saldo_pendiente === undefined) {
      const totalPagado = 0;
      data.saldo_pendiente = FinancierosHelpers.calcularSaldoPendiente(data.total_venta, totalPagado);
    }

    const ent = manager.create(Venta, data);
    return manager.save(Venta, ent);
  },

  async procesarItemVenta({
    item,
    manager,
    ventaEntity,
    estadoDisponible,
    estadoVendida,
    usuario_id,
    totalBruto,
    descuento_total,
    motivo_descuento
  }) {
    console.log('🔍 Procesando venta de item:', item.codigo_barra, 'cantidad:', item.cantidad);
    console.log('🏷️ Estado disponible ID:', estadoDisponible.id, 'Estado vendida ID:', estadoVendida.id);
    
    const pr = await manager.findOne(Prenda, {
      where: {
        codigo_barra_prenda: item.codigo_barra,
        estado: { id: estadoDisponible.id }
      },
      relations: ['fardo', 'categoria']
    });
    if (!pr) throw new Error(`Prenda ${item.codigo_barra} no disponible`);
    
    console.log('📦 Prenda encontrada en disponible:', pr.id, pr.codigo_barra_prenda);

    await manager
      .createQueryBuilder(Prenda, 'p')
      .setLock('pessimistic_write')
      .where('p.id = :id', { id: pr.id })
      .getOne();

    if (pr.cantidad < item.cantidad) {
      throw new Error(`Stock insuficiente para ${item.codigo_barra}`);
    }

    if (pr.cantidad === item.cantidad) {
      console.log('🗑️ Eliminando prenda disponible (cantidad 0):', pr.id);
      await manager.remove(Prenda, pr);
    } else {
      pr.cantidad -= item.cantidad;
      console.log('⬇️ Reduciendo cantidad de prenda disponible a:', pr.cantidad);
      await manager.save(Prenda, pr);
    }

    let pv = await manager.findOne(Prenda, {
      where: {
        codigo_barra_prenda: pr.codigo_barra_prenda,
        estado: { id: estadoVendida.id }
      },
      relations: ['fardo', 'categoria']
    });

    if (pv) {
      console.log('⬆️ Aumentando cantidad de prenda vendida existente:', pv.id);
      pv.cantidad += item.cantidad;
      await manager.save(Prenda, pv);
    } else {
      console.log('🆕 Creando nueva prenda en estado vendida');
      pv = manager.create(Prenda, {
        cantidad: item.cantidad,
        precio: pr.precio,
        estado: estadoVendida,
        categoria: pr.categoria,
        fardo: pr.fardo,
        codigo_barra_prenda: pr.codigo_barra_prenda
      });
      console.log('💾 Estado asignado a nueva prenda:', JSON.stringify(estadoVendida));
      const savedPv = await manager.save(Prenda, pv);
      console.log('✅ Prenda vendida guardada con ID:', savedPv.id);
    }

    await manager.save(Movimiento, {
      accion: 'venta',
      cantidad: item.cantidad,
      fardo: pr.fardo,
      usuario: { id: usuario_id },
      categoria: pr.categoria,
      observacion: motivo_descuento
        ? `Venta con descuento: ${motivo_descuento} (${Math.round(
            (item.precio * item.cantidad * descuento_total) / totalBruto
          )} aplicado)`
        : 'Venta realizada'
    });

    const dv = manager.create(DetalleVenta, {
      venta: ventaEntity,
      prenda: pv,
      cantidad: item.cantidad,
      costo_unitario_venta: item.precio,
      descuento: item.descuento || 0,
      estado: estadoVendida
    });
    await manager.save(DetalleVenta, dv);
  },

  async registrarCobros(manager, ventaEntity, pago, usuario_id, cajaSesionId) {
    const repoMP = manager.getRepository(MetodoPago);

    const totalPagado = FinancierosHelpers.calcularTotalPagado(pago);
    
    if (totalPagado > 0) {
      for (const [metodo, monto] of Object.entries(pago)) {
        if (monto > 0) {
          const mp = await repoMP.findOne({
            where: { nombre_metodo: metodo }
          });
          if (!mp) throw new Error(`Método de pago "${metodo}" no encontrado`);

          const cob = manager.create(Cobro, {
            venta: ventaEntity,
            usuario: { id: usuario_id },
            metodoPago: mp,
            monto,
            caja_sesion: { id: cajaSesionId }
          });
          const cobroGuardado = await manager.save(Cobro, cob);
          
          await manager.save(Movimiento, {
            accion: 'cobro_venta',
            cantidad: monto,
            observacion: `Cobro de venta #${ventaEntity.id}`,
            caja_sesion: { id: cajaSesionId },
            usuario: { id: usuario_id }
          });
          
          console.log(`✅ Cobro registrado: $${monto} (${metodo}) para venta #${ventaEntity.id} - ID cobro: ${cobroGuardado.id}`);
        }
      }
    }
  },

  async resumenDiario(manager, fecha) {
    const fechaBase = fecha ? new Date(`${fecha}T00:00:00`) : new Date();
    const start = new Date(fechaBase.setHours(0, 0, 0, 0));
    const end = new Date(fechaBase.setHours(23, 59, 59, 999));
  
    const [
      ventas,
      ventasPagadas,
      totalPrendasResult,
      totalBrutoResult,
      pagosRaw,
      cambios,
      devolucionesData,
      totalReembResult,
      cobrosNegativos,
      ventasPorCategoria,
      gastosPorMetodo,
      totalGastosResult,
      cajasActivas
    ] = await Promise.all([
      manager.find(Venta, {
        where: { fecha_venta: Between(start, end) },
        relations: ['cupon'],
        select: ['id', 'total_venta', 'codigo_cambio']
      }),
  
      manager.count(Venta, {
        where: qb => {
          qb.where('fecha_venta BETWEEN :start AND :end', { start, end })
            .andWhere('estado_pago.nombre_estado = :pagada', { pagada: 'pagada' })
            .innerJoin('Venta.estado_pago', 'estado_pago');
        }
      }),
  
      manager.createQueryBuilder(DetalleVenta, 'dv')
        .innerJoin('dv.venta', 'v', 'v.fecha_venta BETWEEN :start AND :end', { start, end })
        .select('SUM(dv.cantidad)', 'total')
        .getRawOne(),
  
      manager.createQueryBuilder(DetalleVenta, 'dv')
        .innerJoin('dv.venta', 'v', 'v.fecha_venta BETWEEN :start AND :end', { start, end })
        .select('SUM(dv.cantidad * dv.costo_unitario_venta)', 'total')
        .getRawOne(),
  
      manager.createQueryBuilder(Cobro, 'c')
        .innerJoin('c.venta', 'v', 'v.fecha_venta BETWEEN :start AND :end', { start, end })
        .innerJoin('c.metodoPago', 'mp')
        .where('c.monto > 0')
        .select('mp.nombre_metodo', 'metodo')
        .addSelect('SUM(c.monto)', 'total')
        .groupBy('mp.nombre_metodo')
        .getRawMany(),
  
      manager.count(Cambio, {
        where: qb =>
          qb.where('venta.fecha_venta BETWEEN :start AND :end', { start, end })
            .innerJoin('Cambio.venta', 'venta')
      }),
  
      Promise.all([
        manager.createQueryBuilder(Movimiento, 'm')
          .where('m.accion = :accion', { accion: 'devolucion' })
          .andWhere('m.fecha BETWEEN :start AND :end', { start, end })
          .select('COUNT(DISTINCT m.id)', 'ventasDevueltas')
          .getRawOne(),
          
        manager.createQueryBuilder(Movimiento, 'm')
          .where('m.accion = :accion', { accion: 'devolucion' })
          .andWhere('m.fecha BETWEEN :start AND :end', { start, end })
          .select('SUM(m.cantidad)', 'prendasDevueltas')
          .getRawOne()
      ]),
  
      manager.createQueryBuilder(Cobro, 'c')
        .innerJoin('c.venta', 'v')
        .where('c.monto < 0')
        .andWhere('v.fecha_venta BETWEEN :start AND :end', { start, end })
        .select('ABS(SUM(c.monto))', 'total')
        .getRawOne(),
        
      manager.createQueryBuilder(Cobro, 'c')
        .innerJoin('c.venta', 'v')
        .innerJoin('c.metodoPago', 'mp')
        .where('c.monto < 0')
        .andWhere('v.fecha_venta BETWEEN :start AND :end', { start, end })
        .select('mp.nombre_metodo', 'metodo')
        .addSelect('ABS(SUM(c.monto))', 'total')
        .groupBy('mp.nombre_metodo')
        .getRawMany(),
      
      manager.createQueryBuilder(DetalleVenta, 'dv')
        .innerJoin('dv.venta', 'v', 'v.fecha_venta BETWEEN :start AND :end', { start, end })
        .innerJoin('dv.prenda', 'p')
        .innerJoin('p.categoria', 'cat')
        .select('cat.nombre_categoria', 'nombre')
        .addSelect('SUM(dv.cantidad)', 'cantidad')
        .addSelect('SUM(dv.cantidad * dv.costo_unitario_venta)', 'total')
        .groupBy('cat.nombre_categoria')
        .getRawMany(),
      
      manager.createQueryBuilder(Gasto, 'gasto')
        .innerJoin('gasto.caja_sesion', 'caja')
        .innerJoin('gasto.metodo_pago', 'mp')
        .where('caja.fecha_apertura >= :start', { start })
        .andWhere('gasto.fecha <= :end', { end })
        .select('mp.nombre_metodo', 'metodo')
        .addSelect('SUM(gasto.monto)', 'total')
        .groupBy('mp.nombre_metodo')
        .getRawMany(),
      
      manager.createQueryBuilder(Gasto, 'gasto')
        .innerJoin('gasto.caja_sesion', 'caja')
        .where('caja.fecha_apertura >= :start', { start })
        .andWhere('gasto.fecha <= :end', { end })
        .select('SUM(gasto.monto)', 'total')
        .getRawOne(),
      
      manager.find('caja_sesion', {
        where: [
          { fecha_apertura: Between(start, end) },
          { fecha_cierre: Between(start, end) },
          { fecha_apertura: Between(start, end), fecha_cierre: null }
        ],
        relations: ['estado']
      })
    ]);
  
    const totalNeto = ventas.reduce((sum, v) => sum + Number(v.total_venta), 0);
    const totalPrendas = Number(totalPrendasResult?.total) || 0;
    const totalBruto = Number(totalBrutoResult?.total) || 0;
    const totalDescuentos = totalBruto - totalNeto;
    const totalReembolsado = Number(totalReembResult?.total) || 0;
    const totalGastos = Number(totalGastosResult?.total) || 0;
  
    const montoInicial = cajasActivas.reduce((sum, caja) => sum + Number(caja.monto_inicial || 0), 0);
    
    const [ventasDevueltasResult, prendasDevueltasResult] = devolucionesData;
    const devolucionesRealizadas = Number(ventasDevueltasResult?.ventasDevueltas) || 0;
    const prendasDevueltas = Number(prendasDevueltasResult?.prendasDevueltas) || 0;
  
    const pagos = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0
    };
    pagosRaw.forEach(r => {
      pagos[r.metodo] = Number(r.total);
    });
    
    const gastos = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0
    };
    gastosPorMetodo.forEach(r => {
      gastos[r.metodo] = Number(r.total);
    });
    
    const reembolsos = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0
    };
    cobrosNegativos.forEach(r => {
      reembolsos[r.metodo] = Number(r.total);
    });
    
    return FinancierosHelpers.calcularResumenDiario(start, {
      ventas,
      ventasPagadas,
      totalPrendas,
      pagosRecibidos: pagos,
      reembolsos,
      gastosPorMetodo: gastos,
      totalGastos,
      montoInicial,
      ventasPorCategoria,
      devolucionesRealizadas,
      prendasDevueltas,
      cambios,
      totalDescuentos,
    });
  }
};

export default VentaHelpers;
