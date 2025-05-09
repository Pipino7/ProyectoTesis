import React, { useState } from 'react';
import { FaExchangeAlt, FaUndo } from 'react-icons/fa';
import SeccionDevolucion from './SeccionDevolucion';
import SeccionCambio from './SeccionCambio';

const SeccionDevolucionCambio = () => {

  const [modoOperacion, setModoOperacion] = useState(null); 
  

  const seleccionarModo = (modo) => {
    setModoOperacion(modo);
  };


  const renderizarSeccion = () => {
    switch(modoOperacion) {
      case 'devolucion':
        return <SeccionDevolucion />;
      case 'cambio':
        return <SeccionCambio />;
      default:
        return (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Seleccione la operación que desea realizar:
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => seleccionarModo('devolucion')}
                className="flex-1 bg-amber-600 text-white px-4 py-3 rounded hover:bg-amber-700 flex items-center justify-center"
              >
                <FaUndo className="mr-2" /> Devolución
              </button>
              <button
                onClick={() => seleccionarModo('cambio')}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <FaExchangeAlt className="mr-2" /> Cambio
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">↩ Cambios / Devoluciones</h3>
      
      {renderizarSeccion()}
      
      {modoOperacion && (
        <button
          onClick={() => setModoOperacion(null)}
          className="mt-3 w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
        >
          Volver al selector
        </button>
      )}
    </div>
  );
};

export default SeccionDevolucionCambio;
