import { DataSource } from 'typeorm';
import fardo from '../entities/fardo.js';
import prenda from '../entities/prenda.js';
import categoria from '../entities/categoria.js';
import venta from '../entities/venta.js';
import detalle_venta from '../entities/detalle_venta.js';
import proveedor from '../entities/proveedor.js';
import usuario from '../entities/usuario.js';
import cliente from '../entities/cliente.js';  
import estado from '../entities/estado.js';  
import HistorialClasificacion from '../entities/historialclasificacion.js';

import { DB_URL } from './configEnv.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: DB_URL,
  synchronize: true,  // Usar `false` en producción para usar migraciones
  logging: false,
  entities: [
    fardo,
    prenda,
    categoria,
    venta,
    detalle_venta,
    proveedor,
    usuario,
    cliente,
    estado,
    HistorialClasificacion
    
  ],
  migrations: ['src/migrations/*.js'],  
  migrationsTableName: 'migrations_history',  
});

export default AppDataSource;
