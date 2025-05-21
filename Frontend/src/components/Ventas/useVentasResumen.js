import { useState, useCallback, useEffect } from 'react';
import axios from '../../services/api'; 

export default function useVentasResumen({ 
  fecha = new Date().toISOString().split('T')[0], 
  page = 1, 
  limit = 50 
} = {}) {
  const [resumen, setResumen] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: page,
    totalPages: 1,
    total: 0,
    limit
  });

  const fetchVentas = useCallback(async (params = {}) => {
    const queryParams = new URLSearchParams({
      fecha: params.fecha || fecha,
      page: params.page || pagination.currentPage,
      limit: params.limit || pagination.limit
    });

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Consultando ventas para fecha: ${queryParams.get('fecha')}, página: ${queryParams.get('page')}`);
      const response = await axios.get(`/ventas/resumen-diario?${queryParams.toString()}`);
      
      // Check if API response contains the expected data structure
      if (!response.data || !response.data.data) {
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }

      const { resumen, ventas, pagination: paginationData } = response.data.data;
      
      setResumen(resumen);
      setVentas(ventas);
      setPagination({
        currentPage: parseInt(paginationData.page) || 1,
        totalPages: parseInt(paginationData.pages) || 1,
        total: parseInt(paginationData.total) || 0,
        limit: parseInt(paginationData.limit) || 50
      });
      console.log(`✅ Recibidas ${ventas.length} ventas de un total de ${paginationData.total}`);
    } catch (err) {
      console.error('❌ Error al obtener resumen de ventas:', err);
      setError(err.message || 'Hubo un error al obtener las ventas');
    } finally {
      setLoading(false);
    }
  }, [fecha, pagination.currentPage, pagination.limit]);


  useEffect(() => {
    fetchVentas({ fecha, page, limit });
  }, [fecha, page, limit]);


  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchVentas({ page: newPage });
    }
  };


  const changeDate = (newDate) => {
    fetchVentas({ fecha: newDate, page: 1 }); 
  };

  return {
    resumen,
    ventas, 
    loading,
    error,
    pagination,
    goToPage,
    changeDate,
    refresh: fetchVentas
  };
}