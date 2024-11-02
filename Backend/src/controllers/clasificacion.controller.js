// src/controllers/clasificacion.controller.js
import ClasificacionService from '../services/clasificacion.services.js';

const ClasificacionController = {
  clasificarPrendas: async (req, res) => {
    console.log('Contenido de req.body en clasificarPrendas:', req.body); // Agregar este log
    try {
      const resultadoClasificacion = await ClasificacionService.clasificarPrendas(req.body);
      return res.status(200).json({ 
        message: 'Clasificación exitosa', 
        data: resultadoClasificacion 
      });
    } catch (error) {
      console.error('Error en clasificarPrendas:', error);
      return res.status(500).json({ 
        error: `No se pudo clasificar las prendas: ${error.message}` 
      });
    }
  },

  corregirClasificacion: async (req, res) => {
    try {
      const resultadoCorreccion = await ClasificacionService.corregirClasificacion(req.body);
      return res.status(200).json({ 
        message: 'Corrección de clasificación exitosa', 
        data: resultadoCorreccion 
      });
    } catch (error) {
      console.error('Error en corregirClasificacion:', error);
      return res.status(500).json({ 
        error: `No se pudo corregir la clasificación: ${error.message}` 
      });
    }
  },

  obtenerHistorial: async (req, res) => {
    try {
      const { codigo_fardo } = req.params;
      const historial = await ClasificacionService.obtenerHistorial(codigo_fardo);
      return res.status(200).json({
        message: `Historial del fardo ${codigo_fardo}`,
        data: historial,
      });
    } catch (error) {
      console.error('Error en obtenerHistorial:', error);
      return res.status(500).json({
        error: `No se pudo obtener el historial: ${error.message}`
      });
    }
  }
};

export default ClasificacionController;
