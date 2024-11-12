// src/services/categoria.services.js

import categoriaSchema from '../schema/categoria.schema.js';
import Categoria from '../entities/categoria.js';
import { ILike } from 'typeorm';
import AppDataSource from '../config/ConfigDB.js';

const estandarizarNombre = (nombre) => {
  return nombre.trim().replace(/\s+/g, ' ').toLowerCase();
};

const crearCategoria = async (datosCategoria) => {
  try {
    // Validar los datos de la categoría con Joi
    const { error, value } = categoriaSchema.validate(datosCategoria);
    if (error) {
      throw new Error(
        `Error en la validación: ${error.details
          .map((detail) => detail.message)
          .join(', ')}`
      );
    }

    const nombreEstandarizado = estandarizarNombre(value.nombre_categoria);

    const categoriaRepository = AppDataSource.getRepository(Categoria);

    // Verificar si la categoría ya existe
    const categoriaExistente = await categoriaRepository.findOne({
      where: { nombre_categoria: ILike(nombreEstandarizado) },
    });

    if (categoriaExistente) {
      throw new Error('La categoría ya existe.');
    }

    // Crear y guardar la nueva categoría
    const nuevaCategoria = categoriaRepository.create({
      nombre_categoria: nombreEstandarizado,
    });

    const categoriaGuardada = await categoriaRepository.save(nuevaCategoria);

    return categoriaGuardada;
  } catch (error) {
    console.error('Error en crearCategoria:', error);
    throw new Error('Error al crear la categoría: ' + error.message);
  }
};

// Función para obtener una categoría por nombre
const obtenerCategoria = async (nombreCategoria, queryRunner) => {
  try {
    const nombreEstandarizado = estandarizarNombre(nombreCategoria);

    // Buscar la categoría en la base de datos
    const categoriaExistente = await queryRunner.manager.findOne(Categoria, {
      where: { nombre_categoria: ILike(nombreEstandarizado) }
    });

    if (!categoriaExistente) {
      return null; // Si no la encuentra, retornar null
    }

    return categoriaExistente;
  } catch (error) {
    console.error('Error en obtenerCategoria:', error);
    throw new Error('Error al obtener la categoría: ' + error.message);
  }
};
const getAllCategorias = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const categoriaRepository = AppDataSource.getRepository(Categoria);
    const categorias = await categoriaRepository.find();
    console.log("Categorías obtenidas:", categorias); // Verificar que se obtengan categorías
    return categorias;
  } catch (error) {
    console.error('Error en getAllCategorias:', error);
    throw new Error('Error al obtener las categorías: ' + error.message);
  }
};

// Función para eliminar una categoría
const eliminarCategoria = async (nombreCategoria, queryRunner) => {
  try {
    const nombreEstandarizado = estandarizarNombre(nombreCategoria);

    // Buscar la categoría en la base de datos
    const categoriaExistente = await queryRunner.manager.findOne(Categoria, {
      where: { nombre_categoria: ILike(nombreEstandarizado) }
    });

    if (!categoriaExistente) {
      throw new Error('Categoría no encontrada.');
    }

    // Eliminar la categoría
    await queryRunner.manager.remove(categoriaExistente);
    return { message: 'Categoría eliminada exitosamente.' };
  } catch (error) {
    console.error('Error en eliminarCategoria:', error);
    throw new Error('Error al eliminar la categoría: ' + error.message);
  }
};

// Exportar todas las funciones para usarlas en otros servicios
export default {
  crearCategoria,
  obtenerCategoria,
  eliminarCategoria,
  getAllCategorias,
};
