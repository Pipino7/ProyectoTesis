// proveedor.schema.js

import Joi from 'joi';

// Esquema de validación para crear o actualizar un proveedor
const proveedorSchema = Joi.object({
  nombre_proveedor: Joi.string()
    .trim() // Elimina espacios en blanco al inicio y al final
    .pattern(/^[A-Za-z\s]+$/) // Solo letras y espacios
    .min(2) // Mínimo 2 caracteres
    .max(50) // Máximo 50 caracteres
    .required() // Campo obligatorio
    .messages({
      'string.base': 'El nombre del proveedor debe ser un texto.',
      'string.empty': 'El nombre del proveedor no puede estar vacío.',
      'string.pattern.base': 'El nombre del proveedor solo puede contener letras y espacios.',
      'string.min': 'El nombre del proveedor debe tener al menos 2 caracteres.',
      'string.max': 'El nombre del proveedor no puede exceder 100 caracteres.',
      'any.required': 'El nombre del proveedor es obligatorio.'
    })
});

export default proveedorSchema;
