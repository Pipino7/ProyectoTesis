import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import DetallesCajaModal from './DetallesCajaModal';

const ResumenCajasTable = ({ cajas = [] }) => {
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-CL', options);
  };

  // Función para formatear valores monetarios
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };
  
  // Función para calcular diferencia
  const calcularDiferencia = (monto_final_calculado, monto_final_declarado) => {
    const diferencia = (monto_final_declarado || 0) - (monto_final_calculado || 0);
    
    if (Math.abs(diferencia) < 1) return null; // Sin diferencia significativa
    
    const color = diferencia > 0 ? 'text-green-600' : 'text-red-600';
    const signo = diferencia > 0 ? '+' : '';
    
    return (
      <span className={color}>
        ({signo}{formatCurrency(diferencia)})
      </span>
    );
  };
  
  const handleFilaClick = (caja) => {
    setCajaSeleccionada(caja);
    setModalAbierto(true);
  };
  
  const cerrarModal = () => {
    setModalAbierto(false);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Apertura
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Cierre
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Inicial
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Final
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ventas
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prendas
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Observación
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalles
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cajas.length > 0 ? (
              cajas.map((caja) => (
                <tr key={caja.id} 
                    className="hover:bg-blue-50 transition-colors cursor-pointer" 
                    onClick={() => handleFilaClick(caja)}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(caja.fecha_apertura)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(caja.fecha_cierre)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    {formatCurrency(caja.monto_inicial)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatCurrency(caja.monto_final_declarado)}
                      </span>
                      {calcularDiferencia(caja.monto_final_calculado, caja.monto_final_declarado)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatCurrency(caja.total_ventas)} 
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {caja.total_prendas || '—'} 
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs text-sm text-gray-500 truncate">
                      {caja.cerrada_automaticamente && (
                        <div className="flex items-center mb-1 rounded bg-amber-50 text-amber-700 px-2 py-1 text-xs">
                          <FaExclamationTriangle className="mr-1" />
                          <span>Cierre automático</span>
                        </div>
                      )}
                      {caja.observacion || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilaClick(caja);
                      }} 
                      className="text-blue-600 hover:text-blue-800 focus:outline-none"
                      title="Ver detalles"
                    >
                      <FaSearch className="inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                  No hay registros de cajas cerradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal de detalles */}
      <DetallesCajaModal 
        isOpen={modalAbierto}
        onClose={cerrarModal}
        caja={cajaSeleccionada}
      />
    </>
  );
};

ResumenCajasTable.propTypes = {
  cajas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fecha_apertura: PropTypes.string,
      fecha_cierre: PropTypes.string,
      monto_inicial: PropTypes.number,
      monto_final_calculado: PropTypes.number,
      monto_final_declarado: PropTypes.number,
      total_ventas: PropTypes.number,
      total_prendas: PropTypes.number,
      cerrada_automaticamente: PropTypes.bool,
      observacion: PropTypes.string
    })
  ).isRequired
};

export default ResumenCajasTable;