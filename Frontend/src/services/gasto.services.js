// src/services/gasto.services.js
import axios from './api';

const gastoService = {
  crearGasto: async (datos) => {
    try {
      const response = await axios.post('/gastos/crear', datos);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  eliminarGasto: async (id) => {
    try {
      const response = await axios.delete(`/gastos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  listarGastos: async () => {
    try {
      const response = await axios.get('/gastos');
      return response.data.data;
    } catch (error) {
      console.error('Error listing expenses:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default gastoService;