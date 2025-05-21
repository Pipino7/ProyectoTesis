import React, { useState } from 'react';
import { FaCalendarAlt, FaSearch, FaFileDownload, FaChartBar, FaRegClock } from 'react-icons/fa';
import VentasTable from './VentasTable';
import VentaDetalleModal from './VentaDetalleModal';
import useVentasResumen from './useVentasResumen';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
};

const Ventas = () => {
  const today = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(today);
  const [selectedVenta, setSelectedVenta] = useState(null);
  
  const { 
    resumen,
    ventas, 
    loading,
    error,
    pagination,
    goToPage,
    changeDate
  } = useVentasResumen({ fecha });
  
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFecha(newDate);
    changeDate(newDate);
  };

  const handleSelectVenta = (venta) => {
    setSelectedVenta(venta);
  };

  const handleCloseModal = () => {
    setSelectedVenta(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Ventas</h1>

      {/* Filters and top section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 md:mb-0">Resumen de ventas</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-400 mr-2" />
              <input
                type="date"
                value={fecha}
                onChange={handleDateChange}
                className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats cards */}
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        ) : resumen ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total sales card */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-500 text-sm font-medium">Total Ventas</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumen.monto_total)}</p>
                </div>
                <span className="p-2 bg-blue-100 rounded-md text-blue-600">
                  <FaChartBar />
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span>{resumen.total_ventas} ventas realizadas</span>
              </div>
            </div>

            {/* Payment status card */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-500 text-sm font-medium">Ventas Pagadas</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{resumen.ventas_pagadas}</p>
                </div>
                <span className="p-2 bg-green-100 rounded-md text-green-600">
                  <FaSearch />
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span>
                  {resumen.ventas_pendientes > 0 ? 
                    `${resumen.ventas_pendientes} ventas pendientes` : 
                    'Todas las ventas pagadas'}
                </span>
              </div>
            </div>

            {/* Discounts card */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-purple-500 text-sm font-medium">Total Descuentos</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(resumen.total_descuentos)}</p>
                </div>
                <span className="p-2 bg-purple-100 rounded-md text-purple-600">
                  <FaFileDownload />
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span>
                  {resumen.ventas_con_cupon > 0 ? 
                    `${resumen.ventas_con_cupon} ventas con cupón` : 
                    'Sin descuentos aplicados'}
                </span>
              </div>
            </div>

            {/* Items sold card */}
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-amber-500 text-sm font-medium">Prendas Vendidas</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{resumen.total_prendas}</p>
                </div>
                <span className="p-2 bg-amber-100 rounded-md text-amber-600">
                  <FaRegClock />
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span>Promedio: {resumen.total_ventas > 0 ? Math.round(resumen.total_prendas / resumen.total_ventas) : 0} por venta</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Sales by payment method */}
      {resumen && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Ventas por Método de Pago</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(resumen.monto_por_metodo).map(([metodo, monto]) => (
              <div key={metodo} className="border rounded-lg p-4">
                <p className="text-sm text-gray-500 capitalize">{metodo}</p>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-lg font-semibold text-gray-800">{formatCurrency(monto)}</p>
                  <p className="text-xs text-gray-500">{resumen.ventas_por_metodo[metodo]} ventas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales table */}
      <VentasTable
        ventas={ventas}
        loading={loading}
        pagination={pagination}
        onPageChange={goToPage}
        onSelectVenta={handleSelectVenta}
      />

      {/* Sale detail modal */}
      {selectedVenta && (
        <VentaDetalleModal
          venta={selectedVenta}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Ventas;