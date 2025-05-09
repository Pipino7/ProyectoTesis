import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCashRegister } from 'react-icons/fa';
import BotonOpcionesCaja from './BotonOpcionesCaja';

const CajaActiva = ({ onCerrarCaja, cajaData }) => {
  const navigate = useNavigate();
  
  const cajaId = cajaData?.id || 1;
  const cajaNumero = cajaData?.numero || 1;
  const cajaEstado = cajaData?.estado || 'Activa';
  const cajaFechaApertura = cajaData?.fechaApertura 
    ? new Date(cajaData.fechaApertura).toLocaleString() 
    : 'No disponible';
  const cajaSaldo = cajaData?.saldo ? `$${cajaData.saldo.toLocaleString()}` : '$0';

  return (
    <div className="relative bg-white p-6 rounded-lg shadow border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 text-xl text-gray-800 font-semibold">
          <FaCashRegister className="text-green-500" />
          <span>Caja {cajaNumero} ({cajaEstado})</span>
        </div>

        <BotonOpcionesCaja onCerrarCaja={onCerrarCaja} />
      </div>

      <div className="text-sm text-gray-600 mb-4 space-y-1">
        <p>💳 Caja activa y lista para realizar ventas.</p>
        <p>📅 Abierta desde: {cajaFechaApertura}</p>
        <p>💰 Saldo actual: {cajaSaldo}</p>
      </div>

      <button
        onClick={() => navigate('/posventa')}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Continuar Venta
      </button>
    </div>
  );
};

export default CajaActiva;
