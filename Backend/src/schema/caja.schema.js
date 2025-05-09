import Joi from 'joi';

const abrirCajaSchema = Joi.object({
  monto_inicial: Joi.number()
    .required()
    .min(0)
    .max(1000000)
    .messages({
      'number.base': 'El monto inicial debe ser un número.',
      'number.empty': 'El monto inicial no puede estar vacío.',
      'number.min': 'El monto inicial no puede ser negativo.',
      'number.max': 'El monto inicial no puede ser mayor a $1.000.000.',
      'any.required': 'El monto inicial es obligatorio.'
    }),
});

const cerrarCajaSchema = Joi.object({
  monto_declarado: Joi.number()
    .min(0)
    .max(2000000)
    .optional()
    .messages({
      'number.base': 'El monto declarado debe ser un número.',
      'number.min': 'El monto declarado no puede ser negativo.',
      'number.max': 'El monto declarado no puede superar los $2.000.000.'
    }),
  observacion: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.base': 'La observación debe ser texto.',
      'string.max': 'La observación no puede tener más de 255 caracteres.'
    }),
});

export default {
  abrirCajaSchema,
  cerrarCajaSchema,
};
