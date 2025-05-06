// src/config/initialSetup.js
import * as seeders from '../seeders/index.js';

const initialSetup = async () => {

  try {

    for (const runSeeder of Object.values(seeders)) {
      await runSeeder();
    }
    console.log('Configuración inicial completada.');
  } catch (error) {
    console.error('Error en la configuración inicial:', error);
  }
};

export default initialSetup;
