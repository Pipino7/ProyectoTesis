import Joi from 'joi';

// Esquema de validación para el registro de usuario
export const userRegisterSchema = Joi.object({
  nombre: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)  // Permitir solo letras y espacios
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'El nombre debe ser un texto.',
      'string.empty': 'El nombre no puede estar vacío.',
      'string.min': 'El nombre debe tener al menos 3 caracteres.',
      'string.max': 'El nombre no puede tener más de 30 caracteres.',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios.',
      'any.required': 'El nombre es obligatorio.',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El correo debe ser un correo válido.',
      'string.empty': 'El correo no puede estar vacío.',
      'any.required': 'El correo es obligatorio.',
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{6,}$'))  // Validación robusta
    .required()
    .messages({
      'string.base': 'La contraseña debe ser un texto.',
      'string.empty': 'La contraseña no puede estar vacía.',
      'string.min': 'La contraseña debe tener al menos 6 caracteres.',
      'string.max': 'La contraseña no puede tener más de 100 caracteres.',
      'string.pattern.base': 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
      'any.required': 'La contraseña es obligatoria.',
    }),
});

// Esquema de validación para el login de usuario
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El correo debe ser un correo válido.',
      'string.empty': 'El correo no puede estar vacío.',
      'any.required': 'El correo es obligatorio.',
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.base': 'La contraseña debe ser un texto.',
      'string.empty': 'La contraseña no puede estar vacía.',
      'string.min': 'La contraseña debe tener al menos 6 caracteres.',
      'string.max': 'La contraseña no puede tener más de 100 caracteres.',
      'any.required': 'La contraseña es obligatoria.',
    }),
});
