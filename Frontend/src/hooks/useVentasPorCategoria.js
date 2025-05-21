// src/hooks/useVentasPorCategoria.js
import { useState, useEffect } from 'react';
import ventaService from '../services/venta.services';


const useVentasPorCategoria = ({ 
  fechaInicio, 
  fechaFin, 
  orderBy = 'monto', 
  orden = 'desc' 
}) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      if (!fechaInicio || !fechaFin) return;

      setLoading(true);
      try {
        const data = await ventaService.obtenerEstadisticasPorCategoria(
          fechaInicio, 
          fechaFin,
          orderBy,
          orden
        );
        const totalItems = data.reduce((sum, cat) => sum + Number(cat.cantidad), 0);
        const totalVentas = data.reduce((sum, cat) => sum + Number(cat.monto), 0);
        
        const categoriasConPorcentaje = data.map(cat => ({
          ...cat,
          cantidad: Number(cat.cantidad),
          monto: Number(cat.monto),
          porcentajeCantidad: Math.round((Number(cat.cantidad) / totalItems) * 100) || 0,
          porcentajeMonto: Math.round((Number(cat.monto) / totalVentas) * 100) || 0,
          // Usamos el porcentaje de cantidad como el porcentaje general
          porcentaje: Math.round((Number(cat.cantidad) / totalItems) * 100) || 0
        }));
        
        setCategorias(categoriasConPorcentaje);
      } catch (err) {
        console.error('Error al obtener estadísticas por categoría:', err);
        setError('No se pudieron cargar las estadísticas por categoría');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategorias();
  }, [fechaInicio, fechaFin, orderBy, orden]);

  return { categorias, loading, error };
};

export default useVentasPorCategoria;
