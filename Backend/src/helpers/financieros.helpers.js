const calcularTotalPagado = (pagos = {}) => {
  if (!pagos || typeof pagos !== 'object') return 0;
  return Object.values(pagos).reduce((total, monto) => total + (Number(monto) || 0), 0);
};

const calcularSaldoPendiente = (totalVenta, totalPagado) => {
  return Number(totalVenta) - Number(totalPagado);
};

const calcularBalanceFinal = (
  montoInicial = 0,
  totalIngresos = {},
  totalGastos = {},
  totalReembolsos = {}
) => {
  const metodosPago = ['efectivo', 'tarjeta', 'transferencia'];
  const balance = {};
  
  metodosPago.forEach(metodo => {
    const ingresos = Number(totalIngresos?.[metodo] || 0);
    const gastos = Number(totalGastos?.[metodo] || 0);
    const reembolsos = Number(totalReembolsos?.[metodo] || 0);
    
    const inicial = metodo === 'efectivo' ? Number(montoInicial || 0) : 0;
    
    balance[metodo] = inicial + ingresos - gastos - reembolsos;
  });
  
  balance.total = Object.values(balance).reduce((total, monto) => total + monto, 0);
  
  return balance;
};

const calcularMontoBruto = (items = []) => {
  return items.reduce((total, item) => {
    const cantidad = Number(item.cantidad || 1);
    const precio = Number(item.costo_unitario_venta || item.precio || 0);
    return total + (cantidad * precio);
  }, 0);
};

const calcularDescuentos = (items = []) => {
  return items.reduce((total, item) => {
    return total + Number(item.descuento || 0);
  }, 0);
};

const calcularMontoNeto = (montoBruto, descuentoTotal = 0) => {
  return Math.max(0, Number(montoBruto) - Number(descuentoTotal));
};

const calcularTotalesVenta = (bruto, descuentoTotal = 0, items = []) => {
  const descuentoItems = items.reduce((total, item) => {
    return total + (Number(item.descuento || 0));
  }, 0);
  
  const neto = bruto - descuentoTotal - descuentoItems;
  
  return {
    bruto,
    descuentoTotal,
    descuentoItems,
    totalDescuentos: descuentoTotal + descuentoItems,
    neto
  };
};

