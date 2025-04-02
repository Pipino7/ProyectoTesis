"use strict";

import AuthService from '../services/auth.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const AuthController = {
  // Controlador para iniciar sesión (login)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { token, usuario } = await AuthService.autenticarUsuario({ email, password });
      return respondSuccess(req, res, 200, { token, usuario });
    } catch (error) {
      return respondError(req, res, 400, error.message);
    }
  },

  // Controlador para solicitar restablecimiento de contraseña
  solicitarResetPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const resetToken = await AuthService.generarTokenReset(email);
      return respondSuccess(req, res, 200, {
        message: "Se ha enviado un correo con instrucciones para restablecer la contraseña.",
        resetToken
      });
    } catch (error) {
      console.error("Error en generarTokenReset:", error);
      return respondError(req, res, 400, "No se pudo enviar el correo de restablecimiento. Intente nuevamente más tarde.");
    }
  },

  // Controlador para restablecer la contraseña usando el token
  restablecerPassword: async (req, res) => {
    try {
      const { token, nuevaPassword } = req.body;
      await AuthService.resetPassword(token, nuevaPassword);
      return respondSuccess(req, res, 200, {
        message: "Contraseña restablecida exitosamente."
      });
    } catch (error) {
      return respondError(req, res, 400, error.message);
    }
  },

  // Controlador para cerrar sesión (logout)
  logout: (req, res) => {
    return respondSuccess(req, res, 200, {
      message: "Sesión cerrada exitosamente."
    });
  }
};

export default AuthController;
