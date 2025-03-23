import Joi from 'joi';

const ventaSchema = Joi.object({
  // Método de pago
  metodo_pago: Joi.string()
    .valid('efectivo', 'tarjeta', 'transferencia', 'mixto', 'pendiente')
    .required()
    .messages({
      'string.base': 'El método de pago debe ser un texto.',
      'string.empty': 'Debes especificar el método de pago.',
      'any.only': 'El método de pago debe ser uno de los siguientes: efectivo, tarjeta, transferencia, mixto, pendiente.',
      'any.required': 'El método de pago es obligatorio.',
    }),

  // Códigos de prendas
  codigos_prendas: Joi.array()
    .items(
      Joi.string()
        .length(10)
        .pattern(/^\d+$/)
        .required()
        .messages({
          'string.base': 'Cada código de prenda debe ser un texto.',
          'string.pattern.base': 'Cada código de prenda debe contener exactamente 10 dígitos.',
          'string.empty': 'El código de prenda no puede estar vacío.',
          'string.length': 'Cada código de prenda debe tener exactamente 10 dígitos.',
          'any.required': 'El código de prenda es obligatorio.',
        })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Debes enviar una lista de códigos de prendas.',
      'array.min': 'Debes incluir al menos un código de prenda.',
      'any.required': 'El campo "codigos_prendas" es obligatorio.',
    }),

  // Descuentos (opcional)
  descuento: Joi.array()
    .items(
      Joi.object({
        codigo_barra_prenda: Joi.string()
          .length(10)
          .pattern(/^\d+$/)
          .required()
          .messages({
            'string.base': 'El código de barra en el descuento debe ser un texto.',
            'string.pattern.base': 'El código de barra en el descuento debe contener exactamente 10 dígitos.',
            'string.empty': 'El código de barra en el descuento no puede estar vacío.',
            'string.length': 'El código de barra en el descuento debe tener exactamente 10 dígitos.',
            'any.required': 'El código de barra en el descuento es obligatorio.',
          }),
        descuento: Joi.number()
          .positive()
          .required()
          .messages({
            'number.base': 'El descuento debe ser un número.',
            'number.positive': 'El descuento debe ser un número positivo mayor a 0.',
            'any.required': 'El descuento es obligatorio.',
          }),
      })
    )
    .optional()
    .messages({
      'array.base': 'El descuento debe ser una lista de objetos con códigos de barra y montos.',
    }),

  // Datos del cliente (opcional, pero obligatorio si es "pendiente")
  cliente: Joi.object({
    nombre: Joi.string().required().messages({
      'string.base': 'El nombre del cliente debe ser un texto.',
      'string.empty': 'El nombre del cliente no puede estar vacío.',
      'any.required': 'El nombre del cliente es obligatorio para ventas pendientes.',
    }),
    telefono: Joi.string()
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.base': 'El teléfono del cliente debe ser un texto.',
        'string.pattern.base': 'El teléfono debe contener solo números.',
        'string.empty': 'El teléfono del cliente no puede estar vacío.',
        'any.required': 'El teléfono del cliente es obligatorio para ventas pendientes.',
      }),
  })
    .when('metodo_pago', {
      is: 'pendiente',
      then: Joi.required().messages({
        'any.required': 'Los datos del cliente son obligatorios para ventas pendientes.',
      }),
      otherwise: Joi.optional(),
    }),
});

export default ventaSchema;
