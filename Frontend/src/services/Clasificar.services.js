import axios from './api.js';

const clasificarPrendas = async (datosClasificacion) => {
 
  const response = await axios.post('/clasificacion/clasificar', datosClasificacion);
  return response.data; 
};

const obtenerPrendasBodega = async (codigo) => {
  
  const response = await axios.get(`/clasificacion/prendas-bodega/${codigo}`);
  return response.data; 
};

const obtenerPrendasClasificadas = async (codigoFardo) => {
  
  const response = await axios.get(`/clasificacion/prendas-clasificadas/${codigoFardo}`);
  return response.data; 
};

export default {
  clasificarPrendas,
  obtenerPrendasBodega,
  obtenerPrendasClasificadas,
};
