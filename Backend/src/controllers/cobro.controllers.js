
import cobroService from '../services/cobro.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const cobroController = {
  obtenerVentasPendientes: async (req, res) => {
    try {
      console.log('📥 Petición recibida para obtener ventas pendientes de cobro');

      if (!req.user?.id) {
        return respondError(req, res, 401, 'No autenticado. Inicia sesión.');
      }

      const ventasPendientes = await cobroService.obtenerVentasPendientes();
      
      console.log(`✅ Se encontraron ${ventasPendientes.length} ventas pendientes de cobro`);
      return respondSuccess(req, res, 200, ventasPendientes);
    } catch (error) {
      console.error('❌ Error al obtener ventas pendientes:', error);
      return respondError(req, res, 500, error.message || 'Error al obtener ventas pendientes');
    }
  },
  registrarCobro: async (req, res) => {
    try {
      console.log('📥 Petición recibida para registrar cobro');
      console.log('🧾 Body recibido:', JSON.stringify(req.body, null, 2));

      if (!req.user?.id) {
        return respondError(req, res, 401, 'No autenticado. Inicia sesión.');
      }

      const { venta_id, monto, metodo_pago, caja_sesion_id } = req.body;

      if (!venta_id) {
        return respondError(req, res, 400, 'El ID de venta es obligatorio');
      }

      if (!monto || parseFloat(monto) <= 0) {
        return respondError(req, res, 400, 'El monto debe ser mayor a 0');
      }

      if (!metodo_pago) {
        return respondError(req, res, 400, 'El método de pago es obligatorio');
      }

      const resultado = await cobroService.registrarCobro({
        venta_id,
        monto: parseFloat(monto),
        metodo_pago,
        usuario_id: req.user.id,
        caja_sesion_id: caja_sesion_id || null
      });

      console.log('✅ Cobro registrado correctamente:', resultado);
      return respondSuccess(req, res, 200, {
        message: 'Cobro registrado con éxito',
        cobro: resultado
      });
    } catch (error) {
      console.error('❌ Error al registrar cobro:', error);
      return respondError(req, res, error.status || 500, error.message || 'Error al registrar cobro');
    }
  },
  obtenerCobrosPorVenta: async (req, res) => {
    try {
      const { venta_id } = req.params;
      
      if (!venta_id) {
        return respondError(req, res, 400, 'El ID de venta es obligatorio');
      }

      console.log(`📥 Obteniendo cobros para la venta ID: ${venta_id}`);

      const cobros = await cobroService.obtenerCobrosPorVenta(venta_id);
      
      console.log(`✅ Se encontraron ${cobros.length} cobros para la venta ${venta_id}`);
      return respondSuccess(req, res, 200, cobros);
    } catch (error) {
      console.error('❌ Error al obtener cobros por venta:', error);
      return respondError(req, res, 500, error.message || 'Error al obtener los cobros');
    }
  },

  obtenerResumenCobros: async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      let inicio = fecha_inicio ? new Date(fecha_inicio) : null;
      let fin = fecha_fin ? new Date(fecha_fin) : null;
      
      console.log(`📥 Solicitando resumen de cobros entre ${fecha_inicio || 'último mes'} y ${fecha_fin || 'hoy'}`);
      
      const resumen = await cobroService.obtenerResumenCobros(inicio, fin);
      
      console.log(`✅ Resumen de cobros generado con total: ${resumen.total}`);
      return respondSuccess(req, res, 200, resumen);
    } catch (error) {
      console.error('❌ Error al obtener resumen de cobros:', error);
      return respondError(req, res, 500, error.message || 'Error al obtener el resumen de cobros');
    }
  },
  
  obtenerDeudaCliente: async (req, res) => {
    try {
      const { cliente_id } = req.params;
      
      if (!cliente_id) {
        return respondError(req, res, 400, 'El ID del cliente es obligatorio');
      }

      console.log(`📥 Obteniendo deuda para el cliente ID: ${cliente_id}`);

      const deudaInfo = await cobroService.obtenerDeudaCliente(cliente_id);
      
      console.log(`✅ Cliente ${cliente_id} tiene ${deudaInfo.total_ventas_pendientes} ventas pendientes con deuda total de ${deudaInfo.deuda_total}`);
      return respondSuccess(req, res, 200, deudaInfo);
    } catch (error) {
      console.error('❌ Error al obtener deuda del cliente:', error);
      return respondError(req, res, 500, error.message || 'Error al obtener la deuda del cliente');
    }
  },
  
  registrarCobroMultiple: async (req, res) => {
    try {
      console.log('📥 Petición recibida para registrar cobro múltiple');
      console.log('🧾 Body recibido:', JSON.stringify(req.body, null, 2));

      if (!req.user?.id) {
        return respondError(req, res, 401, 'No autenticado. Inicia sesión.');
      }

      const { cliente_id, monto_total, metodo_pago, caja_sesion_id } = req.body;

      if (!cliente_id) {
        return respondError(req, res, 400, 'El ID de cliente es obligatorio');
      }

      if (!monto_total || parseFloat(monto_total) <= 0) {
        return respondError(req, res, 400, 'El monto debe ser mayor a 0');
      }

      if (!metodo_pago) {
        return respondError(req, res, 400, 'El método de pago es obligatorio');
      }

      const resultado = await cobroService.registrarCobroMultiple({
        cliente_id,
        monto_total: parseFloat(monto_total),
        metodo_pago,
        usuario_id: req.user.id,
        caja_sesion_id: caja_sesion_id || null
      });

      console.log('✅ Cobro múltiple registrado correctamente:', resultado);
      return respondSuccess(req, res, 200, {
        message: 'Cobro múltiple registrado con éxito',
        cobro: resultado
      });
    } catch (error) {
      console.error('❌ Error al registrar cobro múltiple:', error);
      return respondError(req, res, error.status || 500, error.message || 'Error al registrar cobro múltiple');
    }
  }
};

export default cobroController;