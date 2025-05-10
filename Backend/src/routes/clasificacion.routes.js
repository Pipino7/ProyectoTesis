// ✅ src/routes/clasificacion.routes.js
import express from 'express';
import ClasificacionController from '../controllers/clasificacion.controller.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import clasificacionSchema from '../schema/clasificacion.Schema.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { allowRoles } from '../middlewares/authorization.middleware.js';

const router = express.Router();


router.use(authenticationMiddleware);


router.post(
  '/clasificar',
  allowRoles('admin'),
  validationMiddleware(clasificacionSchema, 'clasificacion'),
  ClasificacionController.clasificarPrendas
);


router.post(
  '/corregir',
  allowRoles('admin'),
  validationMiddleware(clasificacionSchema, 'correccion'),
  ClasificacionController.corregirClasificacion
);


router.get(
  '/prendas-bodega/:codigo',
  ClasificacionController.obtenerPrendasBodega
);


router.get(
  '/prendas-clasificadas/:codigoFardo',
  ClasificacionController.obtenerPrendasClasificadas
);


router.get(
  '/resumen-agrupado/:codigo',
  ClasificacionController.obtenerResumenAgrupadoClasificadas
);

export default router;
