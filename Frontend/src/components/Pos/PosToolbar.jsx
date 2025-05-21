import React from 'react';
import { useNavigate } from 'react-router-dom';

const PosToolbar = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex space-x-4 overflow-x-auto">
      <button
        onClick={() => navigate('/ventas')}
        className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 text-sm whitespace-nowrap"
      >
        Ver ventas del día
      </button>
      <button
        onClick={() => alert('🔍 Buscar venta')}
        className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 text-sm whitespace-nowrap"
      >
        Buscar venta
      </button>
      <button
        onClick={() => alert('📦 Ver inventario')}
        className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200 text-sm whitespace-nowrap"
      >
        Ver inventario
      </button>
      <button
        onClick={() => navigate('/ResumenHistorico')}
        className="bg-purple-100 text-purple-700 px-4 py-2 rounded hover:bg-purple-200 text-sm whitespace-nowrap flex items-center"
      >
        <span className="mr-1">📊</span> Historial de cajas
      </button>
    </div>
  );
};

export default PosToolbar;
