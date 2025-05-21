// src/Tests/resumenVentasService.test.js
import AppDataSource from '../config/ConfigDB.js';
import ResumenVentasService from '../services/ResumenVentasService.js';
import { ResumenVentasDia } from '../entities/index.js';



describe('ResumenVentasService (unit)', () => {
  let manager;

  beforeAll(async () => {
    await AppDataSource.initialize();
    manager = AppDataSource.manager;

    await AppDataSource.synchronize(true);
  });
  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {

    await manager.clear(ResumenVentasDia);
  });

  it('inserta un nuevo resumen cuando no existía', async () => {
    const fecha = '2025-05-20';
    await ResumenVentasService.actualizarResumenDelDia(manager, fecha, {
      total: 10000,
      descuento_total: 2000,
      metodo_pago: 'efectivo',
      total_prendas: 5,
      es_credito: false,
    });

    const resumen = await manager.findOne(ResumenVentasDia, { where: { fecha } });
    expect(resumen).not.toBeNull();
    expect(Number(resumen.total_ventas)).toBe(10000);
    expect(resumen.cantidad_ventas).toBe(1);
    expect(Number(resumen.total_efectivo)).toBe(10000);
    expect(resumen.total_prendas).toBe(5);
  });

  it('acumula ventas en el mismo día', async () => {
    const fecha = '2025-05-20';
    // primera venta
    await ResumenVentasService.actualizarResumenDelDia(manager, fecha, {
      total:  8000, descuento_total: 0,
      metodo_pago: 'tarjeta', total_prendas: 3, es_credito: false
    });
    // segunda venta
    await ResumenVentasService.actualizarResumenDelDia(manager, fecha, {
      total:  2000, descuento_total: 500,
      metodo_pago: 'efectivo', total_prendas: 2, es_credito: false
    });

    const resumen = await manager.findOne(ResumenVentasDia, { where: { fecha } });
    expect(resumen).not.toBeNull();
    expect(Number(resumen.total_ventas)).toBe(10000);
    expect(resumen.cantidad_ventas).toBe(2);
    expect(Number(resumen.total_efectivo)).toBe(2000);
    expect(Number(resumen.total_tarjeta)).toBe(8000);
    expect(Number(resumen.total_descuentos)).toBe(500);
    expect(resumen.total_prendas).toBe(5);
  });

  describe('Tests para consultas', () => {
    beforeEach(async () => {
      const today = new Date().toISOString().slice(0, 10);
      
      for (let i = 0; i < 10; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().slice(0, 10);
        const total = 10000 - (i * 500); 
        const cantidadPrendas = 10 - i;
        
        const metodoPago = i % 3 === 0 ? 'efectivo' : 
                          i % 3 === 1 ? 'tarjeta' : 'transferencia';
        
        await ResumenVentasService.actualizarResumenDelDia(manager, fechaStr, {
          total,
          descuento_total: total * 0.1, 
          metodo_pago: metodoPago,
          total_prendas: cantidadPrendas,
          es_credito: i % 5 === 0 
        });
      }
    });    it('obtiene resumen de los últimos 7 días', async () => {
      const resumen = await ResumenVentasService.obtenerResumenUltimosDias(manager, 7);

      expect(Array.isArray(resumen)).toBe(true);
      expect(resumen.length).toBeLessThanOrEqual(10);
      
      if (resumen.length > 0) {
        expect(resumen[0]).toHaveProperty('fecha');
        expect(resumen[0]).toHaveProperty('total_ventas');
      }
      for (let i = 0; i < resumen.length - 1; i++) {
        const fechaActual = new Date(resumen[i].fecha);
        const fechaSiguiente = new Date(resumen[i + 1].fecha);
        expect(fechaActual >= fechaSiguiente).toBe(true);
      }
    });    it('obtiene resumen por rango de fechas', async () => {
      const hoy = new Date();
      const fechaFin = hoy.toISOString().slice(0, 10);
      
      hoy.setDate(hoy.getDate() - 5);
      const fechaInicio = hoy.toISOString().slice(0, 10);
      
      const resumen = await ResumenVentasService.obtenerResumenPorRango(manager, fechaInicio, fechaFin);
      
      expect(typeof resumen).toBe('object');
      expect(resumen).toHaveProperty('total_ventas');
      expect(resumen).toHaveProperty('cantidad_ventas');
      expect(resumen).toHaveProperty('total_efectivo');
      expect(resumen).toHaveProperty('total_tarjeta');
    });    it('obtiene estadísticas por día de la semana', async () => {
      const resumen = await ResumenVentasService.obtenerResumenPorDiaSemana(manager, 2);
      expect(Array.isArray(resumen)).toBe(true);
      if (resumen.length > 0) {
        expect(resumen[0]).toHaveProperty('dia_semana');
        expect(resumen[0]).toHaveProperty('nombre_dia');
        expect(resumen[0]).toHaveProperty('promedio_ventas');
        expect(resumen[0]).toHaveProperty('total_ventas');
      }
    });
    
    it('obtiene estadísticas por categoría', async () => {
      const fechaHoy = new Date().toISOString().slice(0, 10);
      const fechaAyer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      await manager.clear(ResumenVentasDia);
      
      await ResumenVentasService.actualizarResumenDelDia(manager, fechaHoy, {
        total: 50000,
        descuento_total: 5000,
        metodo_pago: 'efectivo',
        total_prendas: 10,
        es_credito: false,
        categorias: {
          'Pantalones': { cantidad: 4, monto: 20000 },
          'Camisas': { cantidad: 3, monto: 15000 },
          'Zapatos': { cantidad: 3, monto: 15000 }
        }
      });
      await ResumenVentasService.actualizarResumenDelDia(manager, fechaAyer, {
        total: 35000,
        descuento_total: 2000,
        metodo_pago: 'tarjeta',
        total_prendas: 7,
        es_credito: false,
        categorias: {
          'Pantalones': { cantidad: 2, monto: 10000 },
          'Camisas': { cantidad: 5, monto: 25000 }
        }
      });
      
      const estadisticas = await ResumenVentasService.obtenerEstadisticasPorCategoria(
        manager, 
        { 
          fechaInicio: fechaAyer,
          fechaFin: fechaHoy,
          orderBy: 'monto', 
          descendente: true 
        }
      );
      expect(Array.isArray(estadisticas)).toBe(true);
      expect(estadisticas.length).toBe(3); 
      expect(estadisticas[0].nombre).toBe('Camisas');
      expect(Number(estadisticas[0].monto)).toBe(40000);
      expect(Number(estadisticas[0].cantidad)).toBe(8);
      
      expect(estadisticas[1].nombre).toBe('Pantalones');
      expect(Number(estadisticas[1].monto)).toBe(30000);
      expect(Number(estadisticas[1].cantidad)).toBe(6);
      const estadisticasPorCantidad = await ResumenVentasService.obtenerEstadisticasPorCategoria(
        manager, 
        { 
          fechaInicio: fechaAyer,
          fechaFin: fechaHoy,
          orderBy: 'cantidad', 
          descendente: false 
        }
      );
      expect(estadisticasPorCantidad[0].nombre).toBe('Zapatos');
      expect(Number(estadisticasPorCantidad[0].cantidad)).toBe(3);
    });
  });
});
