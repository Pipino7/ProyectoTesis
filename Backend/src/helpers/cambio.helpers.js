import {
  Prenda,
  DetalleVenta,
  Movimiento,
  Cambio,
  Cobro,
  Venta,
  MetodoPago,
  Estado
} from '../entities/index.js';
import VentaHelpers from '../helpers/venta.helpers.js';

const CambioHelper = {
  procesarCambio: async ({
    manager,
    ventaOriginal,
    itemsDevueltos,
    itemsNuevos,
    motivo,
    usuario_id,
    metodo_pago
  }) => {
    const { estadoDisponible, estadoVendida } = await VentaHelpers.obtenerEstados(manager);
    
    let totalDevuelto = 0;
    let logsDevolucion = [];
    
    for (const item of itemsDevueltos) {
      const detalle = ventaOriginal.detallesVenta.find(
        d => d.prenda.codigo_barra_prenda === item.codigo_barra
      );
      
      if (!detalle) {
        throw new Error(`La prenda ${item.codigo_barra} no pertenece a esta venta`);
      }
      
      if (detalle.cantidad < item.cantidad) {
        throw new Error(`No puedes devolver ${item.cantidad} unidades de ${item.codigo_barra}, solo compraste ${detalle.cantidad}`);
      }
      
      const descuentoUnitario = detalle.descuento / detalle.cantidad;
      const valorDevuelto = (detalle.costo_unitario_venta - descuentoUnitario) * item.cantidad;
      totalDevuelto += valorDevuelto;
      
      detalle.cantidad -= item.cantidad;
      detalle.descuento -= descuentoUnitario * item.cantidad;
      
      if (detalle.cantidad === 0) {
        await manager.remove(DetalleVenta, detalle);
      } else {
        await manager.save(DetalleVenta, detalle);
      }
      
      let prendaDisponible = await manager.findOne(Prenda, {
        where: {
          codigo_barra_prenda: item.codigo_barra,
          estado: { id: estadoDisponible.id }
        },
        relations: ['fardo', 'categoria']
      });
      
      if (prendaDisponible) {
        prendaDisponible.cantidad += item.cantidad;
      } else {
        prendaDisponible = manager.create(Prenda, {
          cantidad: item.cantidad,
          precio: detalle.costo_unitario_venta,
          estado: estadoDisponible,
          categoria: detalle.prenda.categoria,
          fardo: detalle.prenda.fardo,
          codigo_barra_prenda: item.codigo_barra
        });
      }
      await manager.save(Prenda, prendaDisponible);
      
      const prendaVendida = await manager.findOne(Prenda, {
        where: {
          codigo_barra_prenda: item.codigo_barra,
          estado: { id: estadoVendida.id }
        }
      });
      
      prendaVendida.cantidad -= item.cantidad;
      if (prendaVendida.cantidad === 0) {
        await manager.remove(Prenda, prendaVendida);
      } else {
        await manager.save(Prenda, prendaVendida);
      }
      
      await manager.save(Movimiento, {
        accion: 'cambio-devuelto',
        cantidad: item.cantidad,
        fardo: prendaDisponible.fardo,
        usuario: { id: usuario_id },
        categoria: prendaDisponible.categoria,
        observacion: motivo
          ? `Cambio (devuelto): ${motivo}`
          : `Cambio: Cliente devuelve ${item.cantidad}×${item.codigo_barra}`
      });
      
      logsDevolucion.push({
        codigo_barra: item.codigo_barra,
        cantidad: item.cantidad,
        precio_unitario: detalle.costo_unitario_venta - descuentoUnitario,
        total: valorDevuelto
      });
    }
    
    let totalNuevo = 0;
    let logsNuevos = [];
    
    for (const item of itemsNuevos) {
      const prendaDisponible = await manager.findOne(Prenda, {
        where: {
          codigo_barra_prenda: item.codigo_barra,
          estado: { id: estadoDisponible.id }
        },
        relations: ['fardo', 'categoria']
      });
      
      if (!prendaDisponible) {
        throw new Error(`La prenda ${item.codigo_barra} no está disponible`);
      }
      
      if (prendaDisponible.cantidad < item.cantidad) {
        throw new Error(`Stock insuficiente para ${item.codigo_barra}. Disponible: ${prendaDisponible.cantidad}`);
      }
      
      const valorProductoNuevo = prendaDisponible.precio * item.cantidad;
      totalNuevo += valorProductoNuevo;
      
      prendaDisponible.cantidad -= item.cantidad;
      if (prendaDisponible.cantidad === 0) {
        await manager.remove(Prenda, prendaDisponible);
      } else {
        await manager.save(Prenda, prendaDisponible);
      }
      
      let prendaVendida = await manager.findOne(Prenda, {
        where: {
          codigo_barra_prenda: item.codigo_barra,
          estado: { id: estadoVendida.id }
        }
      });
      
      if (prendaVendida) {
        prendaVendida.cantidad += item.cantidad;
        await manager.save(Prenda, prendaVendida);
      } else {
        prendaVendida = manager.create(Prenda, {
          cantidad: item.cantidad,
          precio: prendaDisponible.precio,
          estado: estadoVendida,
          categoria: prendaDisponible.categoria,
          fardo: prendaDisponible.fardo,
          codigo_barra_prenda: item.codigo_barra
        });
        await manager.save(Prenda, prendaVendida);
      }
      
      const detalle = manager.create(DetalleVenta, {
        venta: ventaOriginal,
        prenda: prendaVendida,
        cantidad: item.cantidad,
        costo_unitario_venta: prendaDisponible.precio,
        descuento: 0
      });
      await manager.save(DetalleVenta, detalle);
      
      const cambioEntity = manager.create(Cambio, {
        venta: ventaOriginal,
        detalle_original: null,
        prenda_entregada: prendaVendida,
        motivo: motivo || 'Cambio de producto',
        usuario: { id: usuario_id }
      });
      await manager.save(Cambio, cambioEntity);
      
      await manager.save(Movimiento, {
        accion: 'cambio-nuevo',
        cantidad: item.cantidad,
        fardo: prendaDisponible.fardo,
        usuario: { id: usuario_id },
        categoria: prendaDisponible.categoria,
        observacion: motivo
          ? `Cambio (nuevo): ${motivo}`
          : `Cambio: Cliente recibe ${item.cantidad}×${item.codigo_barra}`
      });
      
      logsNuevos.push({
        codigo_barra: item.codigo_barra,
        cantidad: item.cantidad,
        precio_unitario: prendaDisponible.precio,
        total: valorProductoNuevo
      });
    }
    
    const diferencia = totalNuevo - totalDevuelto;
    ventaOriginal.total_venta += diferencia;
    
    if (diferencia !== 0) {
      ventaOriginal.saldo_pendiente += diferencia;
      
      const nuevoEstado = ventaOriginal.saldo_pendiente > 0 
        ? 'pendiente' 
        : 'pagada';
      
      ventaOriginal.estado_pago = await manager.findOne(Estado, {
        where: { nombre_estado: nuevoEstado }
      });
      
      await manager.save(Venta, ventaOriginal);
      
      const metodoPagoEntity = await manager.findOne(MetodoPago, {
        where: { nombre_metodo: metodo_pago }
      });
      
      if (!metodoPagoEntity) {
        throw new Error(`Método de pago ${metodo_pago} no encontrado`);
      }
      
      const cobro = manager.create(Cobro, {
        venta: ventaOriginal,
        metodoPago: metodoPagoEntity,
        monto: diferencia,
        usuario: { id: usuario_id }
      });
      
      await manager.save(Cobro, cobro);
    } else {
      await manager.save(Venta, ventaOriginal);
    }
    
    return {
      productos_devueltos: logsDevolucion,
      productos_nuevos: logsNuevos,
      total_devuelto: totalDevuelto,
      total_nuevo: totalNuevo,
      diferencia: diferencia,
      debe_pagar: diferencia > 0,
      debe_recibir: diferencia < 0,
      monto_ajuste: Math.abs(diferencia)
    };
  },

  venderPrendaNueva: async (manager, codigo_barra, cantidad, estadoDisponible, estadoVendida) => {
    
  },

  devolverPrendaOriginal: async (manager, codigo_barra, cantidad, estadoDisponible, estadoVendida, prendaOriginal) => {
    
  },

  registrarMovimientos: async (manager, { original, nuevo, cantidad, usuario_id, prendaOriginal, prendaNueva }) => {
    
  }
};

export default CambioHelper;