const calcularTotalesCaja = (caja, ventas = [], cobros = [], gastos = []) => {
  const totalVentas = ventas.reduce((total, venta) => total + Number(venta.total_venta || 0), 0);
  
  const totalPrendas = ventas.reduce((total, venta) => {
    if (!venta.detallesVenta || !Array.isArray(venta.detallesVenta)) {
      return total;
    }
    
    const prendasEnVenta = venta.detallesVenta.reduce(
      (sum, detalle) => sum + Number(detalle?.cantidad || 0), 
      0
    );
    
    return total + prendasEnVenta;
  }, 0);
  
  const fechaAperturaCaja = new Date(caja.fecha_apertura);
  fechaAperturaCaja.setHours(0, 0, 0, 0);
  
  const cobrosDelDiaPorMetodo = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };
  
  const cobrosPendientesPorMetodo = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };
  
  cobros.forEach(cobro => {
    const metodo = cobro.metodoPago?.nombre_metodo;
    if (!metodo || cobrosDelDiaPorMetodo[metodo] === undefined) return;
    
    const monto = Number(cobro.monto || 0);
    
    if (cobro.venta?.fecha_venta) {
      const fechaVenta = new Date(cobro.venta.fecha_venta);
      fechaVenta.setHours(0, 0, 0, 0);
      
      if (fechaVenta.getTime() === fechaAperturaCaja.getTime()) {
        cobrosDelDiaPorMetodo[metodo] += monto;
      } else if (fechaVenta.getTime() < fechaAperturaCaja.getTime()) {
        cobrosPendientesPorMetodo[metodo] += monto;
      } else {
        cobrosDelDiaPorMetodo[metodo] += monto;
      }
    } else {
      cobrosDelDiaPorMetodo[metodo] += monto;
    }
  });
  
  const totalCobrosDelDia = Object.values(cobrosDelDiaPorMetodo).reduce((sum, monto) => sum + monto, 0);
  const totalCobrosPendientes = Object.values(cobrosPendientesPorMetodo).reduce((sum, monto) => sum + monto, 0);
  
  const cobrosPorMetodo = {
    efectivo: cobrosDelDiaPorMetodo.efectivo + cobrosPendientesPorMetodo.efectivo,
    tarjeta: cobrosDelDiaPorMetodo.tarjeta + cobrosPendientesPorMetodo.tarjeta,
    transferencia: cobrosDelDiaPorMetodo.transferencia + cobrosPendientesPorMetodo.transferencia
  };
  
  const totalCobros = totalCobrosDelDia + totalCobrosPendientes;
  
  const gastosPorMetodo = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };
  
  gastos.forEach(gasto => {
    const metodo = gasto.metodo_pago?.nombre_metodo;
    if (metodo && gastosPorMetodo[metodo] !== undefined) {
      gastosPorMetodo[metodo] += Number(gasto.monto || 0);
    }
  });
  
  const totalGastos = Object.values(gastosPorMetodo).reduce((sum, monto) => sum + monto, 0);
  
  const montoInicial = Number(caja.monto_inicial || 0);
  const balancePorMetodo = calcularBalanceFinal(
    montoInicial, 
    cobrosPorMetodo, 
    gastosPorMetodo
  );
  
  const balanceEfectivo = montoInicial + cobrosPorMetodo.efectivo - gastosPorMetodo.efectivo;
  
  if (balancePorMetodo.efectivo !== balanceEfectivo) {
    console.warn('Discrepancia detectada en cálculo de efectivo. Corrigiendo...');
    balancePorMetodo.efectivo = balanceEfectivo;
    balancePorMetodo.total = Object.values(balancePorMetodo).reduce(
      (sum, val, index) => index < Object.values(balancePorMetodo).length - 1 ? sum + val : sum, 
      0
    );
  }
  
  return {
    totalVentas,
    totalPrendas,
    totalCobros,
    totalCobrosDelDia,
    totalCobrosPendientes,
    cobrosPorMetodo,
    cobrosDelDiaPorMetodo,
    cobrosPendientesPorMetodo,
    gastosPorMetodo,
    balancePorMetodo,
    balanceFinal: balancePorMetodo
  };
};

const calcularResumenDiario = (fecha, datos) => {
  const {
    ventas = [],
    ventasPagadas = 0,
    totalPrendas = 0,
    pagosRecibidos = {},
    reembolsos = {},
    gastosPorMetodo = {},
    totalGastos = 0,
    montoInicial = 0,
    ventasPorCategoria = [],
    devolucionesRealizadas = 0,
    prendasDevueltas = 0,
    cambios = 0,
    totalDescuentos = 0,
  } = datos;

  const totalNeto = ventas.reduce((sum, v) => sum + Number(v.total_venta), 0);
  
  const cuponesUsados = ventas.filter(v => v.cupon).length;
  
  const ticketsCambioGenerados = ventas.filter(v => v.codigo_cambio).length;
  
  const balanceFinal = calcularBalanceFinal(montoInicial, pagosRecibidos, gastosPorMetodo, reembolsos);
  
  return {
    fecha,
    fechaFormateada: fecha.toLocaleDateString('es-CL'),
    ventasTotales: ventas.length,
    ventasPagadas,
    totalPrendas,
    total_neto: totalNeto,
    total_descuentos: totalDescuentos,
    pagos_recibidos: pagosRecibidos,
    reembolsos,
    balance_final: balanceFinal,
    ventas_por_categoria: ventasPorCategoria,
    cupones_usados: cuponesUsados,
    tickets_cambio_generados: ticketsCambioGenerados,
    devoluciones_realizadas: devolucionesRealizadas,
    prendas_devueltas: prendasDevueltas,
    cambios_realizados: cambios,
    gastos_por_metodo: gastosPorMetodo,
    total_gastos: totalGastos
  };
};

