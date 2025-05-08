// src/services/cuponService.js
import axios from './api.js';

// cuponService.js

const cuponService = {
  simularDescuento: async ({ cupon, detalle }) => {
    const payload = {
      cupon,
      prendas: detalle
    };
  
    console.log("📤 Enviando payload a backend:", JSON.stringify(payload, null, 2));
  
    const response = await axios.post('/cupones/simular-descuento', payload);
  
    // ✅ Aquí extraes correctamente la respuesta desde el nivel correcto
    return response.data.data.resumen;
  },
  

  obtenerCuponesActivos: async () => {
    const response = await axios.get('/cupones/activos');
    return response.data.data.cupones;
  }
};

export default cuponService;

