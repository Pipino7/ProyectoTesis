// src/config/configEnv.js
"use strict";

import path from "path";
import { fileURLToPath } from "url";

// Crear __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar las variables de entorno desde el archivo .env
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Exportar las variables de entorno
export const PORT = process.env.PORT;
export const HOST = process.env.HOST;
export const DB_URL = process.env.DB_URL;
export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
export const RESET_JWT_SECRET = process.env.RESET_JWT_SECRET; 

export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const CRON_SECRET = process.env.CRON_SECRET;
