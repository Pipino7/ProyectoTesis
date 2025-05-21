// src/Tests/categorias_json.test.js
import AppDataSource from '../config/ConfigDB.js';
import ResumenVentasService from '../services/ResumenVentasService.js';
import { ResumenVentasDia } from '../entities/index.js';



describe('Campo categorias_json en ResumenVentasDia', () => {
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

  it('debe almacenar datos de categorías en formato JSON', async () => {
    const fecha = '2025-05-20';
    

    const categoriasData = {
      'Pantalones': { cantidad: 3, monto: 30000 },
      'Camisas': { cantidad: 2, monto: 25000 }
    };
    
    await ResumenVentasService.actualizarResumenDelDia(manager, fecha, {
      total: 55000,
      descuento_total: 5000,
      metodo_pago: 'efectivo',
      total_prendas: 5,
      es_credito: false,
      categorias: categoriasData
    });

    const resumen = await manager.findOne(ResumenVentasDia, { where: { fecha } });
    
    expect(resumen).not.toBeNull();
    expect(resumen.categorias_json).not.toBeNull();
    expect(typeof resumen.categorias_json).toBe('object');
    expect(resumen.categorias_json.Pantalones).toEqual({ cantidad: 3, monto: 30000 });
    expect(resumen.categorias_json.Camisas).toEqual({ cantidad: 2, monto: 25000 });
  });

  it('debe acumular datos de categorías en múltiples ventas', async () => {
    const fecha = '2025-05-21';
    
    // Primera venta
    await ResumenVentasService.actualizarResumenDelDia(manager, fecha, {
      total: 30000,
      descuento_total: 0,
      metodo_pago: 'efectivo',
      total_prendas: 3,
      es_credito: false,
      categorias: {
        'Pantalones': { cantidad: 3, monto: 30000 }
      }
    });

    // Segunda venta
    await ResumenVentasService.actualizarResumenDelDia(manager, fecha, {
      total: 25000,
      descuento_total: 0,
      metodo_pago: 'tarjeta',
      total_prendas: 2,
      es_credito: false,
      categorias: {
        'Camisas': { cantidad: 2, monto: 25000 }
      }
    });

    // Tercera venta con categoría repetida
    await ResumenVentasService.actualizarResumenDelDia(manager, fecha, {
      total: 40000,
      descuento_total: 0,
      metodo_pago: 'transferencia',
      total_prendas: 4,
      es_credito: false,
      categorias: {
        'Pantalones': { cantidad: 2, monto: 20000 },
        'Zapatos': { cantidad: 2, monto: 20000 }
      }
    });

    const resumen = await manager.findOne(ResumenVentasDia, { where: { fecha } });
    
    expect(resumen).not.toBeNull();
    expect(resumen.categorias_json).not.toBeNull();
    expect(resumen.categorias_json.Pantalones).toEqual({ cantidad: 5, monto: 50000 });
    expect(resumen.categorias_json.Camisas).toEqual({ cantidad: 2, monto: 25000 });
    expect(resumen.categorias_json.Zapatos).toEqual({ cantidad: 2, monto: 20000 });
    expect(resumen.total_ventas).toBe('95000.00');
  });
});
