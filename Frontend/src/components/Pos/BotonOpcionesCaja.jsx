import React, { useState } from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { FaDoorClosed } from 'react-icons/fa';

const BotonOpcionesCaja = ({ onCerrarCaja }) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <HiDotsVertical size={20} />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            onClick={() => {
              onCerrarCaja();
              setAbierto(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <FaDoorClosed />
            Cerrar Caja
          </button>
        </div>
      )}
    </div>
  );
};

export default BotonOpcionesCaja;
