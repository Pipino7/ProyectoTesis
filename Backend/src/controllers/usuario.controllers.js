// src/controllers/users.controller.js
"use strict";

import { crearUsuario, eliminarUsuario,} from '../services/usuario.services.js';  // Importamos los servicios
import { respondSuccess, respondError } from '../utils/resHandler.js';

// Controlador para registrar un usuario
const registrarUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await crearUsuario(req.body, req.roles);
    return respondSuccess(req, res, 201, nuevoUsuario);
  } catch (error) {
    return respondError(req, res, 400, error.message);
  }
};

// Controlador para eliminar un usuario
const eliminarUsuarioController = async (req, res) => {
  try {
    const usuarioEliminado = await eliminarUsuario(req.params.id);
    return respondSuccess(req, res, 200, usuarioEliminado);
  } catch (error) {
    return respondError(req, res, 404, error.message);
  }
};



// Asegúrate de exportar todas las funciones correctamente
export default { registrarUsuario, eliminarUsuarioController, };
