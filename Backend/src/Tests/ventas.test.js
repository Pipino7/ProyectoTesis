// tests/ventas.integration.test.js
import request from 'supertest';
import app from '../app.js';
import initTestContext from './testSetup.js';
import AppDataSource from '../config/ConfigDB.js';
import ResumenVentasDia from '../src/entities/resumen_ventas_dia.js';

let token;

beforeAll(async () => {
  const ctx = await initTestContext();
  token = ctx.token;
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe('POST /api/ventas/crear y actualización de resumen diario', () => {
  it('debería crear una venta y actualizar resumen_ventas_dia', async () => {
    // 1) Ejecutar el endpoint de venta
    const res = await request(app)
      .post('/api/ventas/crear')
      .set('Authorization', `Bearer ${token}`)
      .send({
        metodo_pago: 'mixto',
        generar_ticket_cambio: true,
        detalle: [
          { codigo_barra: '4626749461', cantidad: 10 }
        ],
        pago: { efectivo: 3000, tarjeta: 2000 }
      });

    // 2) Comprobar la respuesta del endpoint
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.data?.resumen?.codigo_cambio).toBeDefined();
    expect(res.body.data.resumen.total_venta).toBe(5000);
    expect(res.body.data.resumen.estado_pago).toBe('pagada');
    expect(res.body.data.resumen.detalle.length).toBe(1);

    // 3) Consultar la tabla resumen_ventas_dia
    const today = new Date().toISOString().slice(0, 10);
    const resumen = await AppDataSource.manager.findOne(ResumenVentasDia, {
      where: { fecha: today }
    });

    // 4) Validar que el resumen se creó/actualizó correctamente
    expect(resumen).not.toBeNull();
    expect(Number(resumen.total_ventas)).toBe(5000);
    expect(resumen.cantidad_ventas).toBe(1);
    expect(Number(resumen.total_efectivo)).toBe(3000);
    expect(Number(resumen.total_tarjeta)).toBe(2000);
    expect(Number(resumen.total_transferencia)).toBe(0);
    expect(Number(resumen.total_credito)).toBe(0);
    expect(Number(resumen.total_descuentos)).toBe(0);
    expect(resumen.total_prendas).toBe(10);
  });
});
