import createAdminUser from '../seeders/usuario.seeder.js';
import seedEstados from '../seeders/estado.seeder.js';
import seedFardos from '../seeders/Fardos.seeder.js';

const initialSetup = async () => {
  try {
    console.log("Iniciando configuración inicial...");

    await createAdminUser();
    await seedEstados();
    await seedFardos();

    console.log("Configuración inicial completada.");
  } catch (error) {
    console.error("Error en la configuración inicial:", error);
  }
};

export default initialSetup;
