// src/components/Ventas/AnalisisVentasPorCategoria.jsx
import { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaChartBar, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaTable
} from 'react-icons/fa';
import useVentasPorCategoria from '../../hooks/useVentasPorCategoria';
import CategoriaResumenChart from './CategoriaResumenChart';
import CategoriasTable from './CategoriasTable';

const AnalisisVentasPorCategoria = () => {
  const [vistaActiva, setVistaActiva] = useState('grafico'); // grafico o tabla
  const [periodo, setPeriodo] = useState('mes');
  const [orderBy, setOrderBy] = useState('monto');
  const [orden, setOrden] = useState('desc');
  
  // Calcular fechas según el periodo seleccionado
  const fechaFin = new Date().toISOString().split('T')[0]; // hoy
  let fechaInicio;
    switch(periodo) {
    case 'mes': {
      // Primer día del mes actual
      fechaInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      break;
    }
    case 'trimestre': {
      // Hace 3 meses
      const tresMesesAtras = new Date();
      tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
      fechaInicio = tresMesesAtras.toISOString().split('T')[0];
      break;
    }
    case 'año': {
      // Primer día del año actual
      fechaInicio = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    }
    default: {
      fechaInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    }
  }
  
  const { categorias, loading, error } = useVentasPorCategoria({
    fechaInicio,
    fechaFin,
    orderBy,
    orden
  });

  const handleChangePeriodo = (e) => {
    setPeriodo(e.target.value);
  };

  const toggleOrden = () => {
    setOrden(orden === 'desc' ? 'asc' : 'desc');
  };

  const cambiarOrderBy = (campo) => {
    if (orderBy === campo) {
      toggleOrden();
    } else {
      setOrderBy(campo);
      setOrden('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Análisis de Ventas por Categoría</h2>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <select 
              value={periodo}
              onChange={handleChangePeriodo}
              className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mes">Este mes</option>
              <option value="trimestre">Último trimestre</option>
              <option value="año">Este año</option>
            </select>
          </div>
          
          <div className="flex gap-1">
            <button 
              className={`px-3 py-2 rounded-md flex items-center ${vistaActiva === 'grafico' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setVistaActiva('grafico')}
            >
              <FaChartBar className="mr-1" /> Gráfico
            </button>
            <button 
              className={`px-3 py-2 rounded-md flex items-center ${vistaActiva === 'tabla' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setVistaActiva('tabla')}
            >
              <FaTable className="mr-1" /> Tabla
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">Ordenar por:</span>
          <button
            onClick={() => cambiarOrderBy('monto')}
            className={`px-3 py-1 rounded-md flex items-center ${orderBy === 'monto' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
          >
            Monto
            {orderBy === 'monto' && (orden === 'desc' ? <FaSortAmountDown className="ml-1" /> : <FaSortAmountUp className="ml-1" />)}
          </button>
          <button
            onClick={() => cambiarOrderBy('cantidad')}
            className={`px-3 py-1 rounded-md flex items-center ml-2 ${orderBy === 'cantidad' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
          >
            Cantidad
            {orderBy === 'cantidad' && (orden === 'desc' ? <FaSortAmountDown className="ml-1" /> : <FaSortAmountUp className="ml-1" />)}
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {fechaInicio} - {fechaFin}
        </div>
      </div>
      
      {/* Mostrar gráfico o tabla según la vista activa */}
      {vistaActiva === 'grafico' ? (
        <CategoriaResumenChart categorias={categorias} />
      ) : (
        <CategoriasTable categorias={categorias} />
      )}
      
      {/* Siempre mostrar estadísticas generales */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Categorías</p>
            <p className="text-xl font-bold">{categorias.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Prendas</p>
            <p className="text-xl font-bold">
              {categorias.reduce((sum, cat) => sum + cat.cantidad, 0)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Categoría más vendida</p>
            <p className="text-xl font-bold">
              {categorias[0]?.nombre || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalisisVentasPorCategoria;
