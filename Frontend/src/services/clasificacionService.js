import axios from './api.js';

const clasificacionService = {
  clasificarPrendas: async (datosClasificacion) => {
    const response = await axios.post('/clasificacion/clasificar', datosClasificacion);
    return response.data;
  },

  obtenerPrendasBodega: async (codigo) => {
    const response = await axios.get(`/clasificacion/prendas-bodega/${codigo}`);
    return response.data;
  },

  obtenerResumenClasificacion: async (codigoFardo) => {
    const response = await axios.get(`/movimientos/resumen/${codigoFardo}`);
    return response.data.data;
  },

  obtenerResumenAgrupadoDesdePrendas: async (codigoFardo) => {
    const response = await axios.get(`/clasificacion/resumen-agrupado/${codigoFardo}`);
    return response.data.data;
  }
};

export default clasificacionService;
