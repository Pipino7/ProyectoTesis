// scripts/ejecutarCierreCajas.js
import cerrarCajasInactivas from '../cron/cronCerrarCajasInactivas.js';


const run = async () => {
  console.log('🔧 Ejecutando cierre manual de cajas abiertas...');
  await cerrarCajasInactivas();
  console.log('✅ Cierre manual completado');
  process.exit(0); // Salir correctamente
};

run().catch(err => {
  console.error('❌ Error durante el cierre manual:', err.message);
  process.exit(1); // Salir con error
});
