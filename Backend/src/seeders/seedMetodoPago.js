import AppDataSource from '../config/ConfigDB.js';
import MetodoPago from '../entities/metodo_pago.js';

const seedMetodosPago = async () => {
  const metodos = [
    'efectivo',
    'tarjeta',
    'transferencia',
    'mixto'
  ];
  const repo = AppDataSource.getRepository(MetodoPago);

  for (const nombre of metodos) {
    const exists = await repo.findOne({ where: { nombre_metodo: nombre } });
    if (!exists) {
      await repo.save(repo.create({ nombre_metodo: nombre }));
      console.log(`✅ MetodoPago '${nombre}' creado.`);
    } else {
      console.log(`ℹ️ MetodoPago '${nombre}' ya existe.`);
    }
  }
};

export default seedMetodosPago;
