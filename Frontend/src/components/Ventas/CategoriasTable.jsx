// src/components/Ventas/CategoriasTable.jsx
import PropTypes from 'prop-types';
import { FaTshirt, FaMoneyBillWave, FaPercentage } from 'react-icons/fa';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount || 0);
};

const CategoriasTable = ({ categorias = [] }) => {
  if (!categorias || categorias.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm flex items-center justify-center h-60">
        <p className="text-gray-500">No hay datos de categorías disponibles</p>
      </div>
    );
  }
  
  // Ordenar por monto vendido (descendente)
  const sortedCategorias = [...categorias].sort((a, b) => b.monto - a.monto);
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle por Categorías</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaTshirt className="mr-1" /> 
                    Cantidad
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaMoneyBillWave className="mr-1" /> 
                    Monto
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FaPercentage className="mr-1" /> 
                    % del Total
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCategorias.map((categoria, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {categoria.nombre}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {categoria.cantidad}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(categoria.monto)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-2">{categoria.porcentaje}%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${categoria.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

CategoriasTable.propTypes = {
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      nombre: PropTypes.string,
      monto: PropTypes.number,
      cantidad: PropTypes.number,
      porcentaje: PropTypes.number
    })
  )
};

export default CategoriasTable;
