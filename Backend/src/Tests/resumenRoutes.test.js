// src/Tests/resumenRoutes.test.js
import request from 'supertest';
import app from '../app.js';
import AppDataSource from '../config/ConfigDB.js';
import { ResumenVentasDia } from '../entities/index.js';
import initTestContext from './testSetup.js';

describe('Rutas de Resumen de Ventas', () => {
  let token;

  beforeAll(async () => {
    const context = await initTestContext();
    token = context.token;
  });

  beforeEach(async () => {
    await AppDataSource.manager.clear(ResumenVentasDia);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);


    await AppDataSource.manager.save(ResumenVentasDia, {
      fecha: today,
      total_ventas: 15000,
      cantidad_ventas: 3,
      total_efectivo: 5000,
      total_tarjeta: 10000,
      total_transferencia: 0,
      total_credito: 0,
      total_descuentos: 1000,
      total_prendas: 6
    });

    await AppDataSource.manager.save(ResumenVentasDia, {
      fecha: yesterdayStr,
      total_ventas: 8000,
      cantidad_ventas: 2,
      total_efectivo: 3000,
      total_tarjeta: 0,
      total_transferencia: 5000,
      total_credito: 0,
      total_descuentos: 500,
      total_prendas: 4
    });
  });

  describe('GET /api/resumen/ultimos-dias', () => {
    it('debería obtener resumen de los últimos 7 días', async () => {
      const res = await request(app)
        .get('/api/resumen/ultimos-dias')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2); 
    });

    it('debería rechazar petición con parámetros inválidos', async () => {
      const res = await request(app)
        .get('/api/resumen/ultimos-dias?dias=invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/resumen/por-rango', () => {
    it('debería obtener resumen para un rango de fechas', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const res = await request(app)
        .get(`/api/resumen/por-rango?fechaInicio=${yesterdayStr}&fechaFin=${today}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_ventas');
      expect(Number(res.body.data.total_ventas)).toBe(23000); 
    });

    it('debería rechazar petición sin fechas', async () => {
      const res = await request(app)
        .get('/api/resumen/por-rango')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/resumen/por-dia-semana', () => {
    it('debería obtener estadísticas por día de la semana', async () => {
      const res = await request(app)
        .get('/api/resumen/por-dia-semana')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('debería rechazar peticiones sin autenticación', async () => {
    const res = await request(app)
      .get('/api/resumen/ultimos-dias');

    expect(res.statusCode).toEqual(401);
  });
});
