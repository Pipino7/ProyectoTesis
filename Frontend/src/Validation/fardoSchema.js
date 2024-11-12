// src/validation/fardoSchema.js
import * as Yup from 'yup';

const fardoSchema = Yup.object().shape({
  fecha_adquisicion: Yup.date()
  .typeError('La fecha de adquisición debe ser una fecha válida') 
  .required('La fecha de adquisición es obligatoria'), 
  
  nombre_proveedor: Yup.string()
  .required('El nombre del proveedor es obligatorio')
  .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre del proveedor solo puede contener letras y espacios'),
  
  costo_fardo: Yup.number()
    .typeError('El costo del fardo es obligatorio y debe ser un número válido') 
    .positive('El costo del fardo debe ser un número positivo')
    .required('El costo del fardo es obligatorio'),
  
  cantidad_prendas: Yup.number()
    .typeError('La cantidad de prendas es obligatoria y debe ser un número válido') 
    .integer('La cantidad de prendas debe ser un número entero')
    .positive('La cantidad de prendas debe ser un número positivo')
    .required('La cantidad de prendas es obligatoria'),

  nombre_categoria: Yup.string()
    .required('Debe seleccionar una categoría')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'La categoría solo puede contener letras'), 

  precios: Yup.array()
    .of(
      Yup.object().shape({
        cantidad: Yup.number()
          .typeError('La cantidad es obligatoria y debe ser un número válido') 
          .integer('Debe ser un número entero')
          .positive('Debe ser un número positivo')
          .required('La cantidad es obligatoria'),
        precio: Yup.number()
          .typeError('El precio es obligatorio y debe ser un número válido') 
          .positive('Debe ser un número positivo')
          .required('El precio es obligatorio'),
      })
    )
    .min(1, 'Debe haber al menos un precio'),
});

export default fardoSchema;
