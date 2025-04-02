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
    const token = localStorage.getItem('token');
    
    console.log('📦 Payload que se envía:', datosFardo);
    console.log('🔐 Token obtenido del localStorage:', token);
  
    if (!token) {
      console.warn('⚠️ No se encontró token en localStorage');
    }
  
    try {
      const response = await axios.post('/fardos/crear', datosFardo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear fardo:', error);
      if (error.response) {
        console.error('📨 Respuesta del servidor:', error.response.data);
        console.error('📄 Status:', error.response.status);
        console.error('📃 Headers:', error.response.headers);
      } else if (error.request) {
        console.error('📭 No hubo respuesta del servidor:', error.request);
      } else {
        console.error('⚙️ Error en la configuración de la petición:', error.message);
      }
      throw error; // para que el frontend lo pueda capturar también
    }
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
