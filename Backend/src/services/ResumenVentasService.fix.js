// src/services/ResumenVentasService.js
import { EntitySchema } from 'typeorm';
import AppDataSource from '../config/ConfigDB.js';

const ResumenVentasService = {
  /**
   * Actualiza (o crea) el resumen del día agregando esta venta.
   * @param {EntityManager} manager  - el manager de la transacción
   * @param {string} fecha           - fecha en 'YYYY-MM-DD'
   * @param {object} ventaData       - datos de la venta:
   *   { 
   *     total: number, 
   *     descuento_total: number,
   *     metodo_pago: 'efectivo'|'tarjeta'|'transferencia'|'pendiente'|'mixto',
   *     total_prendas: number,
   *     es_credito: boolean
   *   }
   */  
  async actualizarResumenDelDia(manager, fecha, ventaData) {
    const {
      total,
      descuento_total = 0,
      metodo_pago,
      total_prendas = 0,
      es_credito = false,
      categorias = {} // Nuevo parámetro para los datos de categorías
    } = ventaData;

    // determinamos montos según método de pago
    let addEfectivo = 0, addTarjeta = 0, addTransferencia = 0, addCredito = 0;
    switch (metodo_pago) {
      case 'efectivo':       addEfectivo = total; break;
      case 'tarjeta':        addTarjeta = total; break;
      case 'transferencia':  addTransferencia = total; break;
      case 'pendiente':      addCredito = total; break;
      case 'mixto':          addCredito = total; break; // o ajusta según tu lógica
      default:               addCredito = es_credito ? total : 0;
    }

    // Verificamos si ya existe un registro para esta fecha
    const existingResumen = await manager.findOne('resumen_ventas_dia', { where: { fecha } });
    
    if (existingResumen) {
      // Si existe, actualizamos los valores y fusionamos los datos de categorías
      let categoriasActualizadas = existingResumen.categorias_json || {};
      
      // Iteramos por cada categoría de la venta actual y actualizamos los datos
      Object.entries(categorias).forEach(([categoria, datos]) => {
        if (!categoriasActualizadas[categoria]) {
          categoriasActualizadas[categoria] = { cantidad: 0, monto: 0 };
        }
        categoriasActualizadas[categoria].cantidad += datos.cantidad;
        categoriasActualizadas[categoria].monto += datos.monto;
      });
      
      // Actualizamos todos los campos, incluido el JSON de categorías
      await manager.query(`
        UPDATE resumen_ventas_dia
        SET
          total_ventas      = total_ventas + $1,
          cantidad_ventas   = cantidad_ventas + 1,
          total_efectivo    = total_efectivo + $2,
          total_tarjeta     = total_tarjeta + $3,
          total_transferencia = total_transferencia + $4,
          total_credito     = total_credito + $5,
          total_descuentos  = total_descuentos + $6,
          total_prendas     = total_prendas + $7,
          categorias_json   = $8
        WHERE fecha = $9
      `, [
        total,
        addEfectivo,
        addTarjeta,
        addTransferencia,
        addCredito,
        descuento_total,
        total_prendas,
        JSON.stringify(categoriasActualizadas),
        fecha
      ]);
    } else {
      // Si no existe, creamos un nuevo registro con todos los campos
      await manager.query(`
        INSERT INTO resumen_ventas_dia
          (fecha, total_ventas, cantidad_ventas,
           total_efectivo, total_tarjeta, total_transferencia, total_credito,
           total_descuentos, total_prendas, categorias_json)
        VALUES
          ($1, $2, 1, $3, $4, $5, $6, $7, $8, $9)
      `, [
        fecha,
        total,
        addEfectivo,
        addTarjeta,
        addTransferencia,
        addCredito,
        descuento_total,
        total_prendas,
        JSON.stringify(categorias || {})
      ]);
    }
  },
    /**
   * Obtiene el resumen de ventas para los últimos N días
   * @param {EntityManager|undefined} customManager - Manager opcional para transacciones
   * @param {number} dias - Número de días a consultar
   * @returns {Promise<Array>} - Array con los resúmenes de ventas
   */
  async obtenerResumenUltimosDias(customManager, dias = 7) {
    try {
      // Si nos pasan un manager, lo usamos; si no, usamos el de AppDataSource
      const manager = customManager || AppDataSource.manager;
        const resultado = await manager.query(`
        SELECT 
          fecha,
          total_ventas,
          cantidad_ventas,
          total_efectivo,
          total_tarjeta,
          total_transferencia,
          total_credito,
          total_descuentos,
          total_prendas,
          categorias_json
        FROM 
          resumen_ventas_dia
        WHERE 
          fecha >= CURRENT_DATE - INTERVAL '${dias} days'
        ORDER BY 
          fecha DESC
      `);
      
      return resultado;
    } catch (error) {
      console.error('Error al obtener resumen de últimos días:', error);
      throw new Error('No se pudo obtener el resumen de ventas');
    }
  },
    /**
   * Obtiene un resumen consolidado para un rango de fechas
   * @param {EntityManager|undefined} customManager - Manager opcional para transacciones
   * @param {string} fechaInicio - Fecha de inicio en formato 'YYYY-MM-DD'
   * @param {string} fechaFin - Fecha de fin en formato 'YYYY-MM-DD'
   * @returns {Promise<Object>} - Objeto con el resumen consolidado
   */
  async obtenerResumenPorRango(customManager, fechaInicio, fechaFin) {
    try {
      const manager = customManager || AppDataSource.manager;
      // Para el rango de fechas, incluimos una agregación de las categorías
      const resultado = await manager.query(`
        WITH resumenes AS (
          SELECT 
            SUM(total_ventas) as total_ventas,
            SUM(cantidad_ventas) as cantidad_ventas,
            SUM(total_efectivo) as total_efectivo,
            SUM(total_tarjeta) as total_tarjeta,
            SUM(total_transferencia) as total_transferencia,
            SUM(total_credito) as total_credito,
            SUM(total_descuentos) as total_descuentos,
            SUM(total_prendas) as total_prendas
          FROM 
            resumen_ventas_dia
          WHERE 
            fecha BETWEEN $1 AND $2
        ),
        datos_planos AS (
          -- Extraer y aplanar los datos de categorías
          SELECT
            (categoria_data).key AS nombre,
            SUM(((categoria_data).value->>'cantidad')::NUMERIC) AS total_cantidad,
            SUM(((categoria_data).value->>'monto')::NUMERIC) AS total_monto
          FROM (
            SELECT jsonb_each(categorias_json) AS categoria_data
            FROM resumen_ventas_dia
            WHERE fecha BETWEEN $1 AND $2
              AND categorias_json IS NOT NULL
          ) as categorias_desglosadas
          GROUP BY nombre
        ),
        categorias_agregadas AS (
          -- Construir un objeto JSON con los totales ya calculados
          SELECT
            jsonb_object_agg(
              nombre,
              json_build_object(
                'cantidad', total_cantidad,
                'monto', total_monto
              )
            ) AS categorias_json
          FROM datos_planos
        )
        SELECT 
          r.*,
          COALESCE(c.categorias_json, '{}'::jsonb) as categorias_json
        FROM 
          resumenes r
        CROSS JOIN 
          categorias_agregadas c
      `, [fechaInicio, fechaFin]);
      
      return resultado[0] || {
        total_ventas: 0,
        cantidad_ventas: 0,
        total_efectivo: 0,
        total_tarjeta: 0, 
        total_transferencia: 0,
        total_credito: 0,
        total_descuentos: 0,
        total_prendas: 0
      };
    } catch (error) {
      console.error('Error al obtener resumen por rango:', error);
      throw new Error('No se pudo obtener el resumen por rango');
    }
  },
    /**
   * Obtiene resumen de ventas agrupado por día de la semana
   * @param {EntityManager|undefined} customManager - Manager opcional para transacciones
   * @param {number} semanas - Número de semanas a considerar para el análisis
   * @returns {Promise<Array>} - Array con estadísticas por día de la semana
   */
  async obtenerResumenPorDiaSemana(customManager, semanas = 4) {
    try {
      const manager = customManager || AppDataSource.manager;
      
      const resultado = await manager.query(`
        SELECT 
          EXTRACT(DOW FROM fecha) as dia_semana,
          TO_CHAR(fecha, 'Day') as nombre_dia,
          AVG(total_ventas) as promedio_ventas,
          AVG(cantidad_ventas) as promedio_cantidad,
          SUM(total_ventas) as total_ventas,
          SUM(cantidad_ventas) as cantidad_ventas
        FROM 
          resumen_ventas_dia
        WHERE 
          fecha >= CURRENT_DATE - INTERVAL '${semanas * 7} days'
        GROUP BY 
          dia_semana, nombre_dia
        ORDER BY 
          dia_semana
      `);
      
      return resultado;
    } catch (error) {
      console.error('Error al obtener resumen por día de semana:', error);
      throw new Error('No se pudo obtener el resumen por día de semana');
    }
  },
  /**
   * Obtiene estadísticas de ventas por categoría en un rango de fechas
   * @param {EntityManager|undefined} customManager - Manager opcional para transacciones
   * @param {Object} options - Opciones de consulta
   * @param {string} options.fechaInicio - Fecha inicial en formato 'YYYY-MM-DD'
   * @param {string} options.fechaFin - Fecha final en formato 'YYYY-MM-DD'
   * @param {string} [options.orderBy='monto'] - Campo para ordenar: 'monto' o 'cantidad'
   * @param {boolean} [options.descendente=true] - Orden descendente (true) o ascendente (false)
   * @returns {Promise<Array>} - Array con las estadísticas por categoría
   */
  async obtenerEstadisticasPorCategoria(customManager, options) {
    try {
      const {
        fechaInicio,
        fechaFin,
        orderBy = 'monto',
        descendente = true
      } = options;

      // Si nos pasan un manager, lo usamos; si no, usamos el de AppDataSource
      const manager = customManager || AppDataSource.manager;

      // Utilizamos PostgreSQL para procesar los datos JSON directamente en la consulta
      const resultado = await manager.query(`
        WITH categorias AS (
          SELECT 
            fecha, 
            jsonb_each(categorias_json) AS categoria_data
          FROM 
            resumen_ventas_dia
          WHERE 
            fecha BETWEEN $1 AND $2
            AND categorias_json IS NOT NULL
        ),
        datos_planos AS (
          SELECT
            (categoria_data).key AS nombre_categoria,
            ((categoria_data).value->>'cantidad')::NUMERIC AS cantidad,
            ((categoria_data).value->>'monto')::NUMERIC AS monto
          FROM
            categorias
        ),
        totales AS (
          SELECT
            nombre_categoria,
            SUM(cantidad) AS total_cantidad,
            SUM(monto) AS total_monto
          FROM
            datos_planos
          GROUP BY
            nombre_categoria
        )
        SELECT
          nombre_categoria AS nombre,
          total_cantidad AS cantidad,
          total_monto AS monto
        FROM
          totales
        ORDER BY
          ${orderBy === 'cantidad' ? 'total_cantidad' : 'total_monto'} ${descendente ? 'DESC' : 'ASC'}
      `, [fechaInicio, fechaFin]);
      
      return resultado;
    } catch (error) {
      console.error('Error al obtener estadísticas por categoría:', error);
      throw new Error('No se pudo obtener las estadísticas por categoría');
    }
  }
};

export default ResumenVentasService;
