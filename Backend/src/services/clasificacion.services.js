import AppDataSource from '../config/ConfigDB.js';
import Fardo from '../entities/fardo.js';
import Prenda from '../entities/prenda.js';
import HistorialClasificacion from '../entities/historialclasificacion.js';
import Categoria from '../entities/categoria.js';
import Estado from '../entities/estado.js';
import HelpersService from './helpers.services.js'; 

const ClasificacionService = {
  clasificarPrendas: async (datosClasificacion) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { codigo_fardo, cantidad, precio, nombre_categoria } = datosClasificacion;

      // Verificar existencia del fardo
      const fardo = await ClasificacionService._obtenerFardo(codigo_fardo, queryRunner);
      if (!fardo) throw new Error(`Fardo con código ${codigo_fardo} no encontrado.`);

      // Obtener la categoría o crearla si no existe
      let categoria = await queryRunner.manager.findOne(Categoria, { where: { nombre_categoria } });
      if (!categoria) {
        categoria = queryRunner.manager.create(Categoria, { nombre_categoria });
        await queryRunner.manager.save(Categoria, categoria);
        console.log(`Categoría '${nombre_categoria}' creada con ID ${categoria.id}.`);
      }

  
      const estadoDisponible = await queryRunner.manager.findOne(Estado, { where: { nombre_estado: 'disponible' } });
      if (!estadoDisponible) {
        throw new Error('Estado "disponible" no encontrado.');
      }

      // Obtener prendas en bodega sin categoría para este fardo
      const prendasBodega = await queryRunner.manager.find(Prenda, {
        relations: ['estado', 'fardo'],
        where: { fardo: { id: fardo.id }, estado: { nombre_estado: 'bodega' }, categoria: null },
      });

      const cantidadDisponible = prendasBodega.reduce((total, prenda) => total + prenda.cantidad, 0);

      console.log('Cantidad solicitada para clasificar:', cantidad); 
      console.log('Cantidad disponible en bodega:', cantidadDisponible); 
      console.log('Prendas en bodega:', prendasBodega); 

      if (cantidad > cantidadDisponible) { 
        throw new Error(`No se puede clasificar ${cantidad} prendas. Solo hay ${cantidadDisponible} prendas disponibles en bodega.`);
      }

      let cantidadRestante = cantidad;
      for (const prenda of prendasBodega) {
          const cantidadAClasificar = Math.min(prenda.cantidad, cantidadRestante);
          prenda.cantidad -= cantidadAClasificar;  
      
          if (prenda.cantidad === 0) {
              await queryRunner.manager.remove(Prenda, prenda);
              console.log(`Prenda con ID ${prenda.id} eliminada de la bodega por tener cantidad 0.`);
          } else {
              await queryRunner.manager.save(Prenda, prenda);
              console.log(`Reduciendo cantidad en bodega para la prenda: ${prenda.id}. Nueva cantidad: ${prenda.cantidad}`);
          }
      
          const prendaExistente = await queryRunner.manager.findOne(Prenda, {
              where: {
                  fardo: { id: fardo.id },
                  categoria: categoria,
                  precio: precio,
                  estado: estadoDisponible
              }
          });
      
          if (prendaExistente) {
              
              prendaExistente.cantidad += cantidadAClasificar;
              await queryRunner.manager.save(Prenda, prendaExistente);
              console.log(`Prenda existente actualizada con ID ${prendaExistente.id}, cantidad aumentada a: ${prendaExistente.cantidad}`);
          } else {
              
              const codigoBarra = await HelpersService.generateUniqueBarcode();
      
              
              const nuevaPrenda = queryRunner.manager.create(Prenda, {
                  cantidad: cantidadAClasificar,
                  precio,
                  estado: estadoDisponible,
                  categoria: categoria,
                  codigo_barra_prenda: codigoBarra,
                  fardo: fardo
              });
              await queryRunner.manager.save(Prenda, nuevaPrenda);
              console.log(`Nueva prenda creada con ID ${nuevaPrenda.id}, cantidad: ${nuevaPrenda.cantidad}`);
          }
      
          cantidadRestante -= cantidadAClasificar;
          if (cantidadRestante <= 0) break;
        
        if (prenda.cantidad === 0) {
          await queryRunner.manager.remove(Prenda, prenda);
          console.log(`Prenda con ID ${prenda?.id} eliminada de la bodega por tener cantidad 0.`);
        } else {
          await queryRunner.manager.save(Prenda, prenda);
          console.log(`Reduciendo cantidad en bodega para la prenda: ${prenda?.id}. Nueva cantidad: ${prenda.cantidad}`);
        }

        
        const codigoBarra = await HelpersService.generateUniqueBarcode();

        // Crear una nueva prenda con la categoría asignada y estado 'disponible'
        const nuevaPrenda = queryRunner.manager.create(Prenda, {
          cantidad: cantidadAClasificar,
          precio,
          estado: estadoDisponible, 
          categoria: categoria,
          codigo_barra_prenda: codigoBarra, 
          fardo: fardo, 
        });
        await queryRunner.manager.save(Prenda, nuevaPrenda);
        console.log(`Nueva prenda creada con ID ${nuevaPrenda.id}, estado 'disponible', cantidad: ${nuevaPrenda.cantidad}, código de barras: ${nuevaPrenda.codigo_barra_prenda}`);

        cantidadRestante -= cantidadAClasificar;
        if (cantidadRestante <= 0) break;
      }

      
      await ClasificacionService._registrarClasificacion(fardo.id, cantidad, cantidadDisponible - cantidad, 'clasificacion', queryRunner);
      console.log(`Clasificación registrada para fardo ${fardo.id}: ${cantidad} prendas.`);

      await queryRunner.commitTransaction();
      return { message: `${cantidad} prendas clasificadas correctamente para el fardo ${codigo_fardo}.` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en clasificarPrendas:', error);
      throw new Error('Error en clasificación: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },

  // Método para corregir una clasificación existente
  corregirClasificacion: async (datosCorreccion) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const { codigo_fardo, cantidad_correcta, nombre_categoria } = datosCorreccion;
  
      // Verificar fardo
      const fardo = await ClasificacionService._obtenerFardo(codigo_fardo, queryRunner);
      if (!fardo) throw new Error(`Fardo con código ${codigo_fardo} no encontrado.`);
  
      
      const prendasClasificadas = await ClasificacionService._obtenerCantidadPrendasClasificadas(fardo.id, nombre_categoria, queryRunner);
      
      if (prendasClasificadas === 0) {
      throw new Error(`No se pueden devolver prendas. Aún no hay prendas clasificadas en el local para la categoría "${nombre_categoria}".`);
      }

    
      if (prendasClasificadas === 0) {
        throw new Error(`No se pueden devolver prendas. Aún no hay prendas clasificadas en el local para la categoría "${nombre_categoria}".`);
      }
  
      
      if (prendasClasificadas < cantidad_correcta) {
        throw new Error(`La cantidad corregida no puede ser mayor que la cantidad clasificada.`);
      }
      
  
      const cantidad_a_revertir = prendasClasificadas - cantidad_correcta;
  
      
      await ClasificacionService._ajustarCantidadClasificada(fardo.id, nombre_categoria, cantidad_a_revertir, queryRunner);
      await ClasificacionService._registrarClasificacion(fardo.id, -cantidad_a_revertir, prendasClasificadas - cantidad_a_revertir, 'correccion', queryRunner);
      console.log(`Clasificación corregida: ${cantidad_a_revertir} prendas devueltas a bodega para el fardo ${fardo.id}.`);
  
      await queryRunner.commitTransaction();
      return { message: `Clasificación corregida. ${cantidad_a_revertir} prendas devueltas a bodega para el fardo ${codigo_fardo}.` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en corregirClasificacion:', error);
      throw new Error('Error en corrección de clasificación: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },
  obtenerHistorial: async (codigo_fardo) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const fardo = await ClasificacionService._obtenerFardo(codigo_fardo, queryRunner);
      if (!fardo) throw new Error(`Fardo con código ${codigo_fardo} no encontrado.`);

      const historial = await queryRunner.manager.find(HistorialClasificacion, {
        where: { fardo: { id: fardo.id } },
        order: { fecha_clasificacion: 'DESC' },
      });

      return historial.map(entry => ({
        fecha: entry.fecha_clasificacion,
        accion: entry.accion,
        cantidad_clasificada: entry.cantidad_clasificada,
        cantidad_restante_bodega: entry.cantidad_restante_bodega,
        descripcion: entry.descripcion,
      }));
    } catch (error) {
      console.error('Error en obtenerHistorial:', error);
      throw new Error('Error al obtener historial: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },

  _obtenerFardo: async (codigo_fardo, queryRunner) => {
    return await queryRunner.manager.findOne(Fardo, { where: { codigo_fardo } });
  },



  obtenerPrendasClasificadas: async (codigo_fardo) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
  
    try {
      // Buscar el fardo por código
      const fardo = await queryRunner.manager.findOne(Fardo, {
        where: { codigo_fardo },
      });
      if (!fardo) throw new Error(`Fardo con código ${codigo_fardo} no encontrado.`);
  
      const prendasClasificadas = await queryRunner.manager.find(Prenda, {
        relations: ['categoria', 'estado'], // Incluye relaciones necesarias
        where: { fardo: { id: fardo.id }, estado: { nombre_estado: 'disponible' } },
      });
  
      // Formatear las prendas clasificadas
      const datosClasificados = prendasClasificadas.map((prenda) => ({
        id: prenda.id,
        codigo_barra_prenda: prenda.codigo_barra_prenda,
        nombre_categoria: prenda.categoria.nombre_categoria,
        precio: prenda.precio,
        cantidad: prenda.cantidad,
      }));
  
      return datosClasificados;
    } catch (error) {
      console.error('Error en obtenerPrendasClasificadas:', error);
      throw new Error('Error al obtener prendas clasificadas: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },

  _actualizarBodega: async (fardo_id, nombre_categoria, cantidad, queryRunner) => {
    const prendasBodega = await queryRunner.manager.find(Prenda, {
      relations: ['estado', 'fardo'],
      where: { fardo: { id: fardo_id }, estado: { nombre_estado: 'bodega' }, categoria: null },
    });

    console.log('Prendas en bodega:', prendasBodega);  // Verificar la estructura completa de prendasBodega

    prendasBodega.cantidad -= cantidad;
    await queryRunner.manager.save(Prenda, prendasBodega);

    if (prendasBodega.cantidad === 0) {
      await queryRunner.manager.remove(Prenda, prendasBodega);
    }
  },

  _ajustarCantidadClasificada: async (fardo_id, nombre_categoria, cantidad_a_revertir, queryRunner) => {
    const prenda = await queryRunner.manager.findOne(Prenda, {
      relations: ['estado', 'fardo', 'categoria'],
      where: { fardo: { id: fardo_id }, categoria: { nombre_categoria }, estado: { nombre_estado: 'disponible' } },
    });

    // Asegúrate de que se encontró la prenda antes de continuar
    if (!prenda) {
        throw new Error(`No se encontró ninguna prenda en estado disponible para la categoría "${nombre_categoria}".`);
    }

    prenda.cantidad -= cantidad_a_revertir;
    if (prenda.cantidad === 0) {
      await queryRunner.manager.remove(Prenda, prenda);
    } else {
      await queryRunner.manager.save(Prenda, prenda);
    }

    
    const estadoBodega = await queryRunner.manager.findOne(Estado, { where: { nombre_estado: 'bodega' } });
    if (!estadoBodega) {
        throw new Error('Estado "bodega" no encontrado en la base de datos.');
    }

    let prendaBodega = await queryRunner.manager.findOne(Prenda, {
      where: { fardo: { id: fardo_id }, categoria: null, estado: { id: estadoBodega.id } },
    });

    // Si la prenda en bodega existe, actualiza su cantidad; si no, crea una nueva
    if (prendaBodega) {
      prendaBodega.cantidad += cantidad_a_revertir;
    } else {
      prendaBodega = queryRunner.manager.create(Prenda, {
        fardo: { id: fardo_id },
        categoria: null, 
        estado: estadoBodega, 
        codigo_barra_prenda: null, 
        cantidad: cantidad_a_revertir,
        precio: null 
      });
    }

    await queryRunner.manager.save(Prenda, prendaBodega);
},


  _registrarClasificacion: async (fardo_id, cantidad_clasificada, cantidad_restante_bodega, accion, queryRunner, descripcion = '') => {
    const nuevaClasificacion = queryRunner.manager.create(HistorialClasificacion, {
      fardo: { id: fardo_id },
      cantidad_clasificada,
      cantidad_restante_bodega,
      accion,
      descripcion,
    });
    await queryRunner.manager.save(HistorialClasificacion, nuevaClasificacion);
    console.log(`Clasificación registrada: ${accion}, cantidad clasificada: ${cantidad_clasificada}, cantidad restante: ${cantidad_restante_bodega}`);
  },

  obtenerPrendasBodega: async (codigo) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
  
    try {
      // Buscar el fardo por código de barra o código de fardo
      const fardo = await queryRunner.manager.findOne(Fardo, {
        where: [{ codigo_fardo: codigo }, { codigo_barra_fardo: codigo }],
      });
      if (!fardo) throw new Error(`Fardo con código ${codigo} no encontrado.`);
  

      const estadoBodega = await queryRunner.manager.findOne(Estado, {
        where: { nombre_estado: 'bodega' },
      });
      if (!estadoBodega) throw new Error(`Estado 'bodega' no encontrado.`);
  
      // Obtener las prendas en estado 'bodega' para este fardo
      const prendasEnBodega = await queryRunner.manager.find(Prenda, {
        where: { fardo: { id: fardo.id }, estado: { id: estadoBodega.id } },
      });
  
      // Calcular la cantidad total de prendas en bodega
      const cantidadTotal = prendasEnBodega.reduce((total, prenda) => total + prenda.cantidad, 0);
  
      console.log(`Cantidad total de prendas en bodega para el fardo ${codigo}: ${cantidadTotal}`);
      return { cantidadTotal };
    } catch (error) {
      console.error('Error en obtenerPrendasBodega:', error);
      throw new Error('Error al obtener prendas en bodega: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  },
};

export default ClasificacionService;
