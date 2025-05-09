import express from 'express';
import cambioController from '../controllers/cambio.controllers.js';
import { procesarCambioSchema } from '../schema/cambio.schema.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';

const router = express.Router();

router.post(
  '/registrar',
  authenticationMiddleware,
  allowRoles('admin', 'vendedor'),
  validationMiddleware(procesarCambioSchema),
  cambioController.registrarCambio
);

export default router;
