import AppDataSource from '../config/ConfigDB.js';
import Fardo from '../entities/fardo.js';
import CategoriaService from './categoria.services.js';       
import ProveedorService from './proveedor.services.js';     
import helpers from './helpers.services.js';
import categoriaSchema from '../schema/categoria.schema.js';  
import proveedorSchema from '../schema/proveedor.schema.js';  
import fardoSchema from '../schema/fardo.schema.js';          

const { generateCodigoFardo, generateUniqueBarcode } = helpers;

const FardoService = {
  crearFardo: async (datosFardo) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Extraer los campos de categoría y proveedor antes de validar con fardoSchema
      const { nombre_categoria, nombre_proveedor, ...datosFardoSinCategoriaYProveedor } = datosFardo;

      // Validar los campos propios del fardo usando fardoSchema
      const { error: fardoError, value: fardoValidado } = fardoSchema.validate(datosFardoSinCategoriaYProveedor, { abortEarly: false });
      if (fardoError) {
        const mensajes = fardoError.details.map(detail => detail.message);
        throw new Error(`Error en la validación de fardo: ${mensajes.join(', ')}`);
      }

      // Validar la categoría usando categoriaSchema
      const { error: categoriaError, value: categoriaValidada } = categoriaSchema.validate({ nombre_categoria });
      if (categoriaError) {
        const mensajes = categoriaError.details.map(detail => detail.message);
        throw new Error(`Error en la validación de la categoría: ${mensajes.join(', ')}`);
      }

      // Validar el proveedor usando proveedorSchema
      const { error: proveedorError, value: proveedorValidado } = proveedorSchema.validate({ nombre_proveedor });
      if (proveedorError) {
        const mensajes = proveedorError.details.map(detail => detail.message);
        throw new Error(`Error en la validación del proveedor: ${mensajes.join(', ')}`);
      }

      // Obtener o crear la categoría
      let categoriaObtenida = await CategoriaService.obtenerCategoria(categoriaValidada.nombre_categoria, queryRunner);
      if (!categoriaObtenida) {
        categoriaObtenida = await CategoriaService.crearCategoria({ nombre_categoria: categoriaValidada.nombre_categoria }, queryRunner);
      }

      // Verificar que la categoría obtenida tiene un ID válido
      if (!categoriaObtenida || !categoriaObtenida.id) {
        throw new Error('Error al obtener o crear la categoría: ID no encontrado');
      }

      // Obtener o crear el proveedor
      let proveedorObtenido = await ProveedorService.obtenerProveedor(proveedorValidado.nombre_proveedor, queryRunner);
      if (!proveedorObtenido) {
        proveedorObtenido = await ProveedorService.crearProveedor({ nombre_proveedor: proveedorValidado.nombre_proveedor }, queryRunner);
      }

      // Verificar que el proveedor obtenido tiene un ID válido
      if (!proveedorObtenido || !proveedorObtenido.id) {
        throw new Error('Error al obtener o crear el proveedor: ID no encontrado');
      }

      // Añadir logs de depuración
      console.log('Categoria Obtenida:', categoriaObtenida);
      console.log('Proveedor Obtenido:', proveedorObtenido);

      // Generar código de fardo y código de barras
      const codigo_fardo = await generateCodigoFardo();
      const codigo_barra_fardos = await generateUniqueBarcode();

      // Crear el fardo asignando las entidades completas
      const nuevoFardo = queryRunner.manager.create(Fardo, {
        categoria: categoriaObtenida,        
        proveedor: proveedorObtenido,        
        fecha_adquisicion: fardoValidado.fecha_adquisicion,
        costo_fardo: fardoValidado.costo_fardo,
        cantidad_prendas: fardoValidado.cantidad_prendas,
        costo_unitario_por_prenda: parseFloat((fardoValidado.costo_fardo / fardoValidado.cantidad_prendas).toFixed(2)),
        codigo_fardo,
        codigo_barra_fardos,
        perdidas: 0, 
        status: 'activo',
      });

      // Guardar el fardo
      const fardoGuardado = await queryRunner.manager.save(Fardo, nuevoFardo);

      // Commit de la transacción
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
  /**
   * Elimina un fardo de manera lógica si no tiene ventas asociadas.
   * @param {string} codigo_fardo - Código único del fardo a eliminar.
   * @returns {Promise<Object>} - Fardo eliminado.
   */
  eliminarFardo: async (codigo_fardo) => {
    try {
      const fardoRepository = AppDataSource.getRepository(fardoEntity);

      // Encontrar el fardo por su código
      const fardoAEliminar = await fardoRepository.findOne({
        where: { codigo_fardo: codigo_fardo, status: 'activo' },
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

  /**
   * Restaura un fardo eliminado.
   * @param {string} codigo_fardo - Código único del fardo a restaurar.
   * @returns {Promise<Object>} - Fardo restaurado.
   */
  restaurarFardo: async (codigo_fardo) => {
    try {
      const fardoRepository = AppDataSource.getRepository(fardoEntity);

      // Encontrar el fardo eliminado por su código
      const fardoArestaurar = await fardoRepository.findOne({
        where: { codigo_fardo: codigo_fardo, status: 'eliminado' },
      });

      if (!fardoArestaurar) {
        throw new Error('Fardo no encontrado o no está eliminado.');
      }

      // Restaurar el estado del fardo
      fardoArestaurar.status = 'activo';
      await fardoRepository.save(fardoArestaurar);

      return fardoArestaurar;
    } catch (error) {
      console.error('Error restaurando fardo:', error);
      throw error;
    }
  },

  /**
   * Obtiene un fardo por su código único.
   * @param {string} codigo_fardo - Código único del fardo.
   * @returns {Promise<Object>} - Fardo encontrado.
   */
  getFardoByCodigo: async (codigo_fardo) => {
    try {
      const fardoRepository = AppDataSource.getRepository(fardoEntity);

      const fardoEncontrado = await fardoRepository.findOne({
        where: { codigo_fardo: codigo_fardo, status: 'activo' },
        relations: ['categoria', 'proveedor'],
      });

      if (!fardoEncontrado) {
        throw new Error('Fardo no encontrado.');
      }

      return fardoEncontrado;
    } catch (error) {
      console.error('Error obteniendo fardo:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los fardos activos.
   * @returns {Promise<Array>} - Lista de fardos.
   */
  getAllFardos: async () => {
    try {
      const fardoRepository = AppDataSource.getRepository(fardoEntity);

      const fardos = await fardoRepository.find({
        where: { status: 'activo' },
        relations: ['categoria', 'proveedor'],
      });

      return fardos;
    } catch (error) {
      console.error('Error obteniendo fardos:', error);
      throw error;
    }
  },

  /**
   * Verifica si un fardo tiene ventas asociadas.
   * @param {number} fardoId - ID del fardo.
   * @returns {Promise<boolean>} - True si tiene ventas, false en caso contrario.
   */
  verificarVentas: async (fardoId) => {
    try {
      // Placeholder: Retorna false ya que el servicio de ventas aún no está implementado
      return false;

      // Una vez implementado el servicio de ventas, actualiza esta función:
      /*
      const ventas = await AppDataSource.getRepository('venta')
        .createQueryBuilder('venta')
        .innerJoin('venta.detallesVenta', 'detalleVenta')
        .innerJoin('detalleVenta.prenda', 'prenda')
        .where('prenda.fardo_id = :fardoId', { fardoId })
        .getCount();

      return ventas > 0;
      */
    } catch (error) {
      console.error('Error verificando ventas del fardo:', error);
      throw new Error('No se pudo verificar las ventas del fardo.');
    }
  },
};

export default FardoService;
