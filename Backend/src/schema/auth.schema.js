// src/schema/auth.schema.js
import Joi from 'joi';

// Esquema de validación para el inicio de sesión
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un correo válido.',
    'string.empty': 'El correo no puede estar vacío.',
    'any.required': 'El correo es obligatorio.',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'La contraseña no puede estar vacía.',
    'string.min': 'La contraseña debe tener al menos 6 caracteres.',
    'string.max': 'La contraseña no puede tener más de 100 caracteres.',
    'any.required': 'La contraseña es obligatoria.',
  }),
});

// Esquema de validación para la solicitud de restablecimiento de contraseña
const passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El correo debe ser un correo válido.',
    'string.empty': 'El correo no puede estar vacío.',
    'any.required': 'El correo es obligatorio.',
  }),
});

// Esquema de validación para restablecer la contraseña
const passwordResetSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'El token no puede estar vacío.',
    'any.required': 'El token es obligatorio.',
  }),
  nuevaPassword: Joi.string().min(6).max(100).required().messages({
    'string.base': 'La nueva contraseña debe ser un texto.',
    'string.empty': 'La nueva contraseña no puede estar vacía.',
    'string.min': 'La nueva contraseña debe tener al menos 6 caracteres.',
    'string.max': 'La nueva contraseña no puede tener más de 100 caracteres.',
    'any.required': 'La nueva contraseña es obligatoria.',
  }),
});


export { loginSchema, passwordResetRequestSchema, passwordResetSchema };

export default {
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
};
