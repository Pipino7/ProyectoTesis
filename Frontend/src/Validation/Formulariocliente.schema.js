import * as yup from 'yup';

const formularioClienteSchema = yup.object().shape({
  nombre: yup
    .string()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios.')
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede exceder 100 caracteres.')
    .required('Debes ingresar el nombre del cliente.'),
    
  telefono: yup
    .string()
    .matches(/^[0-9]{8}$/, 'El teléfono debe tener exactamente 8 dígitos (sin +56).')
    .required('Debes ingresar el teléfono del cliente.')
});

export default formularioClienteSchema;
