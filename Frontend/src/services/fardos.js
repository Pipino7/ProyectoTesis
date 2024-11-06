import api from './api'; // Asegúrate de que la ruta sea correcta
const fardoService = {
  obtenerFardos: async (filtros = {}) => {
    try {
      // Crear objeto de parámetros sin valores nulos
      const params = {};
      if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
      if (filtros.proveedor) params.proveedor = filtros.proveedor;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.precioMin) params.precioMin = filtros.precioMin;
      if (filtros.precioMax) params.precioMax = filtros.precioMax;
      params.orden = filtros.orden || 'desc';
      params.page = filtros.page || 1;
      params.limit = filtros.limit || 15;

      const response = await api.get('/api/fardos/obtener', { params });
      return response.data;
    } catch (error) {
      console.error("Error al obtener fardos:", error);
      throw error;
    }
  },

  // Crear un nuevo fardo
  crearFardo: async (datosFardo) => {
    try {
      const response = await api.post('api/fardos/crear', datosFardo);
      return response.data;
    } catch (error) {
      console.error("Error al crear fardo:", error);
      throw error;
    }
  },

  // Eliminar un fardo por su código
  eliminarFardo: async (codigo_fardo) => {
    try {
      const response = await api.delete(`api/fardos/${codigo_fardo}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar fardo:", error);
      throw error;
    }
  },

  // Restaurar un fardo eliminado
  restaurarFardo: async (codigo_fardo) => {
    try {
      const response = await api.post(`api/fardos/${codigo_fardo}/restaurar`);
      return response.data;
    } catch (error) {
      console.error("Error al restaurar fardo:", error);
      throw error;
    }
  },

  // Obtener un fardo por su código
  obtenerFardoPorCodigo: async (codigo_fardo) => {
    try {
      const response = await api.get(`api/fardos/${codigo_fardo}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener fardo por código:", error);
      throw error;
    }
  },
};

// Exportación predeterminada del servicio
export default fardoService;
