import { Cupon } from '../entities/index.js';

const CuponHelper = {
  validarYAplicarCupon: async ({ cuponCodigo, prendas, manager }) => {
    console.log('🎟️ Validando cupón:', cuponCodigo);

    const cupon = await manager.findOne(Cupon, {
      where: { codigo: cuponCodigo, activo: true },
      relations: ['categoria'],
    });
    if (!cupon) throw new Error('Cupón no válido o inactivo');

    const ahora = new Date();
    if (cupon.fecha_inicio && ahora < new Date(cupon.fecha_inicio)) {
      throw new Error('El cupón aún no está activo');
    }
    if (cupon.fecha_expiracion && ahora > new Date(cupon.fecha_expiracion)) {
      throw new Error('El cupón ha expirado');
    }

    let prendasObjetivo = cupon.categoria
      ? prendas.filter(p => p.categoria?.id === cupon.categoria.id)
      : prendas;

    if (prendasObjetivo.length === 0) {
      throw new Error('El cupón no aplica a ninguna prenda en esta venta');
    }

    let resultado = [];
    let descuentoTotal = 0;

    switch (cupon.tipo) {
      case 'porcentaje':
        resultado = prendasObjetivo.map(p => {
          const descuento = Math.round(p.precio * p.cantidad * (cupon.valor / 100));
          descuentoTotal += descuento;
          return { ...p, descuento };
        });
        break;

      case 'monto_fijo':
        const totalVenta = prendasObjetivo.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
        resultado = prendasObjetivo.map(p => {
          const proporcion = (p.precio * p.cantidad) / totalVenta;
          const descuento = Math.round(cupon.valor * proporcion);
          descuentoTotal += descuento;
          return { ...p, descuento };
        });
        break;

      case '2x1': {
        const unidades = [];
        prendasObjetivo.forEach(p => {
          for (let i = 0; i < p.cantidad; i++) {
            unidades.push({ ...p, cantidad: 1 });
          }
        });
        if (unidades.length < 2) {
          throw new Error('Se requieren al menos dos unidades para aplicar el cupón 2×1');
        }

        unidades.sort((a, b) => a.precio - b.precio);
        const freeCount = Math.floor(unidades.length / 2);
        unidades.forEach((u, i) => {
          u.descuento = i < freeCount ? u.precio : 0;
          descuentoTotal += u.descuento;
        });


        const agrupado = {};
        unidades.forEach(u => {
          const key = u.codigo_barra;
          if (!agrupado[key]) {
            agrupado[key] = { ...u, cantidad: 0, descuento: 0 };
          }
          agrupado[key].cantidad += 1;
          agrupado[key].descuento += u.descuento;
        });
        resultado = Object.values(agrupado);
        break;
      }

      case 'descuento_categoria':
        resultado = prendasObjetivo.map(p => {
          const descuento = Math.round(p.precio * p.cantidad * (cupon.valor / 100));
          descuentoTotal += descuento;
          return { ...p, descuento };
        });
        break;

      default:
        throw new Error('Tipo de cupón no soportado');
    }

    return {
      cupon,
      descuentoTotal,
      items: resultado
    };
  }
};

export default CuponHelper;
