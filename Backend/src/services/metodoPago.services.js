import AppDataSource from '../config/ConfigDB.js'; 
import MetodoPago from '../entities/metodo_pago.js';

const MetodoPagoService = {
  async obtenerNombresMetodosPago() {
    const repo = AppDataSource.getRepository(MetodoPago);
    const metodos = await repo.find({
      select: ['nombre_metodo'],
    });
    return metodos.map(m => m.nombre_metodo);
  }
};

export default MetodoPagoService;
