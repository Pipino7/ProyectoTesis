// src/routes/users.routes.js
"use strict";

import { Router } from 'express';
import usersController from '../controllers/usuario.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/registrar', authenticationMiddleware, isAdmin, usersController.registrarUsuario);


// Ruta para eliminar un usuario por su ID
router.delete('/:id', authenticationMiddleware, isAdmin, usersController.eliminarUsuarioController);

export default router;
