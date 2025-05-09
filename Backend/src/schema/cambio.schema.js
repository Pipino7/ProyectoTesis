import Joi from 'joi';

const cambioItemSchema = Joi.object({
  original: Joi.string()
    .length(10)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.base':   'El código de barra original debe ser un texto.',
      'string.pattern.base': 'El código de barra original debe contener solo números.',
      'string.length': 'El código de barra original debe tener exactamente 10 dígitos.',
      'any.required':  'El código de barra original es obligatorio.'
    }),
  nuevo: Joi.string()
    .length(10)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.base':   'El código de barra nuevo debe ser un texto.',
      'string.pattern.base': 'El código de barra nuevo debe contener solo números.',
      'string.length': 'El código de barra nuevo debe tener exactamente 10 dígitos.',
      'any.required':  'El código de barra nuevo es obligatorio.'
    }),
  cantidad: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base':   'La cantidad debe ser un número.',
      'number.integer':'La cantidad debe ser un número entero.',
      'number.min':    'La cantidad mínima es 1.',
      'any.required':  'La cantidad es obligatoria.'
    })
});

const procesarCambioSchema = Joi.object({
  codigo_cambio: Joi.string()
    .max(20)
    .required()
    .messages({
      'string.base':   'El código de cambio debe ser un texto.',
      'string.max':    'El código de cambio no puede exceder 20 caracteres.',
      'any.required':  'El código de cambio es obligatorio.'
    }),

  items_devueltos: Joi.array()
    .items(Joi.object({
      codigo_barra: Joi.string()
        .length(10)
        .pattern(/^\d+$/)
        .required()
        .messages({
          'string.base':   'El código de barra debe ser un texto.',
          'string.pattern.base': 'El código de barra debe contener solo números.',
          'string.length': 'El código de barra debe tener exactamente 10 dígitos.',
          'any.required':  'El código de barra es obligatorio.'
        }),
      cantidad: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
          'number.base':   'La cantidad debe ser un número.',
          'number.integer':'La cantidad debe ser un número entero.',
          'number.min':    'La cantidad mínima es 1.',
          'any.required':  'La cantidad es obligatoria.'
        })
    }))
    .min(1)
    .required()
    .messages({
      'array.base': 'Los items devueltos deben ser un arreglo.',
      'array.min':  'Debes indicar al menos un item a devolver.'
    }),

  items_nuevos: Joi.array()
    .items(Joi.object({
      codigo_barra: Joi.string()
        .length(10)
        .pattern(/^\d+$/)
        .required()
        .messages({
          'string.base':   'El código de barra debe ser un texto.',
          'string.pattern.base': 'El código de barra debe contener solo números.',
          'string.length': 'El código de barra debe tener exactamente 10 dígitos.',
          'any.required':  'El código de barra es obligatorio.'
        }),
      cantidad: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
          'number.base':   'La cantidad debe ser un número.',
          'number.integer':'La cantidad debe ser un número entero.',
          'number.min':    'La cantidad mínima es 1.',
          'any.required':  'La cantidad es obligatoria.'
        })
    }))
    .min(1)
    .required()
    .messages({
      'array.base': 'Los items nuevos deben ser un arreglo.',
      'array.min':  'Debes indicar al menos un item nuevo a llevar.'
    }),

  metodo_pago: Joi.string()
    .valid('efectivo', 'tarjeta', 'transferencia')
    .required()
    .messages({
      'any.only':    'El método de pago debe ser efectivo, tarjeta o transferencia.',
      'any.required': 'El método de pago es obligatorio.'
    }),

  motivo: Joi.string()
    .max(255)
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'El motivo debe ser un texto.',
      'string.max':  'El motivo no puede exceder los 255 caracteres.'
    })
});

const cambioSchema = Joi.object({
  codigo_cambio: Joi.string()
    .max(20)
    .required()
    .messages({
      'string.base':   'El código de cambio debe ser un texto.',
      'string.max':    'El código de cambio no puede exceder 20 caracteres.',
      'any.required':  'El código de cambio es obligatorio.'
    }),

  cambios: Joi.array()
    .items(cambioItemSchema)
    .min(1)
    .required()
    .messages({
      'array.base': 'El campo "cambios" debe ser un arreglo.',
      'array.min':  'Debes indicar al menos un par original→nuevo.'
    }),

  metodo_pago: Joi.string()
    .valid('efectivo', 'tarjeta', 'transferencia')
    .required()
    .messages({
      'any.only':    'El método de pago debe ser efectivo, tarjeta o transferencia.',
      'any.required': 'El método de pago es obligatorio.'
    }),

  motivo: Joi.string()
    .max(255)
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'El motivo debe ser un texto.',
      'string.max':  'El motivo no puede exceder los 255 caracteres.'
    })
});

export { cambioSchema, procesarCambioSchema };
