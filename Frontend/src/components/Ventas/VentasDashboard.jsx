import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  FaChartBar, 
  FaTshirt,
  FaMoneyBillWave, 
  FaPercentage,
  FaCalendarAlt
} from 'react-icons/fa';
import ventaService from '../../services/venta.services';
import CategoriaResumenChart from './CategoriaResumenChart';
import CategoriasTable from './CategoriasTable';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount || 0);
};

const StatCard = ({ title, value, icon, color }) => {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    amber: 'bg-amber-50'
  };
  
  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600'
  };

  return (
    <div className={`${bgColors[color]} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconColors[color]} bg-white bg-opacity-60`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'amber']).isRequired
};

const VentasDashboard = () => {
  const [periodo, setPeriodo] = useState('mes'); // mes, trimestre, año
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    useEffect(() => {
    const fetchResumen = async () => {
      setLoading(true);
      try {
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
        }        const resumenData = await ventaService.obtenerResumenPorRango(fechaInicio, fechaFin);

        const categoriasData = await ventaService.obtenerEstadisticasPorCategoria(
          fechaInicio, 
          fechaFin, 
          'monto', 
          'desc'
        );
          const totalCategorias = categoriasData.reduce((sum, cat) => sum + Number(cat.cantidad), 0);
        
        const categoriasConPorcentaje = categoriasData.map(cat => ({
          nombre: cat.nombre,
          cantidad: Number(cat.cantidad),
          monto: Number(cat.monto),
          porcentaje: Math.round((Number(cat.cantidad) / totalCategorias) * 100) || 0
        }));
        
        const hoy = new Date();
        const inicio = new Date(fechaInicio);
        const difMs = hoy - inicio;
        const difDias = Math.max(1, Math.ceil(difMs / (1000 * 60 * 60 * 24)));        const promedioDiario = resumenData.total_ventas / difDias;
        
        setResumen({
          totalVentas: Number(resumenData.total_ventas) || 0,
          ventasContado: Number(resumenData.total_efectivo) + 
                         Number(resumenData.total_tarjeta) + 
                         Number(resumenData.total_transferencia) || 0,
          ventasCredito: Number(resumenData.total_credito) || 0,
          totalPrendas: Number(resumenData.total_prendas) || 0,
          totalDescuentos: Number(resumenData.total_descuentos) || 0,
          promedioDiario: promedioDiario || 0,
          categoriasMasVendidas: categoriasConPorcentaje.slice(0, 5) // Top 5 categorías
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el resumen:', err);
        setError('No se pudo cargar el resumen de ventas');
        setLoading(false);
      }
    };
    
    fetchResumen();
  }, [periodo]);
  
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Dashboard de Ventas</h2>
        
        <div className="flex items-center">
          <FaCalendarAlt className="mr-2 text-gray-400" />
          <select 
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mes">Este mes</option>
            <option value="trimestre">Último trimestre</option>
            <option value="año">Este año</option>
          </select>
        </div>
      </div>
      
      {/* Cards estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Ventas" 
          value={formatCurrency(resumen.totalVentas)} 
          icon={<FaMoneyBillWave size={24} />}
          color="blue"
        />
        <StatCard 
          title="Total Prendas" 
          value={resumen.totalPrendas} 
          icon={<FaTshirt size={24} />}
          color="green"
        />
        <StatCard 
          title="Venta promedio diaria" 
          value={formatCurrency(resumen.promedioDiario)} 
          icon={<FaChartBar size={24} />}
          color="purple"
        />
        <StatCard 
          title="Total Descuentos" 
          value={formatCurrency(resumen.totalDescuentos)} 
          icon={<FaPercentage size={24} />}
          color="amber"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de ventas */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de ventas</h3>
          
          <div className="flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-8 border-blue-500 relative flex justify-center items-center">
              <div className="w-32 h-32 rounded-full bg-green-500 flex justify-center items-center">
                <div className="text-white text-center">
                  <p className="text-sm">Total</p>
                  <p className="font-bold">{formatCurrency(resumen.totalVentas)}</p>
                </div>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 rounded-full">
                <span className="text-xs text-blue-600 font-medium">Crédito</span>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white px-2 rounded-full">
                <span className="text-xs text-green-600 font-medium">Contado</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-6 text-center">
            <div>
              <p className="text-sm text-gray-500">Contado</p>
              <p className="font-semibold text-gray-800">{formatCurrency(resumen.ventasContado)}</p>
              <p className="text-xs text-gray-500">
                {Math.round((resumen.ventasContado / resumen.totalVentas) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Crédito</p>
              <p className="font-semibold text-gray-800">{formatCurrency(resumen.ventasCredito)}</p>
              <p className="text-xs text-gray-500">
                {Math.round((resumen.ventasCredito / resumen.totalVentas) * 100)}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Categorías más vendidas - Reemplazado por el nuevo componente */}
        <CategoriaResumenChart categorias={resumen.categoriasMasVendidas} />
      </div>
      
      {/* Tabla detallada de categorías */}
      <CategoriasTable categorias={resumen.categoriasMasVendidas} />
    </div>
  );
};

export default VentasDashboard;