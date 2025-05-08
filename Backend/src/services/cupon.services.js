import AppDataSource from '../config/ConfigDB.js';
import { Cupon } from '../entities/index.js';
import MovimientoService from './movimiento.services.js';
import { Brackets } from 'typeorm';
import CuponHelper from '../helpers/cupon.helpers.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

const cuponRepo = AppDataSource.getRepository(Cupon);

const CuponService = {
crearCupon: async ({ codigo, descripcion, tipo, valor, fecha_inicio, fecha_expiracion, categoria_id, usuario_id }) => {
    const cuponRepo = AppDataSource.getRepository(Cupon);
  
    try {
      const cupon = cuponRepo.create({
        codigo,
        descripcion,
        tipo,
        valor,
        fecha_inicio,
        fecha_expiracion,
        categoria: categoria_id ? { id: categoria_id } : null,
      });
  
      const guardado = await cuponRepo.save(cupon);
  
      await MovimientoService.registrarMovimiento({
        accion: 'cupon_creado',
        cantidad: 1,
        usuario_id,
        categoria_id,
        descripcion: `Creado cupón ${codigo} (${tipo})`
      });
  
      return guardado;
  
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un cupón con ese código. Por favor elige otro.');
      }
  
      console.error('❌ Error al crear cupón:', error);
      throw new Error('Error al crear cupón: ' + error.message);
    }
  },

  actualizarEstado: async ({ cupon_id, activo, usuario_id }) => {
    const cupon = await cuponRepo.findOneBy({ id: cupon_id });
    if (!cupon) throw new Error('Cupón no encontrado');

    cupon.activo = activo;
    const actualizado = await cuponRepo.save(cupon);

    await MovimientoService.registrarMovimiento({
      accion: activo ? 'cupon_activado' : 'cupon_desactivado',
      cantidad: 1,
      usuario_id,
      categoria_id: cupon.categoria?.id || null,
      descripcion: `${activo ? 'Activado' : 'Desactivado'} cupón ${cupon.codigo}`
    });

    return actualizado;
  },

  eliminarCupon: async ({ cupon_id, usuario_id }) => {
    const cupon = await cuponRepo.findOneBy({ id: cupon_id });
    if (!cupon) throw new Error('Cupón no encontrado');

    await cuponRepo.remove(cupon);

    await MovimientoService.registrarMovimiento({
      accion: 'cupon_eliminado',
      cantidad: 1,
      usuario_id,
      categoria_id: cupon.categoria?.id || null,
      descripcion: `Cupón eliminado: ${cupon.codigo}`
    });

    return { message: 'Cupón eliminado correctamente' };
  },
  simularDescuento: async ({ cuponCodigo, prendas }) => {
    const resultado = await CuponHelper.validarYAplicarCupon({
      cuponCodigo,
      prendas,
      manager: AppDataSource.manager
    });

    return resultado;
  },
  

  obtenerCuponesActivos: async () => {
    const ahora = new Date();

    const cupones = await cuponRepo.find({
      where: qb => {
        qb.where('cupon.activo = :activo', { activo: true })
          .andWhere(
            new Brackets(qb2 => {
              qb2.where('cupon.fecha_inicio IS NULL OR cupon.fecha_inicio <= :ahora', { ahora })
                 .andWhere('cupon.fecha_expiracion IS NULL OR cupon.fecha_expiracion >= :ahora', { ahora });
            })
          );
      },
      relations: ['categoria'],
      order: { codigo: 'ASC' },
    });

    return cupones;
  },
};

export default CuponService;
