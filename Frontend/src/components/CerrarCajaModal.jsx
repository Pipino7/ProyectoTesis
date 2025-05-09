import React, { useState, useEffect } from 'react';
import { cajaService } from '@/services';

import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/format';

const CerrarCajaModal = ({ isOpen, onClose, onCajaCerrada }) => {
  const [cargando, setCargando] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [montoDeclared, setMontoDeclared] = useState('');
  const [observacion, setObservacion] = useState('');
  const [diferencia, setDiferencia] = useState(0);


  useEffect(() => {
    if (isOpen) {
      cargarResumenCaja();
    }
  }, [isOpen]);


  useEffect(() => {
    if (resumen && montoDeclared) {
      const montoCalculado = resumen.totales.saldo_calculado;
      const diff = parseFloat(montoDeclared) - montoCalculado;
      setDiferencia(diff);
    }
  }, [montoDeclared, resumen]);


  const cargarResumenCaja = async () => {
    try {
      setCargando(true);
      const response = await cajaService.obtenerResumenCaja();
      setResumen(response.data);

      setMontoDeclared(response.data.totales.saldo_calculado.toString());
    } catch (error) {
      console.error('Error al cargar resumen de caja:', error);
      toast.error('No se pudo cargar el resumen de caja');
    } finally {
      setCargando(false);
    }
  };


  const handleCerrarCaja = async () => {
    try {
      setCargando(true);
      
      const datosCierre = {
        monto_declarado: parseFloat(montoDeclared),
        observacion: observacion
      };
      
      const response = await cajaService.cerrarCaja(datosCierre);
      toast.success('Caja cerrada correctamente');
      
      if (onCajaCerrada) {
        onCajaCerrada(response.data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      toast.error(error.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setCargando(false);
    }
  };


  if (!isOpen || !resumen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Cerrar Caja</h2>
        
        {/* Información de la caja */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID Sesión:</p>
              <p className="font-medium">{resumen.caja.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de apertura:</p>
              <p className="font-medium">
                {new Date(resumen.caja.fecha_apertura).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monto inicial:</p>
              <p className="font-medium">{formatCurrency(resumen.caja.monto_inicial)}</p>
            </div>
          </div>
        </div>
        
        {/* Totales */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Resumen de Operaciones</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Ventas:</p>
              <p className="font-medium text-green-600">
                {formatCurrency(resumen.totales.ventas)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cobros:</p>
              <p className="font-medium text-blue-600">
                {formatCurrency(resumen.totales.cobros)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Gastos:</p>
              <p className="font-medium text-red-600">
                {formatCurrency(resumen.totales.gastos)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Saldo Calculado:</p>
              <p className="font-bold text-purple-600">
                {formatCurrency(resumen.totales.saldo_calculado)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label htmlFor="montoDeclared" className="block text-sm font-medium text-gray-700">
              Monto en Caja (declarado)
            </label>
            <input
              type="number"
              id="montoDeclared"
              value={montoDeclared}
              onChange={(e) => setMontoDeclared(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingrese el monto contado en caja"
              step="0.01"
              min="0"
            />
            
            {diferencia !== 0 && (
              <div className={`mt-2 text-sm ${diferencia < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {diferencia < 0 
                  ? `Faltante: ${formatCurrency(Math.abs(diferencia))}` 
                  : `Sobrante: ${formatCurrency(diferencia)}`}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="observacion" className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              id="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observaciones sobre el cierre de caja (opcional)"
            ></textarea>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            onClick={handleCerrarCaja}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : 'Cerrar Caja'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CerrarCajaModal;