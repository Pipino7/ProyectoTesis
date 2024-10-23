// categoria.schema.js

import Joi from 'joi';

// Esquema de validación para crear o actualizar una categoría
const categoriaSchema = Joi.object({
  nombre_categoria: Joi.string()
    .trim() // Elimina espacios en blanco al inicio y al final
    .pattern(/^[A-Za-z\s]+$/) 
    .min(2) // Mínimo 2 caracteres
    .max(100) 
    .required() // Campo obligatorio
    .messages({
      'string.base': 'El nombre de la categoría debe ser un texto.',
      'string.empty': 'El nombre de la categoría no puede estar vacío.',
      'string.pattern.base': 'El nombre de la categoría solo puede contener letras y espacios.',
      'string.min': 'El nombre de la categoría debe tener al menos 2 caracteres.',
      'string.max': 'El nombre de la categoría no puede exceder 100 caracteres.',
      'any.required': 'El nombre de la categoría es obligatorio.'
    })
});

export default categoriaSchema;
