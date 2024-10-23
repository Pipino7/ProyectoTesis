// src/services/proveedor.services.js

import proveedorSchema from '../schema/proveedor.schema.js';
import Proveedor from '../entities/proveedor.js';
import { ILike } from 'typeorm';

// Función para estandarizar el nombre del proveedor
const estandarizarNombre = (nombre) => {
  return nombre.trim().replace(/\s+/g, ' ').toLowerCase();
};

// Función para obtener un proveedor por nombre
const obtenerProveedor = async (nombreProveedor, queryRunner) => {
  try {
    const nombreEstandarizado = estandarizarNombre(nombreProveedor);

    // Buscar el proveedor en la base de datos
    const proveedorExistente = await queryRunner.manager.findOne(Proveedor, {
      where: { nombre_proveedor: ILike(nombreEstandarizado) }
    });

    return proveedorExistente;
  } catch (error) {
    console.error('Error en obtenerProveedor:', error);
    throw new Error('Error al obtener el proveedor: ' + error.message);
  }
};

// Función para crear un proveedor
const crearProveedor = async (datosProveedor, queryRunner) => {
  try {
    // Validar los datos del proveedor con Joi
    const { error, value } = proveedorSchema.validate(datosProveedor);
    if (error) {
      throw new Error(`Error en la validación: ${error.details.map(detail => detail.message).join(', ')}`);
    }

    const nombreEstandarizado = estandarizarNombre(value.nombre_proveedor);

    // Verificar si el proveedor ya existe (insensible a mayúsculas)
    const proveedorExistente = await queryRunner.manager.findOne(Proveedor, {
      where: { nombre_proveedor: ILike(nombreEstandarizado) }
    });

    if (proveedorExistente) {
      throw new Error('El proveedor ya existe.');
    }

    // Crear una nueva instancia de la entidad proveedor
    const nuevoProveedor = queryRunner.manager.create(Proveedor, {
      nombre_proveedor: nombreEstandarizado,
    });

    // Guardar el proveedor en la base de datos
    const proveedorGuardado = await queryRunner.manager.save(Proveedor, nuevoProveedor);

    return proveedorGuardado;
  } catch (error) {
    console.error('Error en crearProveedor:', error);
    throw new Error('Error al crear el proveedor: ' + error.message);
  }
};

// Exportar todas las funciones para usarlas en otros servicios
export default {
  obtenerProveedor,
  crearProveedor,
};
