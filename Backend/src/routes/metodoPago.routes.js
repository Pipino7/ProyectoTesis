import express from 'express';
import metodoPagoController from '../controllers/metodoPago.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';

const router = express.Router();

router.get(
  '/ver',
  authenticationMiddleware,
  metodoPagoController.obtenerMetodosPago
);

export default router;
