// src/routes/cobro.routes.js
import express from 'express';
import cobroController from '../controllers/cobro.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';
import dbManagerMiddleware from '../middlewares/dbManager.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);
router.use(dbManagerMiddleware);


router.get(
  '/ventas-pendientes',
  allowRoles('admin', 'ventas', 'cajero'),
  cobroController.obtenerVentasPendientes
);


router.post(
  '/registrar',
  allowRoles('admin', 'ventas', 'cajero'),
  cobroController.registrarCobro
);


router.get(
  '/venta/:venta_id',
  allowRoles('admin', 'ventas', 'cajero'),
  cobroController.obtenerCobrosPorVenta
);


router.get(
  '/resumen',
  allowRoles('admin', 'ventas', 'cajero'),
  cobroController.obtenerResumenCobros
);

router.get(
  '/cliente/:cliente_id',
  allowRoles('admin', 'ventas', 'cajero'),
  cobroController.obtenerDeudaCliente
);


router.post(
  '/cliente/registrar',
  allowRoles('admin', 'ventas', 'cajero'),
  cobroController.registrarCobroMultiple
);

export default router;