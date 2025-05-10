// src/schema/clasificacion.Schema.js
import Joi from 'joi';
import categoriaSchema from './categoria.schema.js';

const clasificacionSchema = (context) => {
  let schema = Joi.object({
    codigo_fardo: Joi.string().required().messages({
      'any.required': 'El código de fardo es obligatorio.'
    }),
    nombre_categoria: categoriaSchema.extract('nombre_categoria'),
    cantidad: Joi.number().integer().min(1).optional(),
    precio: Joi.number()
      .min(0)
      .max(100000)
      .required()
      .messages({
        'number.base': 'El precio debe ser un número.',
        'number.max': 'El precio no puede exceder los $100.000.',
        'any.required': 'El precio es obligatorio.'
      })
  });

  if (context === 'correccion') {
    schema = schema.append({
      cantidad_correcta: Joi.number().integer().min(0).required().messages({
        'number.base': 'La corrección de cantidad debe ser un número entero.',
        'number.min': 'La corrección de cantidad no puede ser negativa.',
        'any.required': 'La corrección de cantidad es obligatoria.'
      })
    });
  }

  return schema;
};

export default clasificacionSchema;
