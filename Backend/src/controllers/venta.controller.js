import ventaService from '../services/venta.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const ventaController = {
  crearVenta: async (req, res) => {
    try {
      console.log('📥 Petición recibida para crear venta');
      console.log('🧾 Body original recibido:', JSON.stringify(req.body, null, 2));

      if (!req.validated) {
        return respondError(req, res, 400, 'Error de validación. Revisa el cuerpo de la solicitud.');
      }
      if (!req.user?.id) {
        return respondError(req, res, 401, 'No autenticado. Inicia sesión.');
      }

      const { metodo_pago, generar_ticket_cambio, ...rest } = req.validated;
      const data = {
        tipo_venta: metodo_pago,
        generar_ticket_cambio: generar_ticket_cambio === true, 
        ...rest,
        usuario_id: req.user.id
      };

      console.log('📦 Datos validados a enviar al servicio:', JSON.stringify(data, null, 2));
      const resumenVenta = await ventaService.crearVenta(data);

      console.log('✅ Venta registrada correctamente:', resumenVenta);
      return respondSuccess(req, res, 201, {
        message: 'Venta registrada con éxito',
        resumen: resumenVenta
      });

    } catch (error) {
      console.error('❌ Error inesperado al crear venta:', error);
      return respondError(req, res, 500, 'Error al registrar la venta: ' + error.message);
    }
  },
  async validarPrendaParaVenta(req, res, next) {
    try {
      const { codigo_barra } = req.params;
  
      const prenda = await ventaService.validarPrendaParaVenta(req.manager, codigo_barra);
  
      return respondSuccess(req, res, 200, {
        codigo_barra: prenda.codigo_barra_prenda, 
        precio: prenda.precio,
        categoria: prenda.categoria?.nombre_categoria || null,
        disponibles: prenda.cantidad
      });
  
    } catch (error) {
      console.error('❌ Error al validar prenda:', error.message);
      return respondError(req, res, 404, error.message);
    }
  },  
  resumenDiario: async (req, res, next) => {
    try {
      const { fecha } = req.query;
      let { page = 1, limit = 50 } = req.query;
      
      page = parseInt(page);
      limit = parseInt(limit);
      
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 50;
      
      console.log(`📊 Solicitando resumen diario para fecha: ${fecha || 'hoy'}, página: ${page}, límite: ${limit}`);
      
      const { resumen, ventas, totalVentas } = await ventaService.resumenDiario({ fecha, page, limit });
      
      const pages = Math.ceil(totalVentas / limit);
      
      return respondSuccess(req, res, 200, {
        resumen,
        ventas,
        pagination: {
          total: totalVentas,
          page,
          pages,
          limit
        }
      });
    } catch (err) {
      console.error('❌ Error al obtener resumen diario:', err);
      return respondError(req, res, 500, 'Error al obtener resumen diario: ' + err.message);
    }
  },
  
  validarCodigoCambio: async (req, res) => {
    try {
      const { codigo } = req.params;
      
      if (!codigo || !codigo.startsWith('TCC')) {
        return respondError(req, res, 400, 'Código de cambio inválido. Debe comenzar con TCC.');
      }
      
      const venta = await ventaService.validarCodigoCambio(codigo);
      
      return respondSuccess(req, res, 200, {
        message: 'Código de cambio válido',
        venta
      });
    } catch (error) {
      console.error('❌ Error al validar código de cambio:', error.message);
      return respondError(req, res, 404, error.message);
    }
  },

  obtenerVentasPendientes: async (req, res) => {
    try {
      console.log('📥 Petición recibida para obtener ventas pendientes');

      if (!req.user?.id) {
        return respondError(req, res, 401, 'No autenticado. Inicia sesión.');
      }

      const ventasPendientes = await ventaService.obtenerVentasPendientes();
      
      console.log(`✅ Se encontraron ${ventasPendientes.length} ventas pendientes`);
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

      const { venta_id, monto, metodo_pago } = req.body;

      if (!venta_id) {
        return respondError(req, res, 400, 'El ID de venta es obligatorio');
      }

      if (!monto || parseFloat(monto) <= 0) {
        return respondError(req, res, 400, 'El monto debe ser mayor a 0');
      }

      if (!metodo_pago) {
        return respondError(req, res, 400, 'El método de pago es obligatorio');
      }

      const resultado = await ventaService.registrarCobro({
        venta_id,
        monto: parseFloat(monto),
        metodo_pago,
        usuario_id: req.user.id
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
  }
};

export default ventaController;
