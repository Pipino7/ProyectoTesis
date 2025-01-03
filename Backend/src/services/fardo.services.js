import AppDataSource from '../config/ConfigDB.js';
import CategoriaService from './categoria.services.js';
import ProveedorService from './proveedor.services.js';
import helpers from './helpers.services.js';
import { Fardo, Estado, Prenda,} from '../entities/index.js';

const { generateCodigoFardo, generateUniqueBarcode } = helpers;

const FardoService = {
  crearFardo: async (datosFardo) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { nombre_categoria, nombre_proveedor, ...datosFardoSinCategoriaYProveedor } = datosFardo;

      // Obtener o crear la categoría
      let categoriaObtenida = await CategoriaService.obtenerCategoria(nombre_categoria, queryRunner);
      if (!categoriaObtenida) {
        categoriaObtenida = await CategoriaService.crearCategoria({ nombre_categoria }, queryRunner);
      }

      // Obtener o crear el proveedor
      let proveedorObtenido = await ProveedorService.obtenerProveedor(nombre_proveedor, queryRunner);
      if (!proveedorObtenido) {
        proveedorObtenido = await ProveedorService.crearProveedor({ nombre_proveedor }, queryRunner);
      }

      // Obtener o crear el estado "bodega" solo una vez al inicio
      let estadoBodega = await queryRunner.manager.findOne(Estado, { where: { nombre_estado: 'bodega' } });
      if (!estadoBodega) {
        estadoBodega = queryRunner.manager.create(Estado, { nombre_estado: 'bodega' });
        estadoBodega = await queryRunner.manager.save(Estado, estadoBodega);
        console.log('Estado "bodega" creado automáticamente.');
      }

      
      const codigo_fardo = await generateCodigoFardo();
      const codigo_barra_fardo = await generateUniqueBarcode();

      const nuevoFardo = queryRunner.manager.create(Fardo, {
        categoria: categoriaObtenida,
        proveedor: proveedorObtenido,
        fecha_adquisicion: datosFardoSinCategoriaYProveedor.fecha_adquisicion,
        costo_fardo: datosFardoSinCategoriaYProveedor.costo_fardo,
        cantidad_prendas: datosFardoSinCategoriaYProveedor.cantidad_prendas,
        costo_unitario_por_prenda: parseFloat((datosFardoSinCategoriaYProveedor.costo_fardo / datosFardoSinCategoriaYProveedor.cantidad_prendas).toFixed(2)),
        codigo_fardo,
        codigo_barra_fardo,
        perdidas: 0,
        status: 'activo',
      });

      // Guardar el fardo
      const fardoGuardado = await queryRunner.manager.save(Fardo, nuevoFardo);

      // Crear la prenda asociada al fardo
      const nuevaPrenda = {
        fardo: fardoGuardado,
        codigo_barra_prenda: null,  
        precio: null,               
        estado: estadoBodega,       
        cantidad: datosFardoSinCategoriaYProveedor.cantidad_prendas,
      };

      await queryRunner.manager.save(Prenda, nuevaPrenda);

      await queryRunner.commitTransaction();
      return fardoGuardado;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creando fardo:', error);
      throw new Error('No se pudo crear el fardo: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },

  eliminarFardo: async (codigo_fardo) => {
    try {
      const fardoRepository = AppDataSource.getRepository(Fardo);

      const fardoAEliminar = await fardoRepository.findOne({
        where: { codigo_fardo, status: 'activo' },
        relations: ['prendas'],
      });

      if (!fardoAEliminar) {
        throw new Error('Fardo no encontrado o ya está eliminado.');
      }

      // Verificar si el fardo tiene ventas asociadas
      const tieneVentas = await FardoService.verificarVentas(fardoAEliminar.id);
      if (tieneVentas) {
        throw new Error('No se puede eliminar el fardo ya que tiene ventas asociadas.');
      }

      // Marcar el fardo como eliminado
      fardoAEliminar.status = 'eliminado';
      await fardoRepository.save(fardoAEliminar);

      return fardoAEliminar;
    } catch (error) {
      console.error('Error eliminando fardo:', error);
      throw error;
    }
  },

  restaurarFardo: async (codigo_fardo) => {
    try {
      const fardoRepository = AppDataSource.getRepository(Fardo);

      const fardoArestaurar = await fardoRepository.findOne({
        where: { codigo_fardo, status: 'eliminado' },
      });

      if (!fardoArestaurar) {
        throw new Error('Fardo no encontrado o no está eliminado.');
      }

      
      fardoArestaurar.status = 'activo';
      await fardoRepository.save(fardoArestaurar);

      return fardoArestaurar;
    } catch (error) {
      console.error('Error restaurando fardo:', error);
      throw error;
    }
  },

  getFardoByCodigo: async ({ codigo_fardo, codigo_barra }) => {
    try {
      const fardoRepository = AppDataSource.getRepository(Fardo);
  
      let fardoEncontrado;
  
      // Buscar por código de fardo o código de barra, según cuál esté disponible
      if (codigo_fardo) {
        fardoEncontrado = await fardoRepository.findOne({
          where: { codigo_fardo, status: 'activo' },
          relations: ['categoria', 'proveedor'],
        });
      } else if (codigo_barra) {
        fardoEncontrado = await fardoRepository.findOne({
          where: { codigo_barra, status: 'activo' },
          relations: ['categoria', 'proveedor'],
        });
      } else {
        throw new Error('Debe proporcionar un código de fardo o un código de barra para buscar.');
      }
  
      if (!fardoEncontrado) {
        throw new Error('Fardo no encontrado.');
      }
  
      return fardoEncontrado;
    } catch (error) {
      console.error('Error obteniendo fardo:', error);
      throw error;
    }
  },

  getAllFardos: async ({ page = 1, limit = 15, orden = 'desc', proveedor, categoria, precioMin, precioMax, fechaInicio, fechaFin, codigoFardo }) => {
    try {
        const fardoRepository = AppDataSource.getRepository(Fardo);

        precioMin = isNaN(precioMin) ? undefined : precioMin;
        precioMax = isNaN(precioMax) ? undefined : precioMax;

        console.log("Parámetros recibidos en getAllFardos (post-validación):", {
            page,
            limit,
            orden,
            proveedor,
            categoria,
            precioMin,
            precioMax,
            fechaInicio,
            fechaFin,
            codigoFardo, // Añadido
        });

        // Construcción de la consulta (igual que antes)
        const query = fardoRepository.createQueryBuilder('fardo')
            .where('fardo.status = :status', { status: 'activo' })
            .leftJoinAndSelect('fardo.categoria', 'categoria')
            .leftJoinAndSelect('fardo.proveedor', 'proveedor');

        // Filtro por proveedor
        if (proveedor) {
            query.andWhere('LOWER(proveedor.nombre_proveedor) = LOWER(:proveedor)', { proveedor });
        }
        if (categoria) {
            query.andWhere('LOWER(categoria.nombre_categoria) = LOWER(:categoria)', { categoria });
        }

        // Filtro por rango de precios
        if (precioMin !== undefined || precioMax !== undefined) {
            if (precioMin !== undefined && precioMax !== undefined) {
                query.andWhere('fardo.costo_fardo BETWEEN :precioMin AND :precioMax', { precioMin, precioMax });
            } else if (precioMin !== undefined) {
                query.andWhere('fardo.costo_fardo >= :precioMin', { precioMin });
            } else if (precioMax !== undefined) {
                query.andWhere('fardo.costo_fardo <= :precioMax', { precioMax });
            }
        }

        // Filtro por rango de fechas
        if (fechaInicio && fechaFin) {
            query.andWhere('fardo.fecha_adquisicion BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin });
        }

        // Filtro por código de fardo (nuevo)
        if (codigoFardo) {
            query.andWhere('LOWER(fardo.codigo_fardo) LIKE LOWER(:codigoFardo)', { codigoFardo: `%${codigoFardo}%` });
        }

        query.orderBy('fardo.fecha_adquisicion', orden.toUpperCase())
            .skip((page - 1) * limit)
            .take(limit);

        console.log("Consulta SQL generada:", query.getSql());

        const [fardos, total] = await query.getManyAndCount();
        console.log("Resultados obtenidos: ", fardos.length, "fardos encontrados, total de páginas:", Math.ceil(total / limit));

        return {
            fardos,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Error obteniendo fardos:', error);
        throw error;
    }
},


  

  verificarVentas: async (fardoId) => {
    try {
      return false;
    } catch (error) {
      console.error('Error verificando ventas del fardo:', error);
      throw new Error('No se pudo verificar las ventas del fardo.');
    }
  },
};

export default FardoService;
