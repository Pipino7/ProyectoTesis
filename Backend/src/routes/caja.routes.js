import express from 'express';
import CajaController from '../controllers/caja.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import cajaSchema from '../schema/caja.schema.js';
import dbManagerMiddleware from '../middlewares/dbManager.middleware.js'; // ✅

const router = express.Router();

router.use(dbManagerMiddleware); 

router.post(
  '/abrir',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  validationMiddleware(cajaSchema.abrirCajaSchema),
  CajaController.abrirCaja
);

router.get(
  '/resumen',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  CajaController.obtenerResumenDeCaja
);

router.get(
  '/por-fecha',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  CajaController.obtenerCajaPorFecha
);

router.post(
  '/cerrar',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  validationMiddleware(cajaSchema.cerrarCajaSchema),
  CajaController.cerrarCaja
);

router.get(
  '/activa',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  CajaController.verificarCajaActiva
);

// Nueva ruta para obtener histórico de cajas
router.get(
  '/historico',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  CajaController.obtenerHistoricoCajas
);

export default router;
