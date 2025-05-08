import CuponService from '../services/cupon.services.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const cuponController = {
  crearCupon: async (req, res) => {
    try {
      console.log('🎫 Petición para crear cupón:', req.validated);
      const usuario_id = req.user?.id;

      if (!usuario_id) {
        return respondError(req, res, 401, 'No autenticado. Usuario no identificado.');
      }

      const cupon = await CuponService.crearCupon({
        ...req.validated,
        usuario_id
      });

      return respondSuccess(req, res, 201, {
        message: 'Cupón creado correctamente',
        cupon
      });
    } catch (error) {
      console.error('❌ Error al crear cupón:', error);
      return respondError(req, res, 500, 'Error al crear cupón: ' + error.message);
    }
  },

  cambiarEstado: async (req, res) => {
    try {
      const cupon_id = parseInt(req.params.id);
      const { activo } = req.body;
      const usuario_id = req.user?.id;

      if (isNaN(cupon_id)) {
        return respondError(req, res, 400, 'ID de cupón inválido.');
      }

      const actualizado = await CuponService.actualizarEstado({
        cupon_id,
        activo,
        usuario_id
      });

      return respondSuccess(req, res, 200, {
        message: `Cupón ${activo ? 'activado' : 'desactivado'} correctamente`,
        cupon: actualizado
      });
    } catch (error) {
      console.error('❌ Error al cambiar estado de cupón:', error);
      return respondError(req, res, 500, 'Error al cambiar estado del cupón: ' + error.message);
    }
  },
  editarCupon: async (req, res) => {
    try {
      const cupon_id = parseInt(req.params.id);
      const usuario_id = req.user?.id;

      if (!cupon_id || isNaN(cupon_id)) {
        return respondError(req, res, 400, 'ID de cupón inválido.');
      }

      const actualizado = await CuponService.editarCupon({
        cupon_id,
        datos: req.validated,
        usuario_id
      });

      return respondSuccess(req, res, 200, {
        message: 'Cupón actualizado correctamente',
        cupon: actualizado
      });
    } catch (error) {
      console.error('❌ Error al editar cupón:', error);
      return respondError(req, res, 500, 'Error al editar cupón: ' + error.message);
    }
  },
  simularDescuentoCupon: async (req, res) => {
    try {
      const { cuponCodigo, prendas } = req.validated;
  
      const resultado = await CuponService.simularDescuento({ cuponCodigo, prendas });
  
      const { cupon, items, descuentoTotal } = resultado;
  
      const itemsLimpios = items.map(item => {
        const { categoria, ...resto } = item;
        return resto; 
      });
  
      return respondSuccess(req, res, 200, {
        message: 'Cupón simulado correctamente',
        resumen: {
          cupon: {
            codigo: cupon.codigo,
            descripcion: cupon.descripcion,
            tipo: cupon.tipo
          },
          items: itemsLimpios,
          descuentoTotal
        }
      });
  
    } catch (error) {
      console.error('❌ Error al simular cupón:', error);
      return respondError(req, res, 500, 'Error al simular cupón: ' + error.message);
    }
  },
  obtenerCuponesActivos: async (req, res) => {
    try {
      const cupones = await CuponService.obtenerCuponesActivos();

      return respondSuccess(req, res, 200, {
        message: 'Cupones activos obtenidos',
        cupones
      });
    } catch (error) {
      console.error('❌ Error al obtener cupones activos:', error);
      return respondError(req, res, 500, 'Error al obtener cupones: ' + error.message);
    }
  },
};

export default cuponController;


