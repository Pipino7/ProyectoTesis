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
  },

  obtenerResumenUltimosDias: async (dias = 7) => {
    try {
      const response = await axios.get(`/resumen/ultimos-dias?dias=${dias}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener resumen de últimos días:', error);
      throw error;
    }
  },

  obtenerResumenPorRango: async (fechaInicio, fechaFin) => {
    try {
      const response = await axios.get(`/resumen/por-rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener resumen por rango:', error);
      throw error;
    }
  },

  obtenerEstadisticasPorCategoria: async (fechaInicio, fechaFin, orderBy = 'monto', orden = 'desc') => {
    try {
      const response = await axios.get(`/resumen/por-categoria?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&orderBy=${orderBy}&orden=${orden}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estadísticas por categoría:', error);
      throw error;
    }
  },

  obtenerResumenPorDiaSemana: async (semanas = 4) => {
    try {
      const response = await axios.get(`/resumen/por-dia-semana?semanas=${semanas}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener resumen por día de semana:', error);
      throw error;
    }
  }
};

export default ventaService;
