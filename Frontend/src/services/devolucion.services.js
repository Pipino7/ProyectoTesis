import axios from './api.js';

const devolucionService = {

  registrarDevolucion: async (datos) => {
    try {
      const response = await axios.post('/devoluciones/registrar', datos);
      return response.data;
    } catch (error) {
      console.error('❌ Error al registrar devolución:', error);
      throw error;
    }
  },


  validarCodigoCambio: async (codigo) => {
    try {
      console.log('🔍 Frontend: Validando código de cambio:', codigo);
      if (!codigo || !codigo.startsWith('TCC')) {
        console.log('❌ Frontend: Código con formato inválido, debe comenzar con TCC');
      }
      const response = await axios.get(`/ventas/validar-codigo/${codigo}`);
      console.log('✅ Frontend: Respuesta exitosa:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Error al validar código de cambio:', error);
      console.error('Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};

export default devolucionService;