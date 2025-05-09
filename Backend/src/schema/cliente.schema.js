import Joi from 'joi';

const clienteSchema = Joi.object({
  nombre: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'El nombre solo debe contener letras y espacios.',
      'any.required': 'El nombre del cliente es obligatorio.',
    }),
  telefono: Joi.string()
    .pattern(/^\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'El teléfono debe contener 8 dígitos (sin el +569).',
      'any.required': 'El teléfono del cliente es obligatorio.',
    }),
});

export default clienteSchema;
