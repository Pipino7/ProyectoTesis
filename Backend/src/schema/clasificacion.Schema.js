// src/schema/clasificacion.schema.js
import Joi from 'joi';
import categoriaSchema from './categoria.schema.js';

const clasificacionSchema = (context) => {
  let schema = Joi.object({
    codigo_fardo: Joi.string().required().messages({
      'any.required': 'El código de fardo es obligatorio.'
    }),
    nombre_categoria: categoriaSchema.extract('nombre_categoria'), // Utiliza el esquema de categoría
    cantidad: Joi.number().integer().min(1).optional(),
    precio: Joi.number().optional().allow(null)
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
