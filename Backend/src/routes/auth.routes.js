// src/routes/auth.routes.js
import express from 'express';
import AuthController from '../controllers/auth.controllers.js'; 
import {
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema
} from '../schema/auth.schema.js';
import validationMiddleware from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/login', validationMiddleware(loginSchema), AuthController.login);


router.post('/password-reset-request', validationMiddleware(passwordResetRequestSchema), AuthController.solicitarResetPassword);


router.post('/reset-password', validationMiddleware(passwordResetSchema), AuthController.restablecerPassword);

export default router;
