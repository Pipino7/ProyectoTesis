// src/controllers/movimiento.controller.js
import movimientoService from '../services/movimiento.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const MovimientoController = {
  // 1. Registrar movimiento
  registrarMovimiento: async (req, res) => {
    try {
      const { accion, cantidad, fardo_id, usuario_id, categoria_id, descripcion } = req.body;
      await movimientoService.registrarMovimiento({ accion, cantidad, fardo_id, usuario_id, categoria_id, descripcion });
      return respondSuccess(req, res, 201, { message: 'Movimiento registrado correctamente' });
    } catch (error) {
      return respondError(req, res, 500, 'Error al registrar el movimiento');
    }
  },

  // 2. Obtener movimientos por código de fardo o código de barra
  obtenerMovimientosPorCodigo: async (req, res) => {
    try {
      const { codigo } = req.params;
      const movimientos = await movimientoService.obtenerMovimientosPorCodigoFardo(codigo);
      return respondSuccess(req, res, 200, movimientos);
    } catch (error) {
      return respondError(req, res, 500, 'Error al obtener movimientos por código: ' + error.message);
    }
  },

  // 3. Obtener movimientos por fechas
  obtenerMovimientosPorFechas: async (req, res) => {
    try {
      const { inicio, fin } = req.query;
      const movimientos = await movimientoService.obtenerMovimientosPorFechas(inicio, fin);
      return respondSuccess(req, res, 200, movimientos);
    } catch (error) {
      return respondError(req, res, 500, 'Error al obtener movimientos por fechas');
    }
  },

  // 4. Resumen de prendas clasificadas por categoría (por código o código de barra)
  obtenerResumenClasificacion: async (req, res) => {
    try {
      const { codigo } = req.params;
      const resumen = await movimientoService.obtenerResumenClasificacionPorFardo(codigo);
      return respondSuccess(req, res, 200, resumen);
    } catch (error) {
      console.error('Error en obtenerResumenClasificacion:', error);
      return respondError(req, res, 500, 'Error al obtener resumen de clasificación: ' + error.message);
    }
  },
};

export default MovimientoController;
