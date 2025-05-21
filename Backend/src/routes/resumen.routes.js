// src/routes/resumen.routes.js
import express from 'express';
import { ResumenController } from '../controllers/resumen.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';

const router = express.Router();
router.use(authenticationMiddleware);
router.get('/ultimos-dias', ResumenController.getUltimosDias);
router.get('/por-categoria', ResumenController.getEstadisticasPorCategoria);
router.get('/por-dia-semana', ResumenController.getPorDiaSemana);

export default router;
