import axios from './api.js';

const auth = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`/auth/login`, { email, password });
      console.log('✅ Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al hacer login en backend:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, nuevaPassword) => {
    const response = await axios.post(`/auth/reset-password`, { token, nuevaPassword });
    return response.data;
  }
};

export default auth;
