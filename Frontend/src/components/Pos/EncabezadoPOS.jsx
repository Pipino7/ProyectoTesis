import React from 'react';
import { FaUser } from 'react-icons/fa';

const EncabezadoPOS = () => {
  const username = localStorage.getItem('username') || 'Usuario';

  return (
    <header className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white shadow-md p-4 flex justify-between items-center">
      <div className="text-lg font-bold flex items-center space-x-2">
        <span className="text-2xl">🧾</span>
        <span>Punto de Venta</span>
      </div>
      <div className="flex items-center space-x-6">
        <button
          className="text-sm bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition-all"
          onClick={() => alert('🚧 Próximamente: ver ventas')}
        >
          Ir a Ventas
        </button>
        <div className="flex items-center space-x-3">
          <div className="bg-gray-100 p-2 rounded-full shadow">
            <FaUser className="text-gray-800" />
          </div>
          <span className="text-sm font-medium">{username}</span>
        </div>
      </div>
    </header>
  );
};

export default EncabezadoPOS;