// src/validation/fardoSchema.js
import * as Yup from 'yup';

export const fardoSchema = Yup.object().shape({
  tipo_prenda: Yup.string().required('El tipo de prenda es obligatorio'),
  fecha_adquisicion: Yup.date().required('La fecha de adquisición es obligatoria'),
  nombre_proveedor: Yup.string().required('El nombre del proveedor es obligatorio'),
  costo_fardo: Yup.number()
    .positive('Debe ser un número positivo')
    .required('El costo del fardo es obligatorio'),
  cantidad_prendas: Yup.number()
    .integer('Debe ser un número entero')
    .positive('Debe ser un número positivo')
    .required('La cantidad de prendas es obligatoria'),
  precios: Yup.array()
    .of(
      Yup.object().shape({
        cantidad: Yup.number()
          .integer('Debe ser un número entero')
          .positive('Debe ser un número positivo')
          .required('La cantidad es obligatoria'),
        precio: Yup.number()
          .positive('Debe ser un número positivo')
          .required('El precio es obligatorio'),
      })
    )
    .min(1, 'Debe haber al menos un precio'),
});
