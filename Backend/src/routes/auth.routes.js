// src/routes/auth.routes.js
import express from 'express';
import authControllers from '../controllers/auth.controllers.js';
import { loginSchema, passwordResetRequestSchema, passwordResetSchema } from '../schema/auth.schema.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Ruta para iniciar sesión (login) con validación
router.post('/login', validationMiddleware(loginSchema), authControllers.login);

// Ruta para solicitar restablecimiento de contraseña con validación
router.post('/password-reset-request', validationMiddleware(passwordResetRequestSchema), authControllers.solicitarResetPassword);

// Ruta para restablecer la contraseña usando el token con validación
router.post('/reset-password', validationMiddleware(passwordResetSchema), authControllers.restablecerPassword);

export default router;
