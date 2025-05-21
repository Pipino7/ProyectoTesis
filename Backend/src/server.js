import { PORT, HOST } from "./config/configEnv.js";
import AppDataSource from './config/ConfigDB.js';
import { handleFatalError, handleError } from "./utils/errorHandler.js";
import initialSetup from "./config/InitialSetup.js";
import app from "./app.js"; 
import './cron/cronLauncher.js';

async function setupAPI() {
  try {
    await AppDataSource.initialize();
    console.log('=> Conexión a la base de datos inicializada con TypeORM');

    await initialSetup();

  
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, HOST, () => {
        console.log(`=> Servidor corriendo en ${HOST}:${PORT}/api`);
      });
    }
  } catch (err) {
    handleFatalError(err, "/server.js -> setupAPI");
  }
}

setupAPI()
  .then(() => console.log("=> API Iniciada exitosamente"))
  .catch((err) => handleFatalError(err, "/server.js -> setupAPI"));
