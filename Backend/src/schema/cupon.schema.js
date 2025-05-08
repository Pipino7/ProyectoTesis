// src/schema/cupon.schema.js
import Joi from 'joi';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const cuponSchema = Joi.object({
  codigo: Joi.string()
    .max(20)
    .required()
    .messages({
      'string.base': 'El código debe ser un texto.',
      'string.max': 'El código no puede tener más de 20 caracteres.',
      'any.required': 'El código es obligatorio.'
    }),

  descripcion: Joi.string()
    .max(255)
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'La descripción debe ser texto.',
      'string.max': 'La descripción no puede exceder los 255 caracteres.'
    }),

  tipo: Joi.string()
    .valid('porcentaje', 'monto_fijo', '2x1', 'descuento_categoria')
    .required()
    .messages({
      'any.only': 'El tipo debe ser uno de: porcentaje, monto_fijo, 2x1, descuento_categoria.',
      'any.required': 'El tipo de cupón es obligatorio.'
    }),

  valor: Joi.when('tipo', {
    is: Joi.valid('porcentaje', 'monto_fijo', 'descuento_categoria'),
    then: Joi.number()
      .positive()
      .required()
      .messages({
        'number.base': 'El valor debe ser un número.',
        'number.positive': 'El valor debe ser un número positivo.',
        'any.required': 'El valor es obligatorio para este tipo de cupón.'
      }),
    otherwise: Joi.forbidden()
  }),

  categoria_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'El ID de categoría debe ser un número.',
      'number.integer': 'El ID de categoría debe ser un número entero.',
      'number.positive': 'El ID de categoría debe ser positivo.',
    }),

  fecha_inicio: Joi.string()
    .pattern(datePattern)
    .optional()
    .allow(null)
    .messages({
      'string.base': 'La fecha de inicio debe ser texto con formato YYYY-MM-DD.',
      'string.pattern.base': 'La fecha de inicio debe tener el formato YYYY-MM-DD.'
    }),

  fecha_expiracion: Joi.string()
    .pattern(datePattern)
    .optional()
    .allow(null)
    .messages({
      'string.base': 'La fecha de expiración debe ser texto con formato YYYY-MM-DD.',
      'string.pattern.base': 'La fecha de expiración debe tener el formato YYYY-MM-DD.'
    }),

  activo: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'El campo activo debe ser verdadero o falso.'
    })
});

// Para updates parciales
const cuponUpdateSchema = Joi.object({
  codigo: Joi.string().max(20),
  descripcion: Joi.string().max(255).allow(null, ''),
  tipo: Joi.string().valid('porcentaje', 'monto_fijo', '2x1', 'descuento_categoria'),
  valor: Joi.number().positive(),
  categoria_id: Joi.number().integer().positive().allow(null),
  fecha_inicio: Joi.string().pattern(datePattern).allow(null),
  fecha_expiracion: Joi.string().pattern(datePattern).allow(null),
  activo: Joi.boolean()
}).min(1);
const simularCuponSchema = Joi.object({
  cupon: Joi.string()
    .required()
    .messages({
      'any.required': 'Debes indicar el código del cupón a simular.',
      'string.base': 'El código del cupón debe ser texto.',
      'string.empty': 'El código del cupón no puede estar vacío.'
    }),

  prendas: Joi.array()
    .items(
      Joi.object({
        codigo_barra: Joi.string()
          .required()
          .messages({
            'any.required': 'Cada prenda debe tener un código de barra.',
            'string.base': 'El código de barra debe ser texto.',
            'string.empty': 'El código de barra no puede estar vacío.'
          }),
        cantidad: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'any.required': 'Debes indicar la cantidad de la prenda.',
            'number.base': 'La cantidad debe ser un número.',
            'number.integer': 'La cantidad debe ser un número entero.',
            'number.positive': 'La cantidad debe ser positiva.'
          }),
        precio: Joi.number()
          .positive()
          .required()
          .messages({
            'any.required': 'Debes indicar el precio de la prenda.',
            'number.base': 'El precio debe ser un número.',
            'number.positive': 'El precio debe ser positivo.'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'El campo prendas debe ser una lista.',
      'array.min': 'Debes incluir al menos una prenda.'
    })
});

export { cuponSchema, cuponUpdateSchema, simularCuponSchema };
