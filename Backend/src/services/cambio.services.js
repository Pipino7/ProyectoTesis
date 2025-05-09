import AppDataSource from '../config/ConfigDB.js';
import {
  Venta,
  DetalleVenta,
  Cambio,
  Estado,
  MetodoPago
} from '../entities/index.js';
import VentaHelpers from '../helpers/venta.helpers.js';
import TicketHelper from '../helpers/ticket.helpers.js';
import CambioHelper from '../helpers/cambio.helpers.js';

const cambioService = {
  registrarCambio: async ({
    codigo_cambio,
    usuario_id,
    items_devueltos,
    items_nuevos,
    motivo,
    metodo_pago = 'efectivo'
  }) => {
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    
    try {
      const venta = await qr.manager.findOne(Venta, {
        where: { codigo_cambio },
        relations: ['detallesVenta', 'detallesVenta.prenda', 'detallesVenta.prenda.categoria', 'detallesVenta.prenda.fardo']
      });
      
      if (!venta) {
        throw new Error(`Código de cambio '${codigo_cambio}' no válido`);
      }
      
      if (TicketHelper.validarVigenciaTicket) {
        TicketHelper.validarVigenciaTicket(venta.fecha_venta);
      }
      
      const resultado = await CambioHelper.procesarCambio({
        manager: qr.manager,
        ventaOriginal: venta,
        itemsDevueltos: items_devueltos,
        itemsNuevos: items_nuevos,
        motivo,
        usuario_id,
        metodo_pago
      });
      venta.codigo_cambio = null;
      await qr.manager.save(Venta, venta);
      
      await qr.commitTransaction();
      return resultado;
    } catch (error) {
      await qr.rollbackTransaction();
      console.error('❌ Error en registrarCambio:', error);
      throw error;
    } finally {
      await qr.release();
    }
  }
};

export default cambioService;
