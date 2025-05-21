// src/cron/cronCerrarCajasInactivas.js
import AppDataSource from '../config/ConfigDB.js';
import { CajaSesion } from '../entities/index.js';
import CajaService from '../services/CajaServices.js';
import { ESTADOS_CAJA } from '../helpers/caja.helpers.js';
import { LessThan } from 'typeorm';

const cerrarCajasInactivas = async () => {
  console.log('🔄 Iniciando proceso de cierre automático de cajas inactivas...');
  console.log(`⏰ Fecha y hora de ejecución: ${new Date().toISOString()}`);
  
  if (!AppDataSource.isInitialized) {
    console.log('🔌 Inicializando conexión a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida con la base de datos.');
  }
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); 

  try {
    console.log(`🔍 Buscando cajas abiertas con fecha anterior a ${hoy.toISOString()}`);
    
    const cajasAbiertas = await AppDataSource.manager.find(CajaSesion, {
      where: {
        estado: { nombre_estado: ESTADOS_CAJA.ABIERTA },
        fecha_apertura: LessThan(hoy)
      },
      relations: ['estado', 'usuario']
    });
    
    console.log(`📊 Se encontraron ${cajasAbiertas.length} cajas abiertas de días anteriores`);
    
    if (cajasAbiertas.length === 0) {
      console.log('✅ No hay cajas pendientes de cierre automático');
      return;
    }

    for (const caja of cajasAbiertas) {
      try {
        console.log(`🔒 Cerrando automáticamente caja ID: ${caja.id}`);
        await CajaService.cerrarCajaAutomaticamente(caja.id);
        console.log(`✅ Caja ID ${caja.id} cerrada automáticamente`);
      } catch (error) {
        console.error(`❌ Error al cerrar caja ID ${caja.id}: ${error.message}`);
      }
    }

    console.log(`🏁 Proceso de cierre automático finalizado. Total procesadas: ${cajasAbiertas.length}`);
  } catch (error) {
    console.error('❌ Error general al cerrar cajas inactivas:', error.message);
  }
};

export default cerrarCajasInactivas;
