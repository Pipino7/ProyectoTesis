import Joi from 'joi';

const devolucionSchema = Joi.object({
    codigo_cambio: Joi.string()
    .pattern(/^TCC\d{10}$/) 
    .required()
    .messages({
      'string.pattern.base': 'El código de cambio debe seguir el formato TCCXXXXXXXXXX (TCC seguido de 10 dígitos).',
      'any.required': 'El código de cambio es obligatorio.'
    }),
  
  codigo_barra_devuelto: Joi.string()
    .length(10)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.base': 'El código de barra debe ser texto.',
      'string.pattern.base': 'El código de barra debe contener solo números.',
      'string.length': 'El código de barra debe tener exactamente 10 dígitos.',
      'any.required': 'El código de barra es obligatorio.'
    }),
  motivo: Joi.string().max(255).optional().allow('', null)
    .messages({
      'string.max': 'El motivo de la devolución no puede exceder los 255 caracteres.'
    })
});

export default devolucionSchema;
