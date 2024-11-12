// src/routes/categoria.routes.js
import express from 'express';
import CategoriaController from '../controllers/categoria.controllers.js';

const router = express.Router();

// Llama a los métodos exportados con sus nombres correctos
router.get('/obtener', CategoriaController.obtenerCategoriasController);
router.post('/crear', CategoriaController.crearCategoriaController);

export default router;
