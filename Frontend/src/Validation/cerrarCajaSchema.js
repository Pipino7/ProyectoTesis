// src/Validation/cerrarCajaSchema.js
import * as Yup from 'yup';

const MONTO_MAXIMO = 2000000; // 2.000.000 pesos como límite máximo

const cerrarCajaSchema = Yup.object().shape({
  monto_declarado: Yup.number()
    .typeError('El monto contado es obligatorio y debe ser un número válido')
    .positive('El monto contado debe ser un número positivo')
    .max(MONTO_MAXIMO, `El monto máximo permitido es de $${MONTO_MAXIMO.toLocaleString('es-CL')}`)
    .required('El monto contado es obligatorio'),
  
  observacion: Yup.string()
    .max(250, 'La observación no puede exceder los 250 caracteres')
});

export default cerrarCajaSchema;