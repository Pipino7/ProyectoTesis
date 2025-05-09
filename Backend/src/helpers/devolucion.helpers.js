import {
  Prenda,
  DetalleVenta,
  Movimiento,
  Estado,
  MetodoPago,
  Venta,
  Cobro,
} from '../entities/index.js';
import VentaHelpers from '../helpers/venta.helpers.js';

const DevolucionHelper = {
  async procesarDevolucion({ manager, venta, items, codigo_barra_devuelto, cantidad = 1, motivo, usuario_id }) {
    const { estadoDisponible, estadoVendida } = await VentaHelpers.obtenerEstados(manager);
    let totalReembolso = 0;
    
    let itemsToProcess = items;
    if (!items && codigo_barra_devuelto) {
      itemsToProcess = [{ codigo_barra: codigo_barra_devuelto, cantidad }];
    } else if (!Array.isArray(items)) {
      throw new Error('Se esperaba un array de items o un código de barra para devolver');
    }
    
    for (const { codigo_barra, cantidad } of itemsToProcess) {
      const detalle = venta.detallesVenta.find(
        d => d.prenda?.codigo_barra_prenda === codigo_barra
      );
      if (!detalle) {
        throw new Error(`La prenda ${codigo_barra} no pertenece a esta venta`);
      }
      if (detalle.cantidad < cantidad) {
        throw new Error(`No puedes devolver ${cantidad} unidades de ${codigo_barra}, solo compraste ${detalle.cantidad}`);
      }
    }

    for (const { codigo_barra, cantidad } of itemsToProcess) {
      const detalle = venta.detallesVenta.find(
        d => d.prenda.codigo_barra_prenda === codigo_barra
      );

      const descuentoUnitario = detalle.descuento / detalle.cantidad;
      const montoDev = (detalle.costo_unitario_venta - descuentoUnitario) * cantidad;
      totalReembolso += montoDev;

      detalle.cantidad -= cantidad;
      detalle.descuento -= descuentoUnitario * cantidad;
      if (detalle.cantidad === 0) {
        await manager.remove(DetalleVenta, detalle);
      } else {
        if (!detalle.estado) {
          detalle.estado = estadoVendida;
        }
        await manager.save(DetalleVenta, detalle);
      }

      let dispo = await manager.findOne(Prenda, {
        where: {
          codigo_barra_prenda: codigo_barra,
          estado: { id: estadoDisponible.id }
        },
        relations: ['fardo', 'categoria']
      });
      if (dispo) {
        dispo.cantidad += cantidad;
      } else {
        dispo = manager.create(Prenda, {
          cantidad,
          precio: detalle.costo_unitario_venta,
          estado: estadoDisponible,
          categoria: detalle.prenda.categoria,
          fardo: detalle.prenda.fardo,
          codigo_barra_prenda: codigo_barra
        });
      }
      await manager.save(Prenda, dispo);

      const prendaVendida = await manager.findOne(Prenda, {
        where: {
          codigo_barra_prenda: codigo_barra,
          estado: { id: estadoVendida.id }
        }
      });
      
      if (!prendaVendida) {
        throw new Error(`Error interno: La prenda ${codigo_barra} no se encuentra en estado vendida`);
      }
      
      prendaVendida.cantidad -= cantidad;
      if (prendaVendida.cantidad === 0) {
        await manager.remove(Prenda, prendaVendida);
      } else {
        await manager.save(Prenda, prendaVendida);
      }

      await manager.save(Movimiento, {
        accion: 'devolucion',
        cantidad,
        fardo: dispo.fardo,
        usuario: { id: usuario_id },
        categoria: dispo.categoria,
        observacion: motivo
          ? `Devolución: ${motivo}`
          : `Devolución ${cantidad}×${codigo_barra}`
      });
    }

    return totalReembolso;
  },

  async actualizarVentaPostDevolucion(manager, venta, totalReembolso) {
    venta.total_venta -= totalReembolso;
    
    venta.saldo_pendiente -= totalReembolso;

    const nuevoEstado = venta.saldo_pendiente > 0 ? 'pendiente' : 'pagada';
    const estadoPago = await manager.findOne(Estado, {
      where: { nombre_estado: nuevoEstado }
    });

    venta.estado_pago = estadoPago;
    
    venta.codigo_cambio = null;
    
    const detallesConCantidad = venta.detallesVenta.filter(d => d.cantidad > 0);
    
    venta.detallesVenta = detallesConCantidad;
    
    return await manager.save(Venta, venta);
  },

  async registrarReembolso({ manager, venta, totalReembolso, metodo_reembolso, usuario_id }) {
    const cajaSesion = await manager.findOne('caja_sesion', {
      where: { 
        usuario: { id: usuario_id }, 
        estado: { nombre_estado: 'abierta' } 
      },
      relations: ['estado']
    });
    
    if (!cajaSesion) {
      throw new Error('El usuario no tiene una caja abierta para registrar la devolución');
    }

    const mpEntity = await manager.findOne(MetodoPago, {
      where: { nombre_metodo: metodo_reembolso }
    });
    
    if (!mpEntity) {
      throw new Error(`Método de pago "${metodo_reembolso}" no encontrado`);
    }

    const cobroEntity = manager.create(Cobro, {
      venta: { id: venta.id },
      metodoPago: { id: mpEntity.id },
      monto: -totalReembolso,
      usuario: { id: usuario_id },
      caja_sesion: { id: cajaSesion.id }
    });
    
    await manager.save(Cobro, cobroEntity);

    await manager.save(Movimiento, {
      accion: 'devolucion_caja',
      cantidad: 1,
      usuario: { id: usuario_id },
      caja_sesion: cajaSesion,
      observacion: `Reembolso por devolución venta #${venta.id} - $${totalReembolso}`,
      cobro: cobroEntity
    });
  }
};

export default DevolucionHelper;
