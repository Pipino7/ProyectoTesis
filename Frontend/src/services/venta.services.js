import axios from './api'; 

const ventaService = {
  crearVenta: async (ventaData) => {
    const response = await axios.post('/ventas/crear', ventaData);
    return response.data;
  },

  validarPrenda: async (codigo_barra) => {
    const response = await axios.get(`/ventas/validar-prenda/${codigo_barra}`);
    return response.data.data; 
  },

  obtenerResumenDiario: async (fecha = null) => {
    const url = fecha ? `/ventas/resumen-diario?fecha=${fecha}` : '/ventas/resumen-diario';
    const response = await axios.get(url);
    return response.data.data;
  },


  obtenerVentasPendientes: async () => {
    try {
      const response = await axios.get('/ventas/pendientes');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener ventas pendientes:', error);
      throw error;
    }
  },


  registrarCobro: async (cobroData) => {
    try {
      const response = await axios.post('/ventas/registrar-cobro', cobroData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar cobro:', error);
      throw error;
    }
  }
};

export default ventaService;
