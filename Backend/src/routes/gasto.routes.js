import express from 'express';
import GastoController from '../controllers/gasto.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import gastoSchema from '../schema/gasto.schema.js';
import dbManagerMiddleware from '../middlewares/dbManager.middleware.js'; 

const router = express.Router();

router.use(dbManagerMiddleware); 
router.use(authenticationMiddleware);

router.post(
  '/crear', 
  allowRoles('admin', 'ventas'),
  validationMiddleware(gastoSchema),
  GastoController.crearGasto
);

router.delete(
  '/:id',
  allowRoles('admin', 'ventas'),
  GastoController.eliminarGasto
);

router.get(
  '/',
  allowRoles('admin', 'ventas'),
  GastoController.listarGastos
);

export default router;
