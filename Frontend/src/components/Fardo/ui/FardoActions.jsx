// components/Fardo/ui/FardoActions.jsx

import React from 'react';
import { FaPrint, FaEye, FaTrash, FaTags } from 'react-icons/fa';

const FardoActions = ({ fardo, onVer, onClasificar, onEliminar, onImprimir }) => {
  const categoria = typeof fardo.categoria?.nombre_categoria === 'object'
    ? fardo.categoria.nombre_categoria.nombre_categoria
    : fardo.categoria?.nombre_categoria || 'N/A';

  const codigoBarra = fardo.codigo_barra_fardo || 'No disponible';
  const codigoFardo = fardo.codigo_fardo || 'Sin código';

  return (
    <div className="flex justify-end items-center space-x-2">
      <button
        onClick={() => onImprimir(codigoBarra, categoria, codigoFardo)}
        className="bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600"
        title="Imprimir código de barras"
      >
        <FaPrint />
      </button>
      <button
        onClick={() => onVer(fardo)}
        className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
        title="Ver detalle"
      >
        <FaEye />
      </button>
      <button
        onClick={() => onClasificar(fardo)}
        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
        title="Clasificar"
      >
        <FaTags />
      </button>
      <button
        onClick={() => onEliminar(fardo)}
        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        title="Eliminar"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default FardoActions;
