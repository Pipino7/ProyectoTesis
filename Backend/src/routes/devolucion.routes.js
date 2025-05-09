// src/routes/devolucion.routes.js
import express from 'express';
import devolucionController from '../controllers/devolucion.Controllers.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import devolucionSchema from '../schema/devolucion.schema.js';
import dbManagerMiddleware from '../middlewares/dbManager.middleware.js'; 

const router = express.Router();

router.post(
  '/registrar',
  authenticationMiddleware,
  dbManagerMiddleware, 
  validationMiddleware(devolucionSchema, 'body'),
  devolucionController.registrarDevolucion
);

export default router;
