import React from 'react';
import { FaMoneyBillWave, FaReceipt, FaCalculator, FaHandHoldingUsd } from 'react-icons/fa';

const MenuOptions = ({ showMenu, onOptionClick }) => {
  if (!showMenu) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
      <ul className="py-1">
        <li 
          className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
          onClick={() => onOptionClick('resumen')}
        >
          <FaReceipt className="mr-2" /> Resumen del día
        </li>
        <li 
          className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
          onClick={() => onOptionClick('gasto')}
        >
          <FaCalculator className="mr-2" /> Registrar gasto
        </li>
        <li 
          className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
          onClick={() => onOptionClick('cobro')}
        >
          <FaHandHoldingUsd className="mr-2" /> Registrar cobro
        </li>
        <li 
          className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
          onClick={() => onOptionClick('cerrarCaja')}
        >
          <FaMoneyBillWave className="mr-2" /> Cerrar caja
        </li>
      </ul>
    </div>
  );
};

export default MenuOptions;