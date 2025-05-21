import AppDataSource from '../config/ConfigDB.js';
import MovimientoPrenda from '../entities/movimiento.js';
import Fardo from '../entities/fardo.js';
import { Gasto } from '../entities/index.js';

const repo = AppDataSource.getRepository(MovimientoPrenda);
const fardoRepo = AppDataSource.getRepository(Fardo);

const MovimientoService = {
  registrarMovimiento: async ({ accion, cantidad, fardo_id, usuario_id, categoria_id = null, descripcion = '', gasto_id = null }) => {
    try {
      const movimiento = repo.create({
        accion,
        cantidad,
        fardo: fardo_id ? { id: fardo_id } : null,
        usuario: { id: usuario_id },
        categoria: categoria_id ? { id: categoria_id } : null,
        observacion: descripcion,
      });
      
      // Asociar el gasto al movimiento si se proporciona un ID de gasto
      if (gasto_id) {
        const gasto = await AppDataSource.getRepository(Gasto).findOne({ where: { id: gasto_id } });
        if (gasto) {
          movimiento.gasto = gasto;
        }
      }
      
      await repo.save(movimiento);

      console.log("✔️ Movimiento registrado:", { 
        accion, 
        cantidad, 
        fardo_id, 
        usuario_id, 
        categoria_id, 
        descripcion,
        gasto_id 
      });
    } catch (error) {
      console.error('❌ Error al registrar movimiento:', error.message);
    }
  },

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
  obtenerResumenClasificacionDetallado: async (codigo) => {
    const fardo = await fardoRepo.findOne({
      where: [
        { codigo_fardo: codigo },
        { codigo_barra_fardo: codigo },
      ],
    });
  
    if (!fardo) {
      throw new Error(`Fardo con código "${codigo}" no encontrado.`);
    }
  
    const resumen = await repo
    .createQueryBuilder('movimiento')
    .leftJoin('movimiento.fardo', 'fardo')
    .leftJoin('movimiento.categoria', 'categoria')
    .leftJoin('movimiento.usuario', 'usuario')
    .leftJoin('prenda', 'prenda', 'prenda.fardo_id = fardo.id AND prenda.categoria_id = categoria.id')
    .select([
      'categoria.nombre_categoria AS categoria',
      'movimiento.accion AS accion',
      'prenda.codigo_barra_prenda AS codigo_barra',
      'prenda.precio AS precio',
      'SUM(movimiento.cantidad) AS cantidad'
    ])
    .where('movimiento.accion = :accion', { accion: 'clasificacion' })
    .andWhere('fardo.id = :fardo_id', { fardo_id: fardo.id })
    .groupBy('categoria.nombre_categoria')
    .addGroupBy('movimiento.accion')
    .addGroupBy('prenda.codigo_barra_prenda')
    .addGroupBy('prenda.precio')
    .getRawMany();
  
    return resumen.map((item) => ({
      categoria: item.categoria,
      precio: parseFloat(item.precio),
      codigo_barra: item.codigo_barra,
      cantidad: parseInt(item.cantidad),
    }));
  },
};

export default MovimientoService;
