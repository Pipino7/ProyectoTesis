import AppDataSource from '../config/ConfigDB.js';
import Fardo from '../entities/fardo.js';
import Prenda from '../entities/prenda.js';
import Categoria from '../entities/categoria.js';
import Estado from '../entities/estado.js';
import HelpersService from './helpers.services.js';
import MovimientoService from './movimiento.services.js';

const ClasificacionService = {
  clasificarPrendas: async (datosClasificacion) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { codigo_fardo, cantidad, precio, nombre_categoria, usuario_id } = datosClasificacion;

      const fardo = await queryRunner.manager.findOne(Fardo, {
        where: [{ codigo_fardo }, { codigo_barra_fardo: codigo_fardo }],
      });
      if (!fardo) throw new Error(`Fardo con código '${codigo_fardo}' no encontrado.`);

      let categoria = await queryRunner.manager.findOne(Categoria, { where: { nombre_categoria } });
      if (!categoria) {
        categoria = queryRunner.manager.create(Categoria, { nombre_categoria });
        await queryRunner.manager.save(Categoria, categoria);
      }

      const estadoDisponible = await queryRunner.manager.findOne(Estado, {
        where: { nombre_estado: 'disponible' },
      });

      const prendasBodega = await queryRunner.manager.find(Prenda, {
        relations: ['estado', 'fardo'],
        where: {
          fardo: { id: fardo.id },
          estado: { nombre_estado: 'bodega' },
          categoria: null,
        },
      });

      const cantidadDisponible = prendasBodega.reduce((sum, p) => sum + p.cantidad, 0);
      if (cantidad > cantidadDisponible) {
        throw new Error(`No hay suficientes prendas en bodega. Disponibles: ${cantidadDisponible}`);
      }

      let cantidadRestante = cantidad;

      for (const prenda of prendasBodega) {
        const aClasificar = Math.min(prenda.cantidad, cantidadRestante);
        prenda.cantidad -= aClasificar;

        if (prenda.cantidad === 0) {
          await queryRunner.manager.remove(Prenda, prenda);
        } else {
          await queryRunner.manager.save(Prenda, prenda);
        }

        const prendaExistente = await queryRunner.manager.findOne(Prenda, {
          where: {
            fardo: { id: fardo.id },
            categoria: categoria,
            precio,
            estado: estadoDisponible,
          },
        });

        if (prendaExistente) {
          prendaExistente.cantidad += aClasificar;
          await queryRunner.manager.save(Prenda, prendaExistente);
        } else {
          const codigoBarra = await HelpersService.generateUniqueBarcode();

          if (!precio || !categoria || !codigoBarra) {
            console.error('❌ Datos inválidos al clasificar:', { precio, categoria, codigoBarra });
            continue;
          }

          const nuevaPrenda = queryRunner.manager.create(Prenda, {
            cantidad: aClasificar,
            precio,
            estado: estadoDisponible,
            categoria,
            codigo_barra_prenda: codigoBarra,
            fardo,
          });

          await queryRunner.manager.save(Prenda, nuevaPrenda);
        }

        cantidadRestante -= aClasificar;
        if (cantidadRestante <= 0) break;
      }

      await MovimientoService.registrarMovimiento({
        accion: 'clasificacion',
        cantidad,
        fardo_id: fardo.id,
        usuario_id,
        categoria_id: categoria.id,
        descripcion: `Clasificación de ${cantidad} prendas a $${precio}`,
      });

      console.log(`✔️ Movimiento registrado: Clasificación de ${cantidad} prendas para fardo ${fardo.codigo_fardo}, categoría "${nombre_categoria}", usuario ID ${usuario_id}`);

      await queryRunner.commitTransaction();
      return { message: `Clasificación exitosa. Se clasificaron ${cantidad} prendas.` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error al clasificar prendas: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },

  corregirClasificacion: async (datosCorreccion) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { codigo_fardo, cantidad_revertir, nombre_categoria, usuario_id } = datosCorreccion;

      const fardo = await queryRunner.manager.findOne(Fardo, {
        where: [{ codigo_fardo }, { codigo_barra_fardo: codigo_fardo }],
      });
      if (!fardo) throw new Error(`Fardo con código ${codigo_fardo} no encontrado.`);

      const categoria = await queryRunner.manager.findOne(Categoria, { where: { nombre_categoria } });
      if (!categoria) throw new Error(`Categoría "${nombre_categoria}" no encontrada.`);

      const estadoDisponible = await queryRunner.manager.findOne(Estado, {
        where: { nombre_estado: 'disponible' },
      });
      const estadoBodega = await queryRunner.manager.findOne(Estado, {
        where: { nombre_estado: 'bodega' },
      });

      const prendaClasificada = await queryRunner.manager.findOne(Prenda, {
        where: {
          fardo: { id: fardo.id },
          categoria: { id: categoria.id },
          estado: { id: estadoDisponible.id },
        },
      });

      if (!prendaClasificada || prendaClasificada.cantidad < cantidad_revertir) {
        throw new Error('No hay suficientes prendas clasificadas para revertir.');
      }

      prendaClasificada.cantidad -= cantidad_revertir;
      await queryRunner.manager.save(Prenda, prendaClasificada);

      let prendaBodega = await queryRunner.manager.findOne(Prenda, {
        where: {
          fardo: { id: fardo.id },
          estado: { id: estadoBodega.id },
          categoria: null,
          codigo_barra_prenda: null,
        },
      });

      if (prendaBodega) {
        prendaBodega.cantidad += cantidad_revertir;
      } else {
        prendaBodega = queryRunner.manager.create(Prenda, {
          cantidad: cantidad_revertir,
          estado: estadoBodega,
          fardo: fardo,
        });
      }

      await queryRunner.manager.save(Prenda, prendaBodega);

      await MovimientoService.registrarMovimiento({
        accion: 'reversion',
        cantidad: -cantidad_revertir,
        fardo_id: fardo.id,
        usuario_id,
        categoria_id: categoria.id,
      });

      await queryRunner.commitTransaction();
      return { message: `Clasificación corregida. ${cantidad_revertir} prendas devueltas a bodega.` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Error en corrección de clasificación: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },

  obtenerCantidadPrendasEnBodega: async (codigo) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
  
    try {
      const fardo = await queryRunner.manager.findOne(Fardo, {
        where: [
          { codigo_fardo: codigo },
          { codigo_barra_fardo: codigo },
        ],
      });
      if (!fardo) throw new Error(`Fardo con código '${codigo}' no encontrado.`);
  
      const estadoBodega = await queryRunner.manager.findOne(Estado, {
        where: { nombre_estado: 'bodega' },
      });
      if (!estadoBodega) throw new Error(`Estado 'bodega' no encontrado.`);
  
      const prendasEnBodega = await queryRunner.manager.find(Prenda, {
        where: { fardo: { id: fardo.id }, estado: { id: estadoBodega.id } },
      });
  
      const cantidadTotal = prendasEnBodega.reduce((acc, prenda) => acc + prenda.cantidad, 0);
  
      return { cantidadTotal };
    } catch (error) {
      console.error('Error al obtener prendas en bodega:', error);
      throw new Error('No se pudo obtener la cantidad de prendas en bodega.');
    } finally {
      await queryRunner.release();
    }
  },
  obtenerPrendasClasificadas: async (codigoFardo) => {
    const fardo = await fardoRepo.findOne({
      where: [
        { codigo_fardo: codigoFardo },
        { codigo_barra_fardo: codigoFardo },
      ],
    });

    if (!fardo) throw new Error('Fardo no encontrado');

    const prendas = await prendaRepo
      .createQueryBuilder('prenda')
      .leftJoinAndSelect('prenda.categoria', 'categoria')
      .where('prenda.fardo = :fardoId', { fardoId: fardo.id })
      .andWhere('prenda.estado = :estado', { estado: 'disponible' })
      .getMany();

    const resumen = {};

    for (const p of prendas) {
      const key = `${p.categoria?.nombre_categoria}-${p.precio}`;
      if (!resumen[key]) {
        resumen[key] = {
          nombre_categoria: p.categoria?.nombre_categoria,
          precio: p.precio,
          cantidad: 0,
          codigo_barra_prenda: p.codigo_barra_prenda,
        };
      }
      resumen[key].cantidad++;
    }

    return Object.values(resumen);
  },
  
  obtenerResumenConHistorico: async (codigoFardo) => {
    const repo = AppDataSource.getRepository(Prenda);
  
    const resumen = await repo
      .createQueryBuilder('prenda')
      .leftJoin('prenda.estado', 'estado')
      .leftJoin('prenda.categoria', 'categoria')
      .leftJoin('prenda.fardo', 'fardo')
      .select([
        'categoria.nombre_categoria AS categoria',
        'prenda.precio AS precio',
        'prenda.codigo_barra_prenda AS codigo_barra',
        `
        SUM(
          CASE 
            WHEN estado.nombre_estado IN ('disponible', 'vendida') THEN prenda.cantidad 
            ELSE 0 
          END
        ) AS clasificadas`,
        `
        SUM(
          CASE 
            WHEN estado.nombre_estado = 'disponible' THEN prenda.cantidad 
            ELSE 0 
          END
        ) AS disponibles`
      ])
      .where('fardo.codigo_fardo = :codigo OR fardo.codigo_barra_fardo = :codigo', { codigo: codigoFardo })
      .groupBy('categoria.nombre_categoria')
      .addGroupBy('prenda.precio')
      .addGroupBy('fardo.id')
      .addGroupBy('prenda.codigo_barra_prenda')
      .orderBy('categoria.nombre_categoria', 'ASC')
      .getRawMany();
  
    const resultado = resumen.map(item => ({
      categoria: item.categoria,
      precio: parseFloat(item.precio),
      codigo_barra: item.codigo_barra,
      clasificadas: parseInt(item.clasificadas, 10),
      disponibles: parseInt(item.disponibles, 10),
      vendidas: parseInt(item.clasificadas, 10) - parseInt(item.disponibles, 10)
    }));
  
    return resultado;
  }
  
};  

export default ClasificacionService;
