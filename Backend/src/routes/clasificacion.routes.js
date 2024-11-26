// src/routes/clasificacion.routes.js
import express from 'express';
import ClasificacionController from '../controllers/clasificacion.controller.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import clasificacionSchema from '../schema/clasificacion.Schema.js';

const router = express.Router();

router.post(
  '/clasificar',
  validationMiddleware(clasificacionSchema, 'clasificacion'),
  ClasificacionController.clasificarPrendas
);

router.post(
  '/corregir',
  validationMiddleware(clasificacionSchema, 'correccion'),
  ClasificacionController.corregirClasificacion
);

router.get(
  '/historial/:codigo_fardo',
  ClasificacionController.obtenerHistorial
);

router.get(
  '/prendas-bodega/:codigo',
  ClasificacionController.obtenerPrendasBodega
);

router.get(
  '/prendas-clasificadas/:codigo_fardo',
  ClasificacionController.obtenerPrendasClasificadas
);


export default router;
