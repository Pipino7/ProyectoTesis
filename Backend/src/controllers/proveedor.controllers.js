// src/controllers/proveedor.controllers.js
import ProveedorService from '../services/proveedor.services.js';

/**
 * Controlador para obtener todos los proveedores.
 */
const obtenerProveedoresController = async (req, res) => {
  try {
    const proveedores = await ProveedorService.getAllProveedores();
    res.status(200).json(proveedores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controlador para crear un nuevo proveedor.
 */
const crearProveedorController = async (req, res) => {
  try {
    const proveedorCreado = await ProveedorService.crearProveedor(req.body);
    res.status(201).json(proveedorCreado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  obtenerProveedoresController,
  crearProveedorController,
};
