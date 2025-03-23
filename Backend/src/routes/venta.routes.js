import express from 'express';
import validationMiddleware from '../middlewares/validationMiddleware.js';
import ventaSchema from '../schema/venta.schema.js';
import VentasController from '../controllers/venta.controllers.js';

const router = express.Router();

// Ruta para registrar una venta
router.post(
  '/registrar',
  validationMiddleware(ventaSchema), // Middleware de validación con Joi
  VentasController.registrarVenta // Llama al controlador
);

// Ruta para listar ventas (opcional, si ya tienes esta funcionalidad)
router.get(
  '/listar',
  VentasController.listarVentas // Llama al controlador para listar ventas
);

// Ruta para ver detalle de una venta específica (opcional)
router.get(
  '/detalle/:id',
  VentasController.verDetalleVenta // Llama al controlador para obtener el detalle de la venta
);

export default router;
