import { Router } from 'express';
import movimientoController from '../controllers/movimiento.controller.js';

const router = Router();

router.post('/', movimientoController.registrarMovimiento);


router.get('/rango/fechas', movimientoController.obtenerMovimientosPorFechas);


router.get('/resumen/:codigo', movimientoController.obtenerResumenClasificacion);


router.get('/:codigo', movimientoController.obtenerMovimientosPorCodigo);

router.get('/resumen-detallado/:codigo', movimientoController.obtenerResumenClasificacionDetallado);
export default router;
