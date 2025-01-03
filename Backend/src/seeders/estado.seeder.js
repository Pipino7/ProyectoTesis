import AppDataSource from '../config/ConfigDB.js';
import Estado from '../entities/estado.js';

const seedEstados = async () => {
  const estadosIniciales = ['bodega', 'disponible', 'vendido', 'pendiente', 'efectivo', 'tarjeta', 'transferencia', 'mixto'];
  const estadoRepository = AppDataSource.getRepository(Estado);

  for (let nombre_estado of estadosIniciales) {
    const estadoExistente = await estadoRepository.findOne({ where: { nombre_estado } });
    if (!estadoExistente) {
      const nuevoEstado = estadoRepository.create({ nombre_estado });
      await estadoRepository.save(nuevoEstado);
      console.log(`Estado '${nombre_estado}' creado.`);
    }
  }
};

export default seedEstados;
