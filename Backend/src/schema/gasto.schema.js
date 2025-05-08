import Joi from 'joi';

const gastoSchema = Joi.object({
  monto: Joi.number()
    .required()
    .min(1)
    .max(1000000)
    .messages({
      'number.base': 'El monto debe ser un número.',
      'number.empty': 'El monto es obligatorio.',
      'number.min': 'El monto mínimo es $1.',
      'number.max': 'El monto no puede superar los $1.000.000.',
      'any.required': 'El monto es obligatorio.'
    }),

  motivo: Joi.string()
    .required()
    .max(255)
    .messages({
      'string.base': 'El motivo debe ser texto.',
      'string.empty': 'El motivo es obligatorio.',
      'string.max': 'El motivo no puede superar los 255 caracteres.'
    }),

  tipo: Joi.string()
    .required()
    .messages({
      'any.only': 'El tipo debe ser uno de: caja, fardo, administrativo u otro.',
      'any.required': 'El tipo de gasto es obligatorio.'
    }),

  codigo_fardo: Joi.string().alphanum().max(10).optional(),
  codigo_barra_fardo: Joi.string().pattern(/^\d{10}$/).optional(),
})
  .custom((value, helpers) => {
    if (value.tipo === 'fardo') {
      if (!value.codigo_fardo && !value.codigo_barra_fardo) {
        return helpers.message('Debe ingresar el código del fardo o el código de barra del fardo.');
      }
      if (value.codigo_fardo && value.codigo_barra_fardo) {
        return helpers.message('Solo puede ingresar uno: código de fardo o código de barra del fardo, no ambos.');
      }
    } else {
      if (value.codigo_fardo || value.codigo_barra_fardo) {
        return helpers.message('No se debe ingresar código de fardo si el gasto no es de tipo fardo.');
      }
    }
    return value;
  });
  
export default gastoSchema;
