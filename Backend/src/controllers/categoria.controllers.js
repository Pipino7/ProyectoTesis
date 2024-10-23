// src/controllers/categoria.controllers.js
import CategoriaService from '../services/categoria.services.js';

/**
 * Controlador para obtener todas las categorías.
 */
const obtenerCategoriasController = async (req, res) => {
  try {
    const categorias = await CategoriaService.getAllCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para crear una nueva categoría.
 */
const crearCategoriaController = async (req, res) => {
  try {
    const categoriaCreada = await CategoriaService.crearCategoria(req.body);
    res.status(201).json(categoriaCreada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  obtenerCategoriasController,
  crearCategoriaController,
};
