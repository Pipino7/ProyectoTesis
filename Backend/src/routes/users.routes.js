"use strict";

import { Router } from 'express';
import usersController from '../controllers/usuario.controllers.js';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = Router();


router.get('/verify-session', authenticationMiddleware, usersController.verificarSesion);


router.post('/registrar', authenticationMiddleware, isAdmin, usersController.registrarUsuario);

router.delete('/:id', authenticationMiddleware, isAdmin, usersController.eliminarUsuarioController);

export default router;