const calcularPrecioUnitario = (costoTotal, cantidad) => {
  if (!cantidad || cantidad <= 0) return 0;
  return parseFloat((Number(costoTotal) / Number(cantidad)).toFixed(2));
};

const calcularDescuentoAplicable = (precio, reglas = {}) => {
  const { 
    porcentaje = 0, 
    montoFijo = null, 
    montoMinimo = 0, 
    montoMaximo = Infinity 
  } = reglas;
  
  if (montoFijo !== null) {
    return Math.min(Number(montoFijo), Number(precio));
  }
  
  const descuento = Number(precio) * (Number(porcentaje) / 100);
  
  return Math.max(
    Math.min(descuento, montoMaximo),
    montoMinimo
  );
};

const calcularImpuestos = (montoNeto, tasaImpuesto = 0.19) => {
  const montoImpuesto = Number(montoNeto) * Number(tasaImpuesto);
  const montoTotal = Number(montoNeto) + montoImpuesto;
  
  return {
    neto: montoNeto,
    impuesto: montoImpuesto,
    total: montoTotal,
    tasaAplicada: tasaImpuesto
  };
};

const verificarMontoMinimo = (monto, configuracion = {}, metodo = 'efectivo') => {
  const montosMinimos = configuracion.montosMinimos || {
    efectivo: 0,
    tarjeta: 1000,
    transferencia: 0
  };
  
  const minimo = montosMinimos[metodo] || 0;
  return Number(monto) >= minimo;
};
const detectarMetodoPago = (pagos = {}) => {
  const efectivo      = Number(pagos.efectivo      || 0);
  const tarjeta       = Number(pagos.tarjeta       || 0);
  const transferencia = Number(pagos.transferencia || 0);

  const metodos = [
    ...(efectivo      > 0 ? ['efectivo']     : []),
    ...(tarjeta       > 0 ? ['tarjeta']      : []),
    ...(transferencia > 0 ? ['transferencia']: [])
  ];

  if (metodos.length === 0) return 'pendiente';
  if (metodos.length === 1) return metodos[0];
  return 'mixto';
};

