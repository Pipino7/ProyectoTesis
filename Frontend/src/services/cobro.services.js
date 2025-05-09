// src/services/cobro.services.js
import axios from './api';

const cobroService = {

  obtenerVentasPendientes: async () => {
    try {
      const response = await axios.get('/cobros/ventas-pendientes');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener ventas pendientes:', error);
      throw error;
    }
  },


  registrarCobro: async (cobroData) => {
    try {
      const response = await axios.post('/cobros/registrar', cobroData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar cobro:', error);
      throw error;
    }
  },


  obtenerCobrosPorVenta: async (ventaId) => {
    try {
      const response = await axios.get(`/cobros/venta/${ventaId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener cobros para la venta ${ventaId}:`, error);
      throw error;
    }
  },


  obtenerResumenCobros: async (fechaInicio = null, fechaFin = null) => {
    try {
      let url = '/cobros/resumen';
      const params = [];
      
      if (fechaInicio) {
        params.push(`fecha_inicio=${fechaInicio}`);
      }
      
      if (fechaFin) {
        params.push(`fecha_fin=${fechaFin}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await axios.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener resumen de cobros:', error);
      throw error;
    }
  },


  obtenerDeudaCliente: async (clienteId) => {
    try {
      const response = await axios.get(`/cobros/cliente/${clienteId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error al obtener deuda del cliente ${clienteId}:`, error);
      throw error;
    }
  },


  registrarCobroMultiple: async (cobroData) => {
    try {
      const response = await axios.post('/cobros/cliente/registrar', cobroData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar cobro múltiple:', error);
      throw error;
    }
  }
};

export default cobroService;