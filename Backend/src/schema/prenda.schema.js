import Joi from 'joi';

// Esquema de validación para crear o actualizar una prenda
const prendaSchema = Joi.object({
  // Referencia a la categoría de la prenda
  categoria_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID de la categoría debe ser un número.',
      'number.integer': 'El ID de la categoría debe ser un número entero.',
      'number.positive': 'El ID de la categoría debe ser un número positivo.',
      'any.required': 'El ID de la categoría es obligatorio.',
    }),

  precio: Joi.number()
    .precision(2)
    .positive()
    .optional()  // Ahora es opcional hasta que se clasifique
    .allow(null)
    .messages({
      'number.base': 'El precio debe ser un número.',
      'number.positive': 'El precio debe ser mayor a 0.',
    }),

  cantidad: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'La cantidad debe ser un número entero.',
      'number.min': 'La cantidad debe ser al menos 1.',
      'any.required': 'La cantidad es obligatoria.',
    }),

  codigo_barra_prenda: Joi.string()
    .trim()
    .max(255)
    .optional()  // Opcional hasta que se clasifique
    .allow(null)
    .messages({
      'string.base': 'El código de barras de la prenda debe ser un texto.',
      'string.empty': 'El código de barras de la prenda no puede estar vacío.',
      'string.max': 'El código de barras de la prenda no puede exceder 255 caracteres.',
    }),

  estado_prenda: Joi.string()
    .valid('bodega', 'disponible', 'vendida', 'fiado',)
    .default('bodega')  // Estado inicial
    .messages({
      'any.only': 'El estado de la prenda debe ser "bodega", "disponible", "vendida", "fiado" .',
    }),

  fardo_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'El ID del fardo debe ser un número.',
      'number.integer': 'El ID del fardo debe ser un número entero.',
      'number.positive': 'El ID del fardo debe ser un número positivo.',
    }),
});

export default prendaSchema;
