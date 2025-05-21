// tests/testSetup.js
import request from 'supertest';
import app from '../app.js';
import AppDataSource from '../config/ConfigDB.js';
import initialSetup from '../config/initialSetup.js';

import { Categoria, Fardo, Prenda, Estado } from '../entities/index.js';

export default async function initTestContext() {

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();

    await AppDataSource.synchronize(true);

    await initialSetup();

    const manager = AppDataSource.manager;
    const categoria = await manager.save(Categoria, {
      nombre_categoria: 'TestCat'
    });


    const fardo = await manager.save(Fardo, {
      codigo_fardo: 'FAR123',
      codigo_barra_fardo: 'FBAR123',
      fecha_adquisicion: new Date('2025-01-01'),
      costo_fardo: 10000,
      costo_unitario_por_prenda: 100,
      cantidad_prendas: 100,
      status: 'activo',
      perdidas: 0
    });


    const estadoDisp = await manager.findOne(Estado, {
      where: { nombre_estado: 'disponible' }
    });
    await manager.save(Prenda, {
      codigo_barra_prenda: '4626749461',
      precio: 500,
      cantidad: 100,
      categoria: { id: categoria.id },
      fardo:     { id: fardo.id },
      estado:    { id: estadoDisp.id }
    });
  }

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@isamoda.com', password: 'cuenta123' });
  const token = login.body?.data?.token;

  const status = await request(app)
    .get('/api/caja/activa')
    .set('Authorization', `Bearer ${token}`);
  if (!status.body.data?.id) {
    await request(app)
      .post('/api/caja/abrir')
      .set('Authorization', `Bearer ${token}`)
      .send({ monto_inicial: 10000 });
  }

  return { token };
}
