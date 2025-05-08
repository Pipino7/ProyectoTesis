// src/controllers/movimiento.controller.js
import MovimientoService from '../services/movimiento.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const MovimientoController = {

  registrarMovimiento: async (req, res) => {
    try {
      const { accion, cantidad, fardo_id, usuario_id, categoria_id, descripcion } = req.body;
      await movimientoService.registrarMovimiento({ accion, cantidad, fardo_id, usuario_id, categoria_id, descripcion });
      return respondSuccess(req, res, 201, { message: 'Movimiento registrado correctamente' });
    } catch (error) {
      return respondError(req, res, 500, 'Error al registrar el movimiento');
    }
  },


  obtenerMovimientosPorCodigo: async (req, res) => {
    try {
      const { codigo } = req.params;
      const movimientos = await MovimientoService.obtenerMovimientosPorCodigoFardo(codigo);
      return respondSuccess(req, res, 200, movimientos);
    } catch (error) {
      return respondError(req, res, 500, 'Error al obtener movimientos por código: ' + error.message);
    }
  },

  obtenerMovimientosPorFechas: async (req, res) => {
    try {
      const { inicio, fin } = req.query;
      const movimientos = await MovimientoService.obtenerMovimientosPorFechas(inicio, fin);
      return respondSuccess(req, res, 200, movimientos);
    } catch (error) {
      return respondError(req, res, 500, 'Error al obtener movimientos por fechas');
    }
  },
  obtenerResumenClasificacionDetallado: async (req, res) => {
    try {
      const { codigo } = req.params;
      const data = await MovimientoService.obtenerResumenClasificacionDetallado(codigo);
  
      res.status(200).json({
        state: 'Success',
        data,
      });
    } catch (error) {
      console.error('Error al obtener resumen detallado:', error);
      res.status(500).json({
        state: 'Error',
        message: error.message,
      });
    }

  },
  
  obtenerResumenClasificacion: async (req, res) => {
    try {
      const { codigo } = req.params;
      const resumen = await MovimientoService.obtenerResumenClasificacionPorFardo(codigo);
      return respondSuccess(req, res, 200, resumen);
    } catch (error) {
      console.error('Error en obtenerResumenClasificacion:', error);
      return respondError(req, res, 500, 'Error al obtener resumen de clasificación: ' + error.message);
    }
  },
};

export default MovimientoController;
