import { PORT, HOST } from "./config/configEnv.js";  // Importa las variables de entorno
import cors from "cors";
import express, { urlencoded, json } from "express";
import morgan from "morgan";
import indexRoutes from "./routes/index.routes.js";  // Importa las rutas principales
import cookieParser from "cookie-parser";
import AppDataSource from './config/ConfigDB.js';
import { handleFatalError, handleError } from "./utils/errorHandler.js";  // Manejadores de errores
import initialSetup from "./config/InitialSetup.js";  // Importa la configuración inicial

/**
 * Inicia el servidor web
 */
async function setupServer() {
  try {
    const server = express();  // Usamos "server" como instancia de Express
    server.disable("x-powered-by");
    server.use(cors({ credentials: true, origin: true }));
    server.use(urlencoded({ extended: true }));
    server.use(json());
    server.use(cookieParser());
    server.use(morgan("dev"));

    // Usamos las rutas principales que vienen de "index.routes.js"
    server.use("/api", indexRoutes);

    // Inicia el servidor en el puerto especificado
    server.listen(PORT,HOST, () => {
      console.log(`=> Servidor corriendo en ${HOST}:${PORT}/api`);
    });
  } catch (err) {
    handleError(err, "/server.js -> setupServer");
  }
}

/**
 * Inicia la API y realiza la configuración inicial
 */
async function setupAPI() {
  try {
    // Inicializa la conexión de TypeORM
    await AppDataSource.initialize();  // Aquí inicializas la conexión con TypeORM
    console.log('=> Conexión a la base de datos inicializada con TypeORM');

    // Realiza la configuración inicial (crea usuario admin, estados, etc.)
    await initialSetup();
    
    // Inicia el servidor web
    await setupServer();
  } catch (err) {
    handleFatalError(err, "/server.js -> setupAPI");  // Maneja errores fatales
  }
}

// Inicia la API
setupAPI()
  .then(() => console.log("=> API Iniciada exitosamente"))
  .catch((err) => handleFatalError(err, "/server.js -> setupAPI"));
