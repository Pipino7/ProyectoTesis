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
import { Between, In } from 'typeorm';
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

  async resumenDiario(manager, fecha, { limit = 50, offset = 0 } = {}) {
    let fechaBase;
    if (fecha) {
      const [year, month, day] = fecha.split('-').map(Number);
      fechaBase = new Date(year, month - 1, day); 
    } else {
      fechaBase = new Date();
    }
    
    const start = new Date(fechaBase);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(fechaBase);
    end.setHours(23, 59, 59, 999);
    
    console.log(`📊 Consultando ventas entre ${start.toISOString()} y ${end.toISOString()} (límite: ${limit}, offset: ${offset})`);
    

    const totalVentas = await manager.count(Venta, {
      where: { fecha_venta: Between(start, end) }
    });
    
    console.log(`📊 Total de ventas para la fecha: ${totalVentas}`);

    const ventas = await manager.find(Venta, {
      where: { fecha_venta: Between(start, end) },
      relations: [
        'usuario', 
        'cliente', 
        'estado_pago', 
        'cupon', 
        'detallesVenta', 
        'detallesVenta.prenda', 
        'detallesVenta.prenda.categoria'
      ],
      order: { fecha_venta: 'DESC' },
      skip: offset,
      take: limit
    });
    
    console.log(`🧾 Se encontraron ${ventas.length} ventas para la página actual`);
    
    const ventasIds = ventas.map(v => v.id);
    const cobros = ventasIds.length > 0 ? await manager.find(Cobro, {
      where: { venta: { id: In(ventasIds) } },
      relations: ['metodoPago', 'venta']
    }) : [];

    const ventasDetalladas = await Promise.all(ventas.map(async (venta) => {
      const cobrosVenta = cobros.filter(c => c.venta.id === venta.id);
      
      const metodosDePago = {};
      let esMetodoPagoMixto = false;
      
      cobrosVenta.forEach(c => {
        const metodo = c.metodoPago?.nombre_metodo || 'no especificado';
        metodosDePago[metodo] = (metodosDePago[metodo] || 0) + Number(c.monto);
      });
      
    
      const metodosUsados = Object.keys(metodosDePago).filter(m => metodosDePago[m] > 0);
      if (metodosUsados.length > 1) {
        esMetodoPagoMixto = true;
      }
      
      const metodoPago = esMetodoPagoMixto 
        ? 'mixto' 
        : metodosUsados[0] || (venta.saldo_pendiente > 0 ? 'pendiente' : 'no especificado');
      
      const detallesPrendas = venta.detallesVenta?.map(detalle => {
        const precioUnidad = Number(detalle.costo_unitario_venta || 0);
        const cantidad = Number(detalle.cantidad || 0);
        const descuento = Number(detalle.descuento || 0);
        const subtotal = precioUnidad * cantidad - descuento;
        
        return {
          id: detalle.id,
          codigo_barra: detalle.prenda?.codigo_barra_prenda,
          categoria: detalle.prenda?.categoria?.nombre_categoria || 'Sin categoría',
          precio_unitario: precioUnidad,
          cantidad: cantidad,
          descuento: descuento,
          subtotal: subtotal,
          precio_final_unidad: cantidad > 0 ? (subtotal / cantidad) : 0
        };
      }) || [];
      
      const totalBruto = detallesPrendas.reduce((sum, d) => sum + (d.precio_unitario * d.cantidad), 0);
      const totalDescuentos = detallesPrendas.reduce((sum, d) => sum + (d.descuento || 0), 0);
      const descuentoCupon = venta.cupon 
        ? Number(venta.descuento_cupon || 0) 
        : 0;
      return {
        id: venta.id,
        fecha_venta: venta.fecha_venta,
        total_bruto: totalBruto,
        total_descuentos: totalDescuentos + descuentoCupon,
        descuento_cupon: descuentoCupon,
        total_neto: Number(venta.total_venta || 0),
        saldo_pendiente: Number(venta.saldo_pendiente || 0),
        estado_pago: venta.estado_pago?.nombre_estado || 'desconocido',
        tipo_venta: venta.tipo_venta,
        metodo_pago: metodoPago,
        metodos_detallados: metodosDePago,
        tiene_cupon: !!venta.cupon,
        cupon: venta.cupon ? {
          id: venta.cupon.id,
          codigo: venta.cupon.codigo,
          descuento: venta.cupon.descuento,
          tipo_descuento: venta.cupon.tipo_descuento
        } : null,
        codigo_cambio: venta.codigo_cambio,
        usuario: venta.usuario ? {
          id: venta.usuario.id,
          nombre: venta.usuario.nombre
        } : null,
        cliente: venta.cliente ? {
          id: venta.cliente.id,
          nombre: venta.cliente.nombre,
          telefono: venta.cliente.telefono
        } : null,
        prendas: detallesPrendas,
        total_prendas: detallesPrendas.reduce((sum, d) => sum + d.cantidad, 0)
      };
    }));
    
    const resumen = {
      fecha: fechaBase,
      total_ventas: totalVentas,
      ventas_pagadas: ventasDetalladas.filter(v => v.estado_pago === 'pagada').length,
      ventas_pendientes: ventasDetalladas.filter(v => v.estado_pago === 'pendiente').length,
      total_prendas: ventasDetalladas.reduce((sum, v) => sum + v.total_prendas, 0),
      monto_total: ventasDetalladas.reduce((sum, v) => sum + v.total_neto, 0),
      total_descuentos: ventasDetalladas.reduce((sum, v) => sum + v.total_descuentos, 0),
      ventas_con_cupon: ventasDetalladas.filter(v => v.tiene_cupon).length,
      ventas_con_cambio: ventasDetalladas.filter(v => v.codigo_cambio).length,
      ventas_por_metodo: {
        efectivo: ventasDetalladas.filter(v => v.metodo_pago === 'efectivo').length,
        tarjeta: ventasDetalladas.filter(v => v.metodo_pago === 'tarjeta').length,
        transferencia: ventasDetalladas.filter(v => v.metodo_pago === 'transferencia').length,
        mixto: ventasDetalladas.filter(v => v.metodo_pago === 'mixto').length,
        pendiente: ventasDetalladas.filter(v => v.metodo_pago === 'pendiente').length
      },
      monto_por_metodo: {
        efectivo: ventasDetalladas.filter(v => v.metodo_pago === 'efectivo').reduce((sum, v) => sum + v.total_neto, 0),
        tarjeta: ventasDetalladas.filter(v => v.metodo_pago === 'tarjeta').reduce((sum, v) => sum + v.total_neto, 0),
        transferencia: ventasDetalladas.filter(v => v.metodo_pago === 'transferencia').reduce((sum, v) => sum + v.total_neto, 0),
        mixto: ventasDetalladas.filter(v => v.metodo_pago === 'mixto').reduce((sum, v) => sum + v.total_neto, 0),
        pendiente: ventasDetalladas.filter(v => v.metodo_pago === 'pendiente').reduce((sum, v) => sum + v.total_neto, 0)
      },
      ventas_por_categoria: {}
    };
    ventasDetalladas.forEach(venta => {
      venta.prendas.forEach(prenda => {
        const categoria = prenda.categoria || 'Sin categoría';
        if (!resumen.ventas_por_categoria[categoria]) {
          resumen.ventas_por_categoria[categoria] = {
            cantidad: 0,
            monto: 0
          };
        }
        resumen.ventas_por_categoria[categoria].cantidad += prenda.cantidad;
        resumen.ventas_por_categoria[categoria].monto += prenda.subtotal;
      });
    });
    
    return {
      resumen,
      ventas: ventasDetalladas,
      totalVentas
    };
  }
};

export default VentaHelpers;
