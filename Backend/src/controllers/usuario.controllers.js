// src/controllers/users.controller.js
"use strict";

import { crearUsuario, eliminarUsuario,} from '../services/usuario.services.js';  // Importamos los servicios
import { respondSuccess, respondError } from '../utils/resHandler.js';
import AppDataSource from '../config/ConfigDB.js';
import usuario from '../entities/usuario.js';

const registrarUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await crearUsuario(req.body, req.roles);
    return respondSuccess(req, res, 201, nuevoUsuario);
  } catch (error) {
    return respondError(req, res, 400, error.message);
  }
};


const eliminarUsuarioController = async (req, res) => {
  try {
    const usuarioEliminado = await eliminarUsuario(req.params.id);
    return respondSuccess(req, res, 200, usuarioEliminado);
  } catch (error) {
    return respondError(req, res, 404, error.message);
  }
};


const verificarSesion = async (req, res) => {
  try {
    
    const usuarioRepository = await AppDataSource.getRepository(usuario);
    
    console.log(`🔍 Buscando usuario con ID ${req.user.id} en la DB para verificar sesión...`);
    const usuarioExistente = await usuarioRepository.findOneBy({ id: req.user.id });
    
    if (!usuarioExistente) {
      console.log(`⚠️ Verificación de sesión fallida: Usuario con ID ${req.user.id} no existe en la base de datos`);
      
      res.setHeader('X-Auth-Debug', 'user-verify-session-not-found');
      
      return respondError(req, res, 401, "Usuario no encontrado. Por favor, inicie sesión nuevamente.");
    }
    
    console.log(`✅ Verificación de sesión exitosa para usuario ID ${req.user.id}, email: ${req.user.email}`);
    
    return respondSuccess(req, res, 200, {
      message: "Sesión válida",
      user: {
        id: req.user.id,
        email: req.user.email,
        roles: req.user.roles
      }
    });
  } catch (error) {
    console.error("❌ Error en verificarSesion:", error);
    return respondError(req, res, 500, "Error al verificar la sesión");
  }
};


export default { registrarUsuario, eliminarUsuarioController, verificarSesion };
