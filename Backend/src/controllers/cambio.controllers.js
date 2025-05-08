import cambioService from '../services/cambio.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const cambioController = {
  registrarCambio: async (req, res) => {
    try {
      const { codigo_cambio, items_devueltos, items_nuevos, motivo, metodo_pago } = req.body;
      const usuario_id = req.user.id;

      const resultado = await cambioService.procesarCambio({
        codigo_cambio,
        items_devueltos,
        items_nuevos,
        motivo,
        metodo_pago,
        usuario_id
      });

      return res.status(200).json({
        success: true,
        message: 'Cambio procesado correctamente',
        data: resultado
      });
    } catch (error) {
      console.error('Error al procesar cambio:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default cambioController;
