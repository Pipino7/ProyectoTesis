import ClasificacionService from '../services/clasificacion.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const ClasificacionController = {
  // Clasificar prendas
  clasificarPrendas: async (req, res) => {
    try {
      const datos = {
        ...req.body,
        usuario_id: req.userId,
      };

      const resultado = await ClasificacionService.clasificarPrendas(datos);
      return respondSuccess(req, res, 200, {
        message: 'Clasificación exitosa',
        data: resultado,
      });
    } catch (error) {
      console.error('Error en clasificarPrendas:', error);
      return respondError(req, res, 500, 'No se pudo clasificar las prendas');
    }
  },

  // Corregir clasificación
  corregirClasificacion: async (req, res) => {
    try {
      const datos = {
        ...req.body,
        usuario_id: req.userId,
      };

      const resultado = await ClasificacionService.corregirClasificacion(datos);
      return respondSuccess(req, res, 200, {
        message: 'Clasificación corregida exitosamente',
        data: resultado,
      });
    } catch (error) {
      console.error('Error en corregirClasificacion:', error);
      return respondError(req, res, 500, 'No se pudo corregir la clasificación');
    }
  },

  // Prendas en bodega
  obtenerPrendasBodega: async (req, res) => {
    try {
      const { codigo } = req.params;
      const resultado = await ClasificacionService.obtenerCantidadPrendasEnBodega(codigo);
      return respondSuccess(req, res, 200, resultado);
    } catch (error) {
      console.error('Error en obtenerPrendasBodega:', error);
      return respondError(req, res, 500, 'No se pudo obtener la cantidad de prendas en bodega');
    }
  },

  // Prendas clasificadas agrupadas (por categoría + precio + código de barra)
  obtenerPrendasClasificadas: async (req, res) => {
    try {
      const { codigoFardo } = req.params;
      const prendas = await ClasificacionService.obtenerPrendasClasificadasAgrupadas(codigoFardo);
      return respondSuccess(req, res, 200, prendas);
    } catch (error) {
      console.error('Error en obtenerPrendasClasificadas:', error);
      return respondError(req, res, 500, 'Error al obtener prendas clasificadas');
    }
  },
  
  obtenerResumenAgrupadoClasificadas: async (req, res) => {
    try {
      const { codigo } = req.params;
      const resumen = await ClasificacionService.obtenerResumenAgrupadoDesdePrendas(codigo);
      return respondSuccess(req, res, 200, resumen);
    } catch (error) {
      console.error('Error en obtenerResumenAgrupadoClasificadas:', error);
      return respondError(req, res, 500, 'No se pudo obtener el resumen agrupado');
    }
  },
};

export default ClasificacionController;
