import axios from './api.js';

const movimientoService = {
  obtenerResumenClasificacion: async (codigoFardo) => {
    const response = await axios.get(`/movimientos/resumen/${codigoFardo}`);
    return response.data.data; 
  },

        obtenerResumenClasificacionDetallado: async (codigoFardo) => {
        const response = await axios.get(`/movimientos/resumen-detallado/${codigoFardo}`);
        return response.data.data;
      },
};

export default movimientoService;