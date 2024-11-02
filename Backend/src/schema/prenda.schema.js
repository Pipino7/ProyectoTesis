import Joi from 'joi';

const prendaSchema = Joi.object({


  precio: Joi.number()
    .precision(2)
    .positive()
    .optional()  
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
    .optional()  
    .allow(null)
    .messages({
      'string.base': 'El código de barras de la prenda debe ser un texto.',
      'string.empty': 'El código de barras de la prenda no puede estar vacío.',
      'string.max': 'El código de barras de la prenda no puede exceder 255 caracteres.',
    }),


});

export default prendaSchema;
