import { useState, useEffect, useCallback } from 'react';
import { cajaService } from '@/services';

const useResumenCajas = () => {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCajas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await cajaService.obtenerHistoricoCajas();
      
      if (response.error) {
        setError(response.mensaje || 'Error al obtener el historial de cajas');
        if (response.usuarioInvalido) {
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          
          // Redirigir al login
          window.location.href = '/login';
        }
        return;
      }
      
      setCajas(response.data || []);
    } catch (error) {
      console.error('Error al cargar el historial de cajas:', error);
      setError('No se pudo cargar el historial de cajas: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCajas();
  }, [fetchCajas]);

  return { cajas, loading, error, refresh: fetchCajas };
};

export default useResumenCajas;