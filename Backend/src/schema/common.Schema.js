import Joi from 'joi';

const codigoFardoSchema = Joi.string()
  .regex(/^[A-Z]\d{4}$/)
  .required()
  .messages({
    'string.pattern.base': 'El código de fardo debe comenzar con una letra seguida de cuatro dígitos.',
    'string.empty': 'El código de fardo no puede estar vacío.',
  });

const codigoBarraSchema = Joi.string()
  .regex(/^\d{10}$/)
  .required()
  .messages({
    'string.pattern.base': 'El código de barra debe contener exactamente 10 dígitos sin letras ni símbolos.',
    'string.empty': 'El código de barra no puede estar vacío.',
  });


const cantidadSchema = Joi.number()
  .integer()
  .positive()
  .min(1)
  .required()
  .messages({
    'number.base': 'La cantidad debe ser un número entero.',
    'number.min': 'La cantidad debe ser al menos 1.',
  });

const precioSchema = Joi.number()
  .positive()
  .precision(2)
  .required()
  .messages({
    'number.base': 'El precio debe ser un número decimal positivo.',
    'number.positive': 'El precio debe ser mayor a 0.',
  });

const categoriaSchema = Joi.string()
  .alphanum()
  .min(3)
  .required()
  .messages({
    'string.base': 'La categoría debe ser un texto alfanumérico.',
    'string.empty': 'La categoría no puede estar vacía.',
    'string.min': 'La categoría debe tener al menos 3 caracteres.',
  });

export default {
  codigoFardoSchema,
  codigoBarraSchema,
  cantidadSchema,
  precioSchema,
  categoriaSchema,
};
