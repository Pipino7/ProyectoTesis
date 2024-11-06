// src/controllers/fardo.controllers.js
import FardoService from '../services/fardo.services.js';

/**
 * Controlador para crear un nuevo fardo.
 */
const crearFardoController = async (req, res) => {
  try {
    const fardoCreado = await FardoService.crearFardo(req.body);
    res.status(201).json(fardoCreado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para eliminar un fardo.
 */
const eliminarFardoController = async (req, res) => {
  try {
    const { codigo_fardo } = req.params;
    const fardoEliminado = await FardoService.eliminarFardo(codigo_fardo);
    res.status(200).json(fardoEliminado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para restaurar un fardo eliminado.
 */
const restaurarFardoController = async (req, res) => {
  try {
    const { codigo_fardo } = req.params;
    const fardoRestaurado = await FardoService.restaurarFardo(codigo_fardo);
    res.status(200).json(fardoRestaurado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para obtener un fardo por su código.
 */
const obtenerFardoPorCodigoController = async (req, res) => {
  try {
    const { codigo_fardo } = req.params;
    const fardo = await FardoService.getFardoByCodigo({ codigo_fardo, codigo_barra: req.query.codigo_barra });
    res.status(200).json(fardo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * Controlador para obtener todos los fardos con paginación y filtros.
 */
const obtenerTodosFardosController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      orden = 'desc',
      proveedor,
      categoria,
      precioMin,
      precioMax,
      fechaInicio,
      fechaFin
    } = req.query;

    // Agrega un log para verificar los valores de los filtros recibidos
    console.log("Parámetros recibidos en el controlador:", {
      page,
      limit,
      orden,
      proveedor,
      categoria,
      precioMin,
      precioMax,
      fechaInicio,
      fechaFin,
    });

    const fardos = await FardoService.getAllFardos({
      page: parseInt(page),
      limit: parseInt(limit),
      orden,
      proveedor,
      categoria,
      precioMin: parseFloat(precioMin),
      precioMax: parseFloat(precioMax),
      fechaInicio,
      fechaFin,
    });

    res.status(200).json(fardos);
  } catch (error) {
    console.error("Error en obtenerTodosFardosController:", error);
    res.status(400).json({ error: error.message });
  }
};



export default {
  crearFardoController,
  eliminarFardoController,
  restaurarFardoController,
  obtenerFardoPorCodigoController,
  obtenerTodosFardosController,
};
