import React from 'react';
import { FaCashRegister } from 'react-icons/fa';

const CajaInactiva = ({ openModal }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
            <FaCashRegister size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Caja 1</h2>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        Esta caja aún no ha sido abierta. Pulsa para iniciar la sesión de venta.
      </p>

      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Abrir Caja
      </button>
    </div>
  );
};

export default CajaInactiva;
