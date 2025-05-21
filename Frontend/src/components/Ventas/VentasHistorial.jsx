import React from 'react';
import { FaHistory } from 'react-icons/fa';

const VentasHistorial = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-sm p-10 max-w-lg text-center">
        <FaHistory className="mx-auto text-gray-300 text-6xl mb-4" />
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">Historial de Ventas</h3>
        <p className="text-gray-500">
          Esta funcionalidad estará disponible próximamente. 
        </p>
      </div>
    </div>
  );
};

export default VentasHistorial;