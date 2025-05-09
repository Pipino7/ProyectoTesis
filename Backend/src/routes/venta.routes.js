import express from 'express';
import ventaController from '../controllers/venta.controller.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js'; // 👈 asegúrate de importar esto
import ventaSchema from '../schema/venta.schema.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';
import dbManagerMiddleware from '../middlewares/dbManager.middleware.js'; // 👈 asegúrate de importar esto


const router = express.Router();
router.use(dbManagerMiddleware); 
router.post(
  '/crear',
  authenticationMiddleware,  
  validationMiddleware(ventaSchema, 'body'),
  ventaController.crearVenta
);
router.get(
  '/validar-prenda/:codigo_barra',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  dbManagerMiddleware, 
  ventaController.validarPrendaParaVenta
);

router.get(
  '/resumen-diario',
  authenticationMiddleware,
  ventaController.resumenDiario
);

router.get(
  '/validar-codigo/:codigo',
  authenticationMiddleware,
  allowRoles('admin', 'ventas'),
  ventaController.validarCodigoCambio
);
router.get(
  '/pendientes',
  authenticationMiddleware,
  allowRoles('admin', 'ventas', 'cajero'),
  ventaController.obtenerVentasPendientes
);

router.post(
  '/registrar-cobro',
  authenticationMiddleware,
  allowRoles('admin', 'ventas', 'cajero'),
  ventaController.registrarCobro
);

export default router;
