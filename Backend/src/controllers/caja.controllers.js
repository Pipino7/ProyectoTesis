/* src/controllers/caja.controllers.js */
import CajaService from '../services/CajaServices.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';
import AppDataSource from '../config/ConfigDB.js';
import { Usuario } from '../entities/index.js';
import CajaHelpers from '../helpers/caja.helpers.js';

const CajaController = {
  async abrirCaja(req, res, next) {
    try {
      console.log('🧾 Body recibido:', req.body); 
      const { monto_inicial } = req.body;
      const usuario_id = req.user.id;
      console.log(`🔍 Verificando existencia del usuario ${usuario_id} antes de abrir caja...`);
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuarioExiste = await usuarioRepository.findOneBy({ id: usuario_id });
      
      if (!usuarioExiste) {
        console.log(`⚠️ Intento de abrir caja fallido: Usuario con ID ${usuario_id} no existe en la base de datos`);
        res.setHeader('X-Auth-Debug', 'user-not-found-cant-open-caja');
        
        return respondError(req, res, 401, "Usuario no encontrado. Por favor, inicie sesión nuevamente.");
      }
      
      console.log(`✅ Usuario ${usuario_id} verificado en la DB, procediendo a abrir caja...`);
      
      const caja = await CajaService.abrirCaja(usuario_id, monto_inicial);
      if (caja && caja.id) {
        console.log(`🔍 Realizando verificación final de caja ID: ${caja.id}`);
        const verificacionFinal = await CajaHelpers.verificarCajaPorId(AppDataSource.manager, caja.id);
        const respuesta = {
          message: '✅ Caja abierta correctamente.',
          data: caja,
          activa: verificacionFinal.activa,
          caja: verificacionFinal.caja || caja,
          cajaData: verificacionFinal.caja || caja
        };
        
        console.log('📤 Enviando respuesta al frontend:', JSON.stringify(respuesta).substring(0, 200) + '...');
        return respondSuccess(req, res, 201, respuesta);
      } else {
        return respondSuccess(req, res, 201, {
          message: '✅ Caja abierta correctamente.',
          data: caja,
          activa: true,
          caja: caja,
          cajaData: caja
        });
      }
    } catch (error) {
      console.error('❌ Error en abrirCaja:', error);
      return respondError(req, res, 400, error.message);
    }
  },
  
  async obtenerResumenDeCaja(req, res, next) {
    try {
      const usuario_id = req.user.id;
  
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuarioExiste = await usuarioRepository.findOneBy({ id: usuario_id });
      
      if (!usuarioExiste) {
        console.log(`⚠️ Usuario con ID ${usuario_id} del token no existe en la base de datos actual`);
        return respondSuccess(req, res, 200, { 
          usuarioInvalido: true,
          mensaje: 'El usuario ya no existe. Por favor, inicie sesión nuevamente.'
        });
      }
  
      const resumen = await CajaService.obtenerResumenDeCaja(usuario_id);
      if (!resumen?.totales?.balancePorMetodo) {
        console.warn('⚠️ El resumen no contiene un balancePorMetodo válido');
      }
      return respondSuccess(req, res, 200, resumen);
  
    } catch (error) {
      console.error(`❌ Error en obtenerResumenDeCaja: ${error.message}`, error);
      return respondError(req, res, 400, error.message);
    }
  },
  
  async obtenerCajaPorFecha(req, res, next) {
    try {
      const usuario_id = req.user.id;
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuarioExiste = await usuarioRepository.findOneBy({ id: usuario_id });
      
      if (!usuarioExiste) {
        console.log(`⚠️ Usuario con ID ${usuario_id} del token no existe en la base de datos actual`);
        return respondSuccess(req, res, 200, { 
          state: "Error",
          message: 'El usuario ya no existe. Por favor, inicie sesión nuevamente.',
          usuarioInvalido: true
        });
      }
      
      const { fecha } = req.query;
      if (!fecha) {
        return respondError(req, res, 400, 'La fecha es requerida como parámetro.');
      }

      const resultado = await CajaService.obtenerCajaPorFecha(usuario_id, fecha);
      return respondSuccess(req, res, 200, resultado);
    } catch (error) {
      console.error(`❌ Error en obtenerCajaPorFecha: ${error.message}`);
      return respondError(req, res, 400, error.message);
    }
  },

  async verificarCajaActiva(req, res, next) {
    try {
      const usuario_id = req.user.id;
      

      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuarioExiste = await usuarioRepository.findOneBy({ id: usuario_id });
      
      if (!usuarioExiste) {
        console.log(`⚠️ Usuario con ID ${usuario_id} del token no existe en la base de datos actual`);

        return respondSuccess(req, res, 200, { 
          activa: false,
          usuarioInvalido: true, 
          mensaje: 'El usuario ya no existe. Por favor, inicie sesión nuevamente.'
        });
      }


      const cajaActiva = await CajaService.verificarCajaActiva(usuario_id);

      if (cajaActiva) {
        const detalleCaja = await CajaService.obtenerDetalleCajaActiva(usuario_id);
        return respondSuccess(req, res, 200, { 
          activa: true,
          caja: detalleCaja,
          cajaData: detalleCaja 
        });
      }
      return respondSuccess(req, res, 200, { 
        activa: false,
        caja: null,
        cajaData: null
      });
    } catch (error) {
      console.error('❌ Error verificando caja activa:', error);
      return respondSuccess(req, res, 200, { 
        activa: false,
        caja: null,
        cajaData: null,
        error: error.message
      });
    }
  },

  async cerrarCaja(req, res, next) {
    try {
      const { monto_declarado, observacion } = req.body;
      const usuario_id = req.user.id;
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuarioExiste = await usuarioRepository.findOneBy({ id: usuario_id });
      
      if (!usuarioExiste) {
        console.log(`⚠️ Usuario con ID ${usuario_id} del token no existe en la base de datos actual`);
        return respondSuccess(req, res, 200, { 
          usuarioInvalido: true,
          mensaje: 'El usuario ya no existe. Por favor, inicie sesión nuevamente.'
        });
      }

      const resultado = await CajaService.cerrarCaja(usuario_id, monto_declarado, observacion);
      return respondSuccess(req, res, 200, { data: resultado });
    } catch (error) {
      return respondError(req, res, 400, error.message);
    }
  },
  
  async obtenerHistoricoCajas(req, res, next) {
    try {
      console.log('🔍 Solicitando histórico de cajas');
      const usuario_id = req.user.id;
      
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuarioExiste = await usuarioRepository.findOneBy({ id: usuario_id });
      
      if (!usuarioExiste) {
        console.log(`⚠️ Usuario con ID ${usuario_id} no existe en la base de datos`);
        return respondSuccess(req, res, 200, { 
          usuarioInvalido: true,
          mensaje: 'El usuario ya no existe. Por favor, inicie sesión nuevamente.'
        });
      }
      
      const historicos = await CajaService.obtenerHistoricoCajas();
      console.log(`✅ Histórico de cajas recuperado: ${historicos.length} registros`);
      
      return respondSuccess(req, res, 200, { 
        data: historicos,
        count: historicos.length
      });
    } catch (error) {
      console.error(`❌ Error al obtener histórico de cajas: ${error.message}`);
      return respondError(req, res, 400, error.message);
    }
  },
};

export default CajaController;