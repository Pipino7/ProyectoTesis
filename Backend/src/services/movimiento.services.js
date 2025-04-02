import AppDataSource from '../config/ConfigDB.js';
import MovimientoPrenda from '../entities/movimientoPrenda.js';
import Fardo from '../entities/fardo.js';

const repo = AppDataSource.getRepository(MovimientoPrenda);
const fardoRepo = AppDataSource.getRepository(Fardo);

const MovimientoService = {
  // 1. Registrar un nuevo movimiento (clasificación, venta, etc.)
  registrarMovimiento: async ({ accion, cantidad, fardo_id, usuario_id, categoria_id = null, descripcion = '' }) => {
    try {
      const movimiento = repo.create({
        accion,
        cantidad,
        fardo: { id: fardo_id },
        usuario: { id: usuario_id },
        categoria: categoria_id ? { id: categoria_id } : null,
        descripcion,
      });
      await repo.save(movimiento);

      console.log("✔️ Movimiento registrado:", { accion, cantidad, fardo_id, usuario_id, categoria_id, descripcion });
    } catch (error) {
      console.error('❌ Error al registrar movimiento:', error.message);
    }
  },

  // 2. Obtener todos los movimientos de un fardo por código o código de barra
  obtenerMovimientosPorCodigoFardo: async (codigo) => {
    const fardo = await fardoRepo.findOne({
      where: [
        { codigo_fardo: codigo },
        { codigo_barra_fardo: codigo },
      ],
    });

    if (!fardo) {
      throw new Error(`No se encontró un fardo con el código "${codigo}"`);
    }

    const movimientos = await repo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.fardo', 'fardo')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .leftJoinAndSelect('movimiento.categoria', 'categoria')
      .where('movimiento.fardo = :id', { id: fardo.id })
      .orderBy('movimiento.fecha', 'ASC')
      .getMany();

    return movimientos.map((mov) => ({
      id: mov.id,
      accion: mov.accion,
      cantidad: mov.cantidad,
      fecha: mov.fecha,
      categoria: mov.categoria?.nombre_categoria || null,
      observacion: mov.observacion,
      usuario: mov.usuario?.nombre || 'Desconocido',
    }));
  },

  // 3. Obtener movimientos por rango de fechas
  obtenerMovimientosPorFechas: async (fechaInicio, fechaFin) => {
    return await repo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.fardo', 'fardo')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .leftJoinAndSelect('movimiento.categoria', 'categoria')
      .where('movimiento.fecha BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      })
      .orderBy('movimiento.fecha', 'DESC')
      .getMany();
  },

  // 4. Resumen de prendas clasificadas por categoría en un fardo
  obtenerResumenClasificacionPorFardo: async (codigo) => {
    const fardo = await fardoRepo.findOne({
      where: [
        { codigo_fardo: codigo },
        { codigo_barra_fardo: codigo },
      ],
    });

    if (!fardo) {
      throw new Error(`No se encontró un fardo con el código "${codigo}"`);
    }

    const resumen = await repo
      .createQueryBuilder('movimiento')
      .select('categoria.nombre_categoria', 'categoria')
      .addSelect('movimiento.accion', 'accion')
      .addSelect('SUM(movimiento.cantidad)', 'total')
      .leftJoin('movimiento.categoria', 'categoria')
      .leftJoin('movimiento.fardo', 'fardo')
      .where('fardo.id = :id', { id: fardo.id })
      .andWhere('movimiento.accion = :accion', { accion: 'clasificacion' })
      .groupBy('categoria.nombre_categoria')
      .addGroupBy('movimiento.accion')
      .getRawMany();

    const totalClasificadas = resumen.reduce((acc, r) => acc + parseInt(r.total), 0);

    return {
      totalClasificadas,
      detalle: resumen,
    };
  },
};

export default MovimientoService;
