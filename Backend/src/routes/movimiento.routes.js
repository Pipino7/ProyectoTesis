// src/routes/movimiento.routes.js
import { Router } from 'express';
import movimientoController from '../controllers/movimiento.controller.js';

const router = Router();

// 1. Registrar un movimiento
router.post('/', movimientoController.registrarMovimiento);

// 2. Obtener movimientos por rango de fechas
router.get('/rango/fechas', movimientoController.obtenerMovimientosPorFechas);

// 3. Obtener resumen de clasificación por fardo
router.get('/resumen/:codigo', movimientoController.obtenerResumenClasificacion);

// 4. Obtener movimientos por código de fardo o código de barra
router.get('/:codigo', movimientoController.obtenerMovimientosPorCodigo);

export default router;
