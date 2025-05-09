// src/seeders/seedEstados.js
import AppDataSource from '../config/ConfigDB.js';
import Estado from '../entities/estado.js';

const seedEstados = async () => {
  const estadosIniciales = [
    'bodega',
    'disponible',
    'vendida',
    'pendiente',
    'pagada',
    'parcial',
    'abierta',
    'cerrada',
  ];
  const repo = AppDataSource.getRepository(Estado);

  for (const nombre of estadosIniciales) {
    const exists = await repo.findOne({ where: { nombre_estado: nombre } });
    if (!exists) {
      await repo.save(repo.create({ nombre_estado: nombre }));
      console.log(`✅ Estado '${nombre}' creado.`);
    } else {
      console.log(`ℹ️ Estado '${nombre}' ya existe.`);
    }
  }
};

export default seedEstados;
