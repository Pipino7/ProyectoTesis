import ResumenVentasService from '../services/ResumenVentasService.js';

export const ResumenController = {
  async getUltimosDias(req, res) {
    try {
      const { dias = 7 } = req.query;
      const numDias = parseInt(dias, 10);
      
      if (isNaN(numDias) || numDias <= 0 || numDias > 90) {
        return res.status(400).json({
          success: false,
          message: 'El número de días debe ser un número positivo entre 1 y 90'
        });
      }
      
      const resumen = await ResumenVentasService.obtenerResumenUltimosDias(null, numDias);
      
      return res.status(200).json({
        success: true,
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen de últimos días:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener el resumen de ventas'
      });
    }
  },
  
  async getPorRangoFechas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere fechaInicio y fechaFin en formato YYYY-MM-DD'
        });
      }
      
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);
      
      if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }
      
      if (fechaInicioDate > fechaFinDate) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin'
        });
      }
      
      const resumen = await ResumenVentasService.obtenerResumenPorRango(null, fechaInicio, fechaFin);
      
      return res.status(200).json({
        success: true,
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen por rango:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener el resumen por rango de fechas'
      });
    }
  },
  
  async getPorDiaSemana(req, res) {
    try {
      const { semanas = 4 } = req.query;
      const numSemanas = parseInt(semanas, 10);
      
      if (isNaN(numSemanas) || numSemanas <= 0 || numSemanas > 52) {
        return res.status(400).json({
          success: false,
          message: 'El número de semanas debe ser un número positivo entre 1 y 52'
        });
      }
      
      const resumen = await ResumenVentasService.obtenerResumenPorDiaSemana(null, numSemanas);
      
      return res.status(200).json({
        success: true,
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen por día de semana:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener el resumen por día de semana'
      });
    }
  },

  async getEstadisticasPorCategoria(req, res) {
    try {
      const { fechaInicio, fechaFin, orderBy = 'monto', orden = 'desc' } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere fechaInicio y fechaFin en formato YYYY-MM-DD'
        });
      }
    
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);
      
      if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido, debe ser YYYY-MM-DD'
        });
      }
      
      if (orderBy !== 'monto' && orderBy !== 'cantidad') {
        return res.status(400).json({
          success: false,
          message: 'El parámetro orderBy debe ser "monto" o "cantidad"'
        });
      }
      
      const descendente = orden.toLowerCase() !== 'asc';
      
      const estadisticas = await ResumenVentasService.obtenerEstadisticasPorCategoria(null, {
        fechaInicio,
        fechaFin,
        orderBy,
        descendente
      });
      
      return res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas por categoría:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas por categoría'
      });
    }
  }
};

export default ResumenController;
