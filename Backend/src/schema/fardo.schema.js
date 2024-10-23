// fardo.schema.js
import Joi from 'joi';

// Esquema de validación para crear o actualizar un fardo
const fardoSchema = Joi.object({
  fecha_adquisicion: Joi.date().required().messages({
    'any.required': 'La fecha de adquisición es obligatoria.'
  }),

  costo_fardo: Joi.number().positive().required().messages({
    'number.base': 'El costo del fardo debe ser un número.',
    'number.positive': 'El costo del fardo debe ser mayor a 0.',
    'any.required': 'El costo del fardo es obligatorio.'
  }),

  cantidad_prendas: Joi.number().integer().min(1).required().messages({
    'number.base': 'La cantidad de prendas debe ser un número.',
    'number.integer': 'La cantidad de prendas debe ser un número entero.',
    'number.min': 'La cantidad de prendas debe ser al menos 1.',
    'any.required': 'La cantidad de prendas es obligatoria.'
  }),
});

export default fardoSchema;
