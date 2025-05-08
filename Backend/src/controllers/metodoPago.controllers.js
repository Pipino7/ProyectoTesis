import MetodoPagoService from '../services/metodoPago.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const metodoPagoController = {
  async obtenerMetodosPago(req, res) {
    try {
      const nombres = await MetodoPagoService.obtenerNombresMetodosPago();
      return respondSuccess(req, res, 200, nombres);
    } catch (error) {
      console.error('❌ Error al obtener métodos de pago:', error);
      return respondError(req, res, 500, 'Error al obtener métodos de pago');
    }
  }
};

export default metodoPagoController;
