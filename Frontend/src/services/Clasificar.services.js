import api from './api';


const clasificarPrendas = async (datosClasificacion) => {
  return await api.post('/api/clasificacion/clasificar', datosClasificacion);
};


const obtenerPrendasBodega = async (codigo) => {
    const response = await api.get(`/api/clasificacion/prendas-bodega/${codigo}`);
    return response.data; 
  };

const obtenerPrendasClasificadas = async (codigoFardo) => {
    try {
      const response = await api.get(`/api/clasificacion/prendas-clasificadas/${codigoFardo}`);
      return response.data; // Devuelve los datos directamente
    } catch (error) {
      console.error('Error al obtener prendas clasificadas:', error);
      throw error; // Lanza el error para manejarlo en el componente
    }
  };
export default {
  clasificarPrendas,
  obtenerPrendasBodega,
  obtenerPrendasClasificadas, 
};
