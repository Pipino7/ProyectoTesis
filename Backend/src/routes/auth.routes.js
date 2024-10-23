import { Router } from 'express';
import authController from '../controllers/auth.controllers.js';  // Controlador de auth

const router = Router();



// Ruta para iniciar sesión (login)
router.post("/login", authController.login);

// Ruta para solicitar restablecimiento de contraseña
router.post("/forgot-password", authController.solicitarResetPassword);

// Ruta para restablecer la contraseña
router.post("/reset-password", authController.restablecerPassword);

// Ruta para cerrar sesión (logout)
router.post("/logout", authController.logout);

export default router;
