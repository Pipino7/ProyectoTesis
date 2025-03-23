// fardo.schema.js
import Joi from 'joi';
import categoriaSchema from './categoria.schema.js';    // Asegúrate de la ruta correcta
import proveedorSchema from './proveedor.schema.js';    // Asegúrate de la ruta correcta

// Extraer el esquema de 'nombre_categoria' de categoriaSchema
const nombreCategoriaSchema = categoriaSchema.extract('nombre_categoria');

// Extraer el esquema de 'nombre_proveedor' de proveedorSchema
const nombreProveedorSchema = proveedorSchema.extract('nombre_proveedor');

// Definir el esquema de fardo reutilizando los esquemas de categoría y proveedor
const fardoSchema = Joi.object({
  nombre_categoria: nombreCategoriaSchema,    // Reutiliza la validación de nombre_categoria
  nombre_proveedor: nombreProveedorSchema,    // Reutiliza la validación de nombre_proveedor
  
  fecha_adquisicion: Joi.date()
    .min('2019-01-01')
    .required()
    .messages({
      'any.required': 'La fecha de adquisición es obligatoria.',
      'date.base': 'La fecha de adquisición debe ser una fecha válida.',
      'date.min': 'La fecha de adquisición no puede ser anterior a 2019.'
    }),

  costo_fardo: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'El costo del fardo debe ser un número.',
      'number.positive': 'El costo del fardo debe ser mayor a 0.',
      'any.required': 'El costo del fardo es obligatorio.'
    }),

  cantidad_prendas: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'La cantidad de prendas debe ser un número.',
      'number.integer': 'La cantidad de prendas debe ser un número entero.',
      'number.min': 'La cantidad de prendas debe ser al menos 1.',
      'any.required': 'La cantidad de prendas es obligatoria.'
    }),
});

export default fardoSchema;
