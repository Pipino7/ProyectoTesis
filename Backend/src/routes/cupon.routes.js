// src/routes/cupon.routes.js
import express from 'express';
import cuponController from '../controllers/cupon.controllers.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';
import { cuponSchema, cuponUpdateSchema, simularCuponSchema } from '../schema/cupon.schema.js';
import dbManagerMiddleware from '../middlewares/dbManager.middleware.js';
import debugBodyMiddleware from '../middlewares/debugBodyMiddleware.js';

const router = express.Router();
router.use(dbManagerMiddleware); 

router.post(
    '/crear',
    authenticationMiddleware,
    allowRoles('admin'),
    validationMiddleware(cuponSchema),
    cuponController.crearCupon
  );
  
  router.patch(
    '/cambiar-estado/:id',
    authenticationMiddleware,
    allowRoles('admin'),
    cuponController.cambiarEstado
  );
  
  router.patch(
    '/editar/:id',
    authenticationMiddleware,
    allowRoles('admin'),
    validationMiddleware(cuponUpdateSchema),
    cuponController.editarCupon
  );
  
  router.get(
    '/activos',
    authenticationMiddleware,
    allowRoles('admin', 'vendedor'),
    cuponController.obtenerCuponesActivos
  );
// Endpoint para simular cupones
router.post(
  '/simular-descuento',
  authenticationMiddleware,
  allowRoles('admin', 'vendedor'),
  debugBodyMiddleware, 
  validationMiddleware(simularCuponSchema),
  dbManagerMiddleware,
  cuponController.simularDescuentoCupon
);


  
export default router;
