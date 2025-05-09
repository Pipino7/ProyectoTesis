// src/services/devolucion.service.js
import {
  Venta,
} from '../entities/index.js';
import DevolucionHelper from '../helpers/devolucion.helpers.js';
import TicketHelper from '../helpers/ticket.helpers.js';

const devolucionService = {
  async registrarDevolucion({ manager, codigo_cambio, items, codigo_barra_devuelto, cantidad = 1, metodo_reembolso = 'efectivo', motivo, usuario_id }) {
    const venta = await manager.findOne(Venta, {
      where: { codigo_cambio },
      relations: ['estado_pago', 'detallesVenta', 'detallesVenta.prenda', 'detallesVenta.prenda.categoria', 'detallesVenta.prenda.fardo']
    });
    if (!venta) throw new Error(`Venta con código ${codigo_cambio} no encontrada`);

    TicketHelper.validarVigenciaTicket(venta.fecha_venta);

    const totalReembolso = await DevolucionHelper.procesarDevolucion({
      manager,
      venta,
      items,
      codigo_barra_devuelto,
      cantidad,
      motivo,
      usuario_id
    });

    const ventaActualizada = await DevolucionHelper.actualizarVentaPostDevolucion(manager, venta, totalReembolso);

    if (ventaActualizada.estado_pago.nombre_estado === 'pagada') {
      await DevolucionHelper.registrarReembolso({
        manager,
        venta: ventaActualizada,
        totalReembolso,
        metodo_reembolso,
        usuario_id
      });
    }

    return {
      venta_id: ventaActualizada.id,
      totalReembolso
    };
  }
};

export default devolucionService;
