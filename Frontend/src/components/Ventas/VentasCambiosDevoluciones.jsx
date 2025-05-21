import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';

const VentasCambiosDevoluciones = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-white rounded-lg shadow-sm p-10 max-w-lg text-center">
        <FaExchangeAlt className="mx-auto text-gray-300 text-6xl mb-4" />
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">Cambios y Devoluciones</h3>
        <p className="text-gray-500">
          Esta funcionalidad estará disponible próximamente. Aquí podrás gestionar y visualizar 
          todos los cambios y devoluciones realizados, consultar los motivos más comunes, 
          y generar reportes detallados.
        </p>
      </div>
    </div>
  );
};

export default VentasCambiosDevoluciones;