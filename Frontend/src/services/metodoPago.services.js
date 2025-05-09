import axios from './api'; 

const metodoPagoService = {
  async obtenerMetodosPago() {
    const response = await axios.get('/metodos-pago/ver', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.data; 
  }
};

export default metodoPagoService;
