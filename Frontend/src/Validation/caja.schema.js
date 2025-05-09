import * as yup from 'yup';

export const aperturaCajaSchema = yup.object().shape({
  monto_inicial: yup
    .number()
    .required('Debes ingresar un monto')
    .min(0, 'El monto no puede ser negativo')
    .max(1000000, 'El monto no puede exceder $1.000.000'),
});
