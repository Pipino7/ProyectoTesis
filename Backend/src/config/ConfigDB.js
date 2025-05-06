// src/config/ConfigDB.js
import { DataSource }     from 'typeorm';
import { DB_URL }         from './configEnv.js';
import * as Entities      from '../entities/index.js';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: DB_URL,
  synchronize: true,
  logging: false,
  entities: Object.values(Entities),
  migrations: ['src/migrations/*.js'],
  migrationsTableName: 'migrations_history',
});

export default AppDataSource;
