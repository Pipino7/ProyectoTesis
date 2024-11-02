// src/routes/fardo.routes.js
import express from 'express';
import FardoController from '../controllers/fardo.controllers.js';

const router = express.Router();

// Ruta para crear un nuevo fardo
router.post('/crear', FardoController.crearFardoController);

// Ruta para eliminar un fardo
router.delete('/fardos/:codigo_fardo', FardoController.eliminarFardoController);

// Ruta para restaurar un fardo eliminado
router.post('/fardos/:codigo_fardo/restaurar', FardoController.restaurarFardoController);

// Ruta para obtener un fardo por su código
router.get('/fardos/:codigo_fardo', FardoController.obtenerFardoPorCodigoController);

// Ruta para obtener todos los fardos
router.get('/obtener', FardoController.obtenerTodosFardosController);

export default router;
