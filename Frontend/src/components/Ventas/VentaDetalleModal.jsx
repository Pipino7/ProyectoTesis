import React from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaUser, FaTags, FaTicketAlt, FaTimes, FaShoppingCart } from 'react-icons/fa';

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

const VentaDetalleModal = ({ venta, onClose }) => {
  if (!venta) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaShoppingCart className="mr-2" /> Detalles de Venta #{venta.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Summary section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left column - Basic info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Información General</h3>
              
              <div className="flex items-center text-gray-600">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                <div>
                  <span className="text-sm">Fecha:</span>
                  <p>{formatDate(venta.fecha_venta)}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <FaMoneyBillWave className="mr-2 text-gray-400" />
                <div>
                  <span className="text-sm">Método de Pago:</span>
                  <p className="capitalize">{venta.metodo_pago}</p>
                </div>
              </div>
              
              {venta.tiene_cupon && (
                <div className="flex items-center text-gray-600">
                  <FaTicketAlt className="mr-2 text-purple-400" />
                  <div>
                    <span className="text-sm">Cupón Aplicado:</span>
                    <p>{venta.cupon?.codigo || 'Cupón aplicado'}</p>
                    <p className="text-purple-600 text-sm">
                      Descuento: {formatCurrency(venta.descuento_cupon)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Middle column - Client info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Cliente</h3>
              
              {venta.cliente ? (
                <div className="flex items-start text-gray-600">
                  <FaUser className="mr-2 mt-1 text-gray-400" />
                  <div>
                    <p className="font-medium">{venta.cliente.nombre}</p>
                    <p className="text-sm">{venta.cliente.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <FaUser className="mr-2 text-gray-400" />
                  <span>Cliente de paso</span>
                </div>
              )}
              
              <div className="flex items-start text-gray-600 mt-2">
                <FaTags className="mr-2 mt-1 text-gray-400" />
                <div>
                  <span className="text-sm">Total Prendas:</span>
                  <p>{venta.total_prendas}</p>
                </div>
              </div>
            </div>

            {/* Right column - Payment info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Resumen de Pago</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(venta.total_bruto)}</span>
                </div>
                
                {venta.total_descuentos > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Descuento Total:</span>
                    <span>-{formatCurrency(venta.total_descuentos)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-800 font-semibold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(venta.total_neto)}</span>
                </div>
                
                {venta.saldo_pendiente > 0 && (
                  <div className="flex justify-between text-yellow-600 mt-2">
                    <span>Saldo Pendiente:</span>
                    <span>{formatCurrency(venta.saldo_pendiente)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                  {venta.tipo_venta === 'credito' ? 'Venta a Crédito' : 'Venta Directa'}
                </div>
                
                <div className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  venta.estado_pago === 'pagada' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {venta.estado_pago === 'pagada' ? 'Pagada' : 'Pendiente'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed items section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Prendas</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código de Barra
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descuento
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {venta.prendas.map((prenda) => (
                    <tr key={prenda.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {prenda.codigo_barra}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {prenda.categoria}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(prenda.precio_unitario)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                        {prenda.cantidad}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500 text-right">
                        {prenda.descuento > 0 ? `-${formatCurrency(prenda.descuento)}` : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(prenda.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment methods detail if it's a mixed payment */}
          {venta.metodo_pago === 'mixto' && venta.metodos_detallados && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles de Pago Mixto</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  {Object.entries(venta.metodos_detallados)
                    .filter(([_, monto]) => monto > 0)
                    .map(([metodo, monto]) => (
                    <div key={metodo} className="flex justify-between text-gray-700">
                      <span className="capitalize">{metodo}:</span>
                      <span>{formatCurrency(monto)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VentaDetalleModal;