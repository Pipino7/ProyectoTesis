import axios from './api.js'; 

const fardoService = {
  obtenerFardos: async (filtros = {}) => {
    const params = {
      ...filtros,
      orden: filtros.orden || 'desc',
      page: filtros.page || 1,
      limit: filtros.limit || 15,
    };


    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await axios.get('/fardos/obtener', { params });
    return response.data; 
  },

  crearFardo: async (datosFardo) => {
    const response = await axios.post('/fardos/crear', datosFardo);
    return response.data; 
  },

  eliminarFardo: async (codigo_fardo) => {
    const response = await axios.delete(`/fardos/${codigo_fardo}`);
    return response.data; 
  },

  restaurarFardo: async (codigo_fardo) => {
    const response = await axios.post(`/fardos/${codigo_fardo}/restaurar`);
    return response.data; 
  },

  obtenerFardoPorCodigo: async (codigo_fardo) => {
    const response = await axios.get(`/fardos/${codigo_fardo}`);
    return response.data; 
  },
};

export default fardoService;
