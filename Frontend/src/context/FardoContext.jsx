import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import fardoService from '@/services/fardos';
import clasificacionService from '@/services/clasificacionService';

const ContextoInterno = createContext();

// Hook para acceder al contexto
export const useFardoContext = () => useContext(ContextoInterno);

const FardoProvider = ({ children }) => {
  const [fardos, setFardos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [prendasClasificadasMap, setPrendasClasificadasMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    codigo: '',
    fechaInicio: '',
    fechaFin: '',
    proveedor: '',
    precio: [0, 1000000],
    orden: '',
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const cargarFardos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fardoService.obtenerFardos({
        page: pagina,
        limit: 15,
        ...filtros,
        codigoFardo: filtros.codigo,
        precioMin: filtros.precio[0],
        precioMax: filtros.precio[1],
      });

      setFardos(data.fardos || []);
      setTotalPaginas(data.totalPages || 1);

      const map = {};
      await Promise.all(
        data.fardos.map(async (fardo) => {
          try {
            const resumen = await clasificacionService.obtenerResumenClasificacion(fardo.codigo_fardo);
            map[fardo.codigo_fardo] = resumen?.totalClasificadas || 0;
          } catch {
            map[fardo.codigo_fardo] = 0;
          }
        })
      );
      setPrendasClasificadasMap(map);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  }, [pagina, filtros]); // ✅ React puede comparar objetos si usás bien los keys

  // Se ejecuta cuando cambian filtros o la página
  useEffect(() => {
    const delay = setTimeout(() => {
      cargarFardos();
    }, 300); // debounce de 300ms

    return () => clearTimeout(delay); // limpia el timeout si cambia antes
  }, [cargarFardos]);

  return (
    <ContextoInterno.Provider
      value={{
        fardos,
        pagina,
        totalPaginas,
        isLoading,
        error,
        prendasClasificadasMap,
        setPagina,
        cargarFardos,
        filtros,
        setFiltros,
        mostrarFiltros,
        setMostrarFiltros,
      }}
    >
      {children}
    </ContextoInterno.Provider>
  );
};

const FardoContext = {
  Provider: FardoProvider,
  useFardoContext,
};

export default FardoContext;
