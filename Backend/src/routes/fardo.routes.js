import express from 'express';
import FardoController from '../controllers/fardo.controllers.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import fardoSchema from '../schema/fardo.schema.js';
import { isAdmin } from '../middlewares/authorization.middleware.js'; // Importación corregida
import authenticationMiddleware from '../middlewares/authentication.middleware.js';

const router = express.Router();

router.use(authenticationMiddleware);

router.post(
  '/crear',
  isAdmin,
  validationMiddleware(fardoSchema),
  FardoController.crearFardoController
);

router.delete(
  '/:codigo_fardo',
  isAdmin,
  FardoController.eliminarFardoController
);

router.post(
  '/fardos/:codigo_fardo/restaurar',
  isAdmin,
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
