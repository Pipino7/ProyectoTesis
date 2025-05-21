// src/routes/resumen.routes.js
import express from 'express';
import { ResumenController } from '../controllers/resumen.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';

const router = express.Router();
router.use(authenticationMiddleware);
router.get('/ultimos-dias', allowRoles('admin'), ResumenController.getUltimosDias);
router.get('/por-categoria', allowRoles('admin'), ResumenController.getEstadisticasPorCategoria);
router.get('/por-dia-semana', allowRoles('admin'), ResumenController.getPorDiaSemana);

export default router;
