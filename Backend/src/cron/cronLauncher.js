// src/cron/cronLauncher.js
import cron from 'node-cron';
import cerrarCajasInactivas from './cronCerrarCajasInactivas.js';

console.log('🕐 Configurando cron de cierre automático de cajas (zona horaria: América/Santiago)');

// Ejecutar todos los días a las 23:59 hora Chile
cron.schedule('59 23 * * *', async () => {
  console.log('🔁 Ejecutando cierre automático de cajas abiertas...');
  await cerrarCajasInactivas();
}, {
  timezone: 'America/Santiago'
});
