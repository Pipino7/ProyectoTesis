// src/routes/fardo.routes.js
import express from 'express';
import FardoController from '../controllers/fardo.controllers.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import fardoSchema from '../schema/fardo.schema.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';

const router = express.Router();
router.use(authenticationMiddleware);

router.post(
  '/crear',
  allowRoles('admin'),
  validationMiddleware(fardoSchema),
  FardoController.crearFardoController
);

router.delete(
  '/:codigo_fardo',
  allowRoles('admin'),
  FardoController.eliminarFardoController
);

router.post(
  '/fardos/:codigo_fardo/restaurar',
  allowRoles('admin'),
  FardoController.restaurarFardoController
);

router.get(
  '/fardos/:codigo_fardo',
  FardoController.obtenerFardoPorCodigoController
);

router.get(
  '/obtener',
  FardoController.obtenerTodosFardosController
);

export default router;
