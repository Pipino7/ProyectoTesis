// src/components/Pos/PosVenta/ResumenCaja/ResumenDiarioModal.jsx
import React, { useEffect } from 'react';
import Modal from 'react-modal';
import {
  FaTimes,
  FaChartLine,
  FaClock,
  FaWallet,
  FaTicketAlt,
  FaTshirt,
  FaPercentage,
  FaCalendarDay,
  FaHistory,
} from 'react-icons/fa';
import useCajaResumen from '@/hooks/useCajaResumen';

import StatCard from './StatCard';
import IngresosSection from './IngresosSection';
import GastosSection from './GastosSection';
import EstadisticasSection from './EstadisticasSection';
import ReembolsosSection from './ReembolsosSection';
import CambiosDevolucionesSection from './CambiosDevolucionesSection';
import BalanceSection from './BalanceSection';

const ResumenDiarioModal = ({ isOpen, onClose }) => {
  const { resumen, loading, error, refreshResumen } = useCajaResumen();

  useEffect(() => {
    if (isOpen) refreshResumen();
  }, [isOpen, refreshResumen]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value || 0);

  const formatTime = (dateString) => {
    if (!dateString) return '--:-- hrs';
    const d = new Date(dateString);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} hrs`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-gray-50 p-0 rounded-lg mx-auto my-5 max-w-5xl max-h-[90vh] overflow-auto shadow-xl"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center text-blue-800">
          <FaChartLine className="mr-3 text-blue-600" />
          Resumen Diario de Caja
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4" />
          <p className="text-gray-500 font-medium">Cargando información de la caja…</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Panel Principal */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-3">
                <div className="flex flex-col md:flex-row md:justify-between mb-3 space-y-2 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <FaClock />
                    <span>
                      Activa desde: <strong>{formatTime(resumen.caja.fecha_apertura)}</strong>
                    </span>
                    <span>
                      Monto inicial: <strong>{formatCurrency(resumen.caja.monto_inicial)}</strong>
                    </span>
                  </div>
                  <div>
                    <span className="bg-blue-900 bg-opacity-30 py-1 px-3 rounded-full text-sm">
                      {new Date().toLocaleDateString('es-CL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-4xl font-bold mb-1">
                  {formatCurrency(resumen.totales.balancePorMetodo.total)}
                </div>
                <div className="flex items-center text-blue-100">
                  <FaWallet className="mr-2" /> Balance total actual
                </div>
                
                {/* Panel informativo de cobros */}
                <div className="mt-3 flex flex-col gap-2">
                  {/* Cobros del día */}
                  {resumen.totales.cobrosDelDia > 0 && (
                    <div className="bg-green-600 bg-opacity-30 p-2 rounded flex items-center">
                      <FaCalendarDay className="mr-2" /> 
                      <span>Cobros del día: <strong>{formatCurrency(
                        resumen.totales.cobrosDelDia || 0
                      )}</strong></span>
                    </div>
                  )}
                  
                  {/* Cobros de ventas pendientes */}
                  {resumen.totales.cobrosPendientes > 0 && (
                    <div className="bg-blue-600 bg-opacity-30 p-2 rounded flex items-center">
                      <FaHistory className="mr-2" /> 
                      <span>Cobros de ventas pendientes: <strong>{formatCurrency(
                        resumen.totales.cobrosPendientes || 0
                      )}</strong></span>
                    </div>
                  )}
                  
                  {/* Pendientes por cobrar */}
                  {resumen.totales.pendientesPorMetodo && 
                    Object.values(resumen.totales.pendientesPorMetodo).reduce((sum, val) => sum + (val || 0), 0) > 0 && (
                      <div className="bg-yellow-500 bg-opacity-20 p-2 rounded flex items-center">
                        <FaClock className="mr-2" /> 
                        <span>Pendientes por cobrar: <strong>{formatCurrency(
                          Object.values(resumen.totales.pendientesPorMetodo).reduce((sum, val) => sum + (val || 0), 0)
                        )}</strong></span>
                      </div>
                    )
                  }
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Ventas:</span>
                  <span className="font-bold">{resumen.totales.ventas}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Prendas vendidas:</span>
                  <span className="font-bold">{resumen.totales.totalPrendas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance efectivo:</span>
                  <span className="font-bold">
                    {formatCurrency(resumen.totales.balancePorMetodo.efectivo)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<FaTicketAlt size={24} className="text-blue-600" />}
              title="Ventas con ticket"
              value={resumen.totales.ventasConTicketCambio}
              color="blue"
            />
            <StatCard
              icon={<FaTshirt size={24} className="text-green-600" />}
              title="Prendas"
              value={resumen.totales.totalPrendas}
              color="green"
            />
            <StatCard
              icon={<FaPercentage size={24} className="text-red-600" />}
              title="Descuentos"
              value={formatCurrency(resumen.totales.totalDescuentos)}
              color="red"
            />
          </div>

          {/* Secciones modulares */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IngresosSection data={resumen.totales} formatCurrency={formatCurrency} />
            <GastosSection data={resumen.totales} formatCurrency={formatCurrency} />
            <EstadisticasSection data={resumen.totales} />
            <ReembolsosSection data={resumen.totales} formatCurrency={formatCurrency} />
            <CambiosDevolucionesSection data={resumen.totales} />
            <BalanceSection data={resumen.totales} formatCurrency={formatCurrency} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white px-6 py-4 border-t border-gray-200 sticky bottom-0 flex justify-end">
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default ResumenDiarioModal;
