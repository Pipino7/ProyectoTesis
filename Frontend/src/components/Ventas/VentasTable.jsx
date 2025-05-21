import React from 'react';
import { FaCalendarAlt, FaShoppingCart, FaMoneyBillWave, FaUser, FaTags } from 'react-icons/fa';


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
};


const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const VentasTable = ({ ventas, pagination, onPageChange, onSelectVenta, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando ventas...</span>
      </div>
    );
  }

  if (!ventas || ventas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FaShoppingCart className="mx-auto text-gray-400 text-4xl mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No hay ventas para mostrar</h3>
        <p className="text-gray-500">No se encontraron ventas registradas para la fecha seleccionada.</p>
      </div>
    );
  }

  const getPaymentMethodIcon = (metodoPago) => {
    switch (metodoPago) {
      case 'efectivo':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Efectivo</span>;
      case 'tarjeta':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Tarjeta</span>;
      case 'transferencia':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">Transferencia</span>;
      case 'mixto':
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">Mixto</span>;
      case 'pendiente':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Pendiente</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{metodoPago}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método Pago
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prendas
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ventas.map((venta) => (
              <tr key={venta.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectVenta(venta)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    {formatDate(venta.fecha_venta)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{formatCurrency(venta.total_neto)}</span>
                    {venta.total_descuentos > 0 && (
                      <span className="text-xs text-red-500">
                        Desc: {formatCurrency(venta.total_descuentos)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {venta.estado_pago === 'pagada' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pagada
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  )}
                  {venta.saldo_pendiente > 0 && (
                    <div className="text-xs text-yellow-600 mt-1">
                      Falta: {formatCurrency(venta.saldo_pendiente)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaMoneyBillWave className="mr-2 text-gray-400" />
                    {getPaymentMethodIcon(venta.metodo_pago)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {venta.cliente ? (
                    <div className="flex items-center">
                      <FaUser className="mr-2 text-gray-400" />
                      <span>{venta.cliente.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Cliente de paso</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaTags className="mr-2 text-gray-400" />
                    <span>{venta.total_prendas}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVenta(venta);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
                </span>{' '}
                de <span className="font-medium">{pagination.total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Anterior
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Show pages around the current page
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else {
                    // Show current page in the middle when possible
                    const start = Math.max(1, pagination.currentPage - 2);
                    const end = Math.min(pagination.totalPages, start + 4);
                    pageNum = start + i;
                    if (pageNum > pagination.totalPages) return null;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      aria-current={pagination.currentPage === pageNum ? 'page' : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage >= pagination.totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasTable;