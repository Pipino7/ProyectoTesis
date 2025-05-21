import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { FaTimes, FaCalendarAlt, FaMoneyBillWave, FaShoppingCart, 
  FaTshirt, FaCreditCard, FaExchangeAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const DetallesCajaModal = ({ isOpen, onClose, caja }) => {
  if (!caja) return null;

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


  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };
  
  const calcularDuracion = () => {
    if (!caja.fecha_apertura || !caja.fecha_cierre) return '—';
    
    const inicio = new Date(caja.fecha_apertura);
    const fin = new Date(caja.fecha_cierre);
    const diferencia = fin - inicio;
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas} hrs ${minutos} min`;
  };
  
  const calcularDiferencia = () => {
    const diferencia = (caja.monto_final_declarado || 0) - (caja.monto_final_calculado || 0);
    
    if (Math.abs(diferencia) < 1) return { valor: 0, tipo: 'exacto' }; // Sin diferencia significativa
    
    return {
      valor: Math.abs(diferencia),
      tipo: diferencia > 0 ? 'sobrante' : 'faltante'
    };
  };

  const diferencia = calcularDiferencia();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Detalles de caja cerrada"
      className="bg-white rounded-xl mx-auto my-12 max-w-2xl shadow-2xl relative"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      ariaHideApp={false}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-5 rounded-t-xl flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <FaMoneyBillWave className="mr-3 text-white" />
          Detalle de Caja #{caja.id}
        </h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <FaTimes size={22} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Información de cierre automático si aplica */}
        {caja.cerrada_automaticamente && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-5 flex items-start">
            <FaExclamationTriangle className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Caja cerrada automáticamente por el sistema</h3>
              <p className="text-amber-700 text-sm mt-1">
                Esta caja fue cerrada automáticamente debido a inactividad o durante el proceso de cierre del día.
              </p>
            </div>
          </div>
        )}

        {/* Información general */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Información General</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">ID de Sesión</span>
              <span className="font-medium text-gray-800">{caja.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Usuario</span>
              <span className="font-medium text-gray-800">{caja.usuario || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Apertura</span>
                <span className="font-medium text-gray-800">{formatDate(caja.fecha_apertura)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-red-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Cierre</span>
                <span className="font-medium text-gray-800">{formatDate(caja.fecha_cierre)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-purple-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Duración</span>
                <span className="font-medium text-gray-800">{calcularDuracion()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Saldos y diferencias */}
        <section className="pt-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Saldos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Monto Inicial</span>
                <span className="font-medium text-gray-800">{formatCurrency(caja.monto_inicial)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Monto Final Calculado</span>
                <span className="font-medium text-gray-800">{formatCurrency(caja.monto_final_calculado)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-purple-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Monto Final Declarado</span>
                <span className="font-medium text-gray-800">{formatCurrency(caja.monto_final_declarado)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {diferencia.tipo === 'exacto' ? (
                <FaExchangeAlt className="text-gray-500" />
              ) : diferencia.tipo === 'sobrante' ? (
                <FaExchangeAlt className="text-green-500" />
              ) : (
                <FaExchangeAlt className="text-red-500" />
              )}
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Diferencia</span>
                {diferencia.tipo === 'exacto' ? (
                  <span className="font-medium text-gray-800">Sin diferencia</span>
                ) : (
                  <span className={`font-medium ${diferencia.tipo === 'sobrante' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(diferencia.valor)} ({diferencia.tipo})
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Ventas y transacciones */}
        <section className="pt-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Ventas y Transacciones</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Ventas</span>
                <span className="font-medium text-gray-800">{formatCurrency(caja.total_ventas)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaTshirt className="text-indigo-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Prendas Vendidas</span>
                <span className="font-medium text-gray-800">{caja.total_prendas || '0'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-purple-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Cobros</span>
                <span className="font-medium text-gray-800">{formatCurrency(caja.total_cobros)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaTshirt className="text-red-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Prendas Devueltas</span>
                <span className="font-medium text-gray-800">{caja.prendas_devueltas || '0'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Métodos de pago (si están disponibles) */}
        {caja.cobros_por_metodo && (
          <section className="pt-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Métodos de Pago</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Efectivo</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(caja.cobros_por_metodo.efectivo)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaCreditCard className="text-purple-500" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Tarjeta</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(caja.cobros_por_metodo.tarjeta)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaExchangeAlt className="text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Transferencia</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(caja.cobros_por_metodo.transferencia)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Observación */}
        {caja.observacion && (
          <section className="pt-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">Observación</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
              {caja.observacion}
            </p>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 border-t flex justify-end rounded-b-xl">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

DetallesCajaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  caja: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    usuario: PropTypes.string,
    fecha_apertura: PropTypes.string,
    fecha_cierre: PropTypes.string,
    monto_inicial: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    monto_final_calculado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    monto_final_declarado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    diferencia: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_ventas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_prendas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    prendas_devueltas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_cobros: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cerrada_automaticamente: PropTypes.bool,
    observacion: PropTypes.string,
    cobros_por_metodo: PropTypes.shape({
      efectivo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      tarjeta: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      transferencia: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  })
};

export default DetallesCajaModal;