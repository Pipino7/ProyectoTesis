"use strict";

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = process.env.NODE_ENV === 'test'
  ? path.resolve(__dirname, '.env.test')  
  : path.resolve(__dirname, '.env');

dotenv.config({ path: envPath });
console.log("🔧 DB_URL cargado:", process.env.DB_URL);

export const PORT = process.env.PORT;
export const HOST = process.env.HOST;
export const DB_URL = process.env.DB_URL;
export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
export const RESET_JWT_SECRET = process.env.RESET_JWT_SECRET;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_NAME = process.env.ADMIN_NAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const CRON_SECRET = process.env.CRON_SECRET;
