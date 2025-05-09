import Joi from 'joi';
import clienteSchema from './cliente.schema.js';


const detalleItemSchema = Joi.object({
  codigo_barra: Joi.string()
    .length(10)
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.base': 'El código de barra debe ser texto.',
      'string.pattern.base': 'El código de barra debe contener solo números.',
      'string.length': 'El código de barra debe tener exactamente 10 dígitos.',
      'any.required': 'El código de barra es obligatorio.',
    }),
  cantidad: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'La cantidad debe ser un número.',
      'number.integer': 'La cantidad debe ser un número entero.',
      'number.min': 'La cantidad mínima es 1.',
      'any.required': 'La cantidad es obligatoria.',
    }),
  descuento: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'El descuento debe ser un número.',
      'number.min': 'El descuento no puede ser negativo.',
    }),
  motivo_descuento: Joi.string()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'El motivo del descuento debe ser un texto.',
      'string.max': 'El motivo del descuento no puede exceder los 255 caracteres.',
    })
});

const pagoContadoSchema = Joi.object({
  efectivo: Joi.number().min(0).optional(),
  tarjeta: Joi.number().min(0).optional(),
  transferencia: Joi.number().min(0).optional()
})
  .min(1)
  .messages({
    'object.min': 'Debes especificar un único método de pago para ventas contado.'
  });

const pagoMixtoSchema = Joi.object({
  efectivo: Joi.number().min(0).required().messages({
    'any.required': 'El pago en efectivo es obligatorio para ventas mixtas.'
  }),
  tarjeta: Joi.number().min(0).required().messages({
    'any.required': 'El pago con tarjeta es obligatorio para ventas mixtas.'
  }),
  transferencia: Joi.number().min(0).optional().default(0)
}).messages({
  'object.base': 'Para ventas mixtas debes especificar efectivo y tarjeta.'
});

const ventaSchema = Joi.object({
  metodo_pago: Joi.string()
    .valid('contado', 'credito', 'mixto')
    .required()
    .messages({
      'any.only': 'El tipo de venta debe ser contado, credito o mixto.',
      'any.required': 'El tipo de venta es obligatorio.'
    }),

  detalle: Joi.array()
    .items(detalleItemSchema)
    .min(1)
    .required()
    .messages({
      'array.base': 'El detalle debe ser una lista de prendas.',
      'array.min': 'Debes incluir al menos una prenda en el detalle.'
    }),

  cliente: Joi.when('metodo_pago', {
    is: 'credito',
    then: clienteSchema.required().messages({
      'any.required': 'Debes ingresar los datos del cliente para ventas a crédito.'
    }),
    otherwise: clienteSchema.optional()
  }),

  pago: Joi.when('metodo_pago', {
    switch: [
      { is: 'contado', then: pagoContadoSchema.required() },
      { is: 'mixto',   then: pagoMixtoSchema.required() }
    ],
    otherwise: Joi.object()
      .pattern(Joi.string(), Joi.number().min(0))
      .optional()
      .messages({
        'object.base': 'Si envías un pago parcial en crédito, debe ser un objeto con montos válidos.'
      })
  }),
  
  generar_ticket_cambio: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'El campo generar_ticket_cambio debe ser un valor booleano.'
    }),

  cupon: Joi.string()
    .max(20)
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'El cupón debe ser un texto.',
      'string.max': 'El cupón no puede tener más de 20 caracteres.'
    })
}).messages({
  'object.unknown': 'Se ha enviado un campo no permitido.'
});

export default ventaSchema;