const calcularTotalesCajaCompletos = (caja, ventas = [], cobros = [], gastos = [], reembolsos = []) => {
  if (isNaN(Number(caja?.monto_inicial))) {
    console.warn(`⚠️ monto_inicial inválido en calcularTotalesCajaCompletos:`, caja?.monto_inicial);
  }
  
  ventas.forEach((venta, ventaIndex) => {
    venta.detallesVenta?.forEach((detalle, detalleIndex) => {
      if (isNaN(Number(detalle.cantidad))) {
        console.warn(`⚠️ Cantidad inválida en detalle de venta (Venta ID: ${venta.id || ventaIndex}, Detalle Index: ${detalleIndex}):`, detalle);
      }
    });
  });
  
  const montoInicial = Number(caja?.monto_inicial || 0);
  
  const totalVentas = ventas.reduce((total, venta) => total + Number(venta.total_venta || 0), 0);
  
  const totalPrendas = ventas.reduce((total, venta) => {
    const prendasEnVenta = venta.detallesVenta?.reduce(
      (sum, detalle) => sum + Number(detalle.cantidad || 0), 
      0
    ) || 0;
    return total + prendasEnVenta;
  }, 0);
  
  const cobrosPorMetodo = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };
  
  const reembolsosPorMetodo = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };
  
  cobros.forEach(cobro => {
    const metodo = cobro.metodoPago?.nombre_metodo;
    if (metodo && cobrosPorMetodo[metodo] !== undefined) {
      cobrosPorMetodo[metodo] += Number(cobro.monto || 0);
    } else if (metodo) {
      console.warn(`⚠️ Método de cobro no reconocido: ${metodo}`);
    } else {
      console.warn(`⚠️ Cobro sin método de pago definido:`, cobro);
    }
  });
  
  reembolsos.forEach(reembolso => {
    const metodo = reembolso.metodoPago?.nombre_metodo;
    if (metodo && reembolsosPorMetodo[metodo] !== undefined) {
      reembolsosPorMetodo[metodo] += Math.abs(Number(reembolso.monto || 0));
    }
  });
  
  const totalCobros = Object.values(cobrosPorMetodo).reduce((sum, monto) => sum + monto, 0);
  
  const totalReembolsos = Object.values(reembolsosPorMetodo).reduce((sum, monto) => sum + monto, 0);
  
  const metodosEsperados = ['efectivo', 'tarjeta', 'transferencia'];
  
  Object.keys(cobrosPorMetodo).forEach(metodo => {
    if (!metodosEsperados.includes(metodo)) {
      console.warn(`⚠️ Método de cobro inesperado: ${metodo}`);
    }
  });
  
  const gastosPorMetodo = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };
  
  gastos.forEach(gasto => {
    const metodo = gasto.metodo_pago?.nombre_metodo || 'efectivo';
    if (gastosPorMetodo[metodo] !== undefined) {
      gastosPorMetodo[metodo] += Number(gasto.monto || 0);
    } else {
      console.warn(`⚠️ Método de gasto no reconocido: ${metodo}`);
    }
  });
  
  Object.keys(gastosPorMetodo).forEach(metodo => {
    if (!metodosEsperados.includes(metodo)) {
      console.warn(`⚠️ Método de gasto inesperado: ${metodo}`);
    }
  });
  
  const totalGastos = Object.values(gastosPorMetodo).reduce((sum, monto) => sum + monto, 0);
  
  const ventasConCupon = ventas.filter(v => v.cupon).length;
  
  const ventasConTicketCambio = ventas.filter(v => v.codigo_cambio).length;
  
  const totalDescuentos = ventas.reduce((total, venta) => {
    const descuentosDetalle = venta.detallesVenta?.reduce(
      (sum, detalle) => {
        const descuentoDetalle = Number(detalle.descuento || 0);
        
        if (isNaN(descuentoDetalle)) {
          console.warn(`⚠️ Descuento inválido en detalle de venta (Venta ID: ${venta.id}):`, detalle.descuento);
          return sum;
        }
        
        return sum + descuentoDetalle;
      },
      0
    ) || 0;
    
    const descuentoCupon = venta.descuento_cupon || 0;
    
    if (isNaN(Number(descuentoCupon))) {
      console.warn(`⚠️ Descuento por cupón inválido (Venta ID: ${venta.id}):`, descuentoCupon);
    }
    
    return total + descuentosDetalle + Number(descuentoCupon || 0);
  }, 0);
  
  const balancePorMetodo = calcularBalanceFinal(
    montoInicial, 
    cobrosPorMetodo, 
    gastosPorMetodo,
    reembolsosPorMetodo
  );
  
  console.log(`💰 Resumen financiero:
    - Ingresos por método: ${JSON.stringify(cobrosPorMetodo)}
    - Reembolsos por método: ${JSON.stringify(reembolsosPorMetodo)}
    - Gastos por método: ${JSON.stringify(gastosPorMetodo)}
    - Balance final por método: ${JSON.stringify(balancePorMetodo)}`);
  
  return {
    montoInicial,
    totalVentas,
    totalCobros,
    totalGastos,
    totalReembolsos,
    totalPrendas,
    cobrosPorMetodo,
    gastosPorMetodo,
    reembolsosPorMetodo,
    balancePorMetodo,
    balanceFinal: balancePorMetodo,
    ventasConCupon,
    ventasConTicketCambio,
    totalDescuentos
  };
}

export default {
  calcularTotalPagado,
  calcularSaldoPendiente,
  calcularBalanceFinal,
  calcularTotalesVenta,
  calcularTotalesCaja,
  calcularResumenDiario,
  calcularPrecioUnitario,
  calcularDescuentoAplicable,
  calcularImpuestos,
  verificarMontoMinimo,
  calcularMontoBruto,
  calcularDescuentos,
  calcularMontoNeto,
  calcularTotalesCajaCompletos,
  detectarMetodoPago
};