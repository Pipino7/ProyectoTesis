// src/controllers/devolucionController.js
import devolucionService from '../services/devolucion.Services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const devolucionController = {
  registrarDevolucion: async (req, res) => {
    try {
      console.log('📥 Petición recibida para registrar devolución');
      console.log('🧾 Body original recibido:', req.body);

      if (!req.validated) {
        console.warn('⚠️ req.validated no está definido');
        return respondError(req, res, 400, 'Error de validación. Revisa el cuerpo de la solicitud.');
      }

      if (!req.user?.id) {
        console.warn('⚠️ Usuario no autenticado');
        return respondError(req, res, 401, 'No autenticado. Inicia sesión.');
      }

      // No incluir manager en el log para evitar problemas de circularidad
      const logData = { ...req.validated, usuario_id: req.user.id };
      console.log('📦 Datos validados a enviar al servicio de devolución:', logData);

      const data = {
        ...req.validated,
        usuario_id: req.user.id,
        manager: req.manager
      };

      const resultado = await devolucionService.registrarDevolucion(data);

      console.log('✅ Devolución registrada correctamente:', resultado);
      return respondSuccess(req, res, 201, resultado);

    } catch (error) {
      console.error('❌ Error al registrar devolución en el controlador:', error);
      return respondError(req, res, 500, 'Error al registrar la devolución: ' + error.message);
    }
  }
};

export default devolucionController;
