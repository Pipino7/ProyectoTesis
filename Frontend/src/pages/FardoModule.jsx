import React, { useState, useRef } from 'react';
import FardoContext from '@/context/FardoContext'; 
import FiltrosFardos from '@/components/Fardo/ui/FiltrosFardos';
import FardosList from '@/components/Fardo/FardoList';
import ReactModal from 'react-modal';
import AgregarFardo from '@/components/AgregarFardo';
import { FaBars } from 'react-icons/fa';

const { Provider, useFardoContext } = FardoContext;

export default function FardoModule() {
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [codigoFardoReciente, setCodigoFardoReciente] = useState(null);
  const fardosListRef = useRef();

  const cerrarModal = () => setMostrarAgregar(false);

  const handleFardoAgregado = (codigoFardo) => {
    setCodigoFardoReciente(codigoFardo);
    setMostrarAgregar(false);
    if (fardosListRef.current) {
      fardosListRef.current.cargarFardos();
    }
  };

  return (
    <Provider>
      <div className="p-6 bg-gray-50 min-h-screen flex relative">
        {/* Panel lateral de filtros */}
        <FiltrosFardos />

        <div className="flex-1 ml-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <BotonHamburguesa />
                  <h1 className="text-4xl font-extrabold text-gray-900 ml-4">Gestión de Fardos</h1>
                </div>
                <button
                  onClick={() => setMostrarAgregar(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
                >
                  Agregar Fardo
                </button>
              </div>

              {/* Listado principal de fardos */}
              <FardosList ref={fardosListRef} />
            </div>

            {/* Modal para agregar fardos */}
            <ReactModal
              isOpen={mostrarAgregar}
              onRequestClose={cerrarModal}
              contentLabel="Agregar Fardo"
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
              className="bg-white rounded-lg overflow-auto max-h-full w-full max-w-2xl mx-auto p-8"
            >
              <AgregarFardo onClose={cerrarModal} onFardoAgregado={handleFardoAgregado} />
            </ReactModal>
          </div>
        </div>
      </div>
    </Provider>
  );
}

function BotonHamburguesa() {
  const { setMostrarFiltros } = useFardoContext();

  const handleClick = () => {
    setMostrarFiltros((prev) => {
      return !prev;
    });
  };

  return (
    <button onClick={handleClick} className="text-gray-600 hover:text-gray-800">
      <FaBars size={24} />
    </button>
  );
}
