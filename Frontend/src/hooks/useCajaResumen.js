import { useState, useEffect, useCallback } from 'react';
import cajaService from '@/services/CajaServices.js';

export function useCajaResumen() {
  const initialResumen = {
    caja: {
      fecha_apertura: null,
      monto_inicial: 0
    },
    totales: {
      ventas: 0,
      totalPrendas: 0,
      prendasDevueltas: 0,
      devolucionesRealizadas: 0,
      cobrosPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
      gastosPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
      reembolsosPorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0 },
      balancePorMetodo: { efectivo: 0, tarjeta: 0, transferencia: 0, total: 0 },
      ventasConCupon: 0,
      ventasConTicketCambio: 0,
      totalDescuentos: 0,
      saldo_calculado: 0,
      balanceFinal: { efectivo: 0, tarjeta: 0, transferencia: 0, total: 0 }
    },
    movimientos: []
  };

  const [resumen, setResumen] = useState(initialResumen);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cajaService.obtenerResumenCaja();
      setResumen(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar resumen de caja:', err);
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  return { resumen, loading, error, refreshResumen: fetchResumen };
}

export default useCajaResumen;
