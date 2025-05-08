import GastoService from '../services/GastoServices.js';
import { respondError, respondSuccess } from '../utils/resHandler.js';

const GastoController = {
  async crearGasto(req, res) {
    const usuario_id = req.user.id;
    const data       = req.body;

    try {
      const gasto = await GastoService.crearGasto(req.manager, usuario_id, data);
      return respondSuccess(req, res, 200, {
        mensaje: 'Gasto registrado correctamente.',
        gasto
      });
    } catch (error) {
      console.error('Error al crear gasto:', error.message);
      return respondError(req, res, 500, error.message);
    }
  },

  async eliminarGasto(req, res) {
    const usuario_id = req.user.id;
    const gasto_id   = parseInt(req.params.id, 10);

    try {
      const resultado = await GastoService.eliminarGasto(req.manager, usuario_id, gasto_id);
      return respondSuccess(req, res, 200, resultado);
    } catch (error) {
      console.error('Error al eliminar gasto:', error.message);
      return respondError(req, res, 500, error.message);
    }
  },

  async listarGastos(req, res) {
    const usuario_id = req.user.id;

    try {
      const gastos = await GastoService.listarGastosPorUsuario(req.manager, usuario_id);
      return respondSuccess(req, res, 200, { gastos });
    } catch (error) {
      console.error('Error al listar gastos:', error.message);
      return respondError(req, res, 500, error.message);
    }
  },
};

export default GastoController;
