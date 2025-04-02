import React, { useState, forwardRef, useImperativeHandle } from 'react';
import ReactModal from 'react-modal';
import { FaSpinner } from 'react-icons/fa';

import FardoContextObject from '@/context/FardoContext';
const { useFardoContext } = FardoContextObject;

import imprimirCodigoBarras from './utils/imprimirCodigoBarras';
import FardoRow from './FardoRow';
import FardoTableHeader from './ui/FardoTableHeader';
import Paginacion from './ui/Paginacion';
import DetalleModal from './modals/DetalleModal';
import ClasificarModal from './modals/ClasificarModal';
import EliminarModal from './modals/EliminarModal';
import useModal from '@/hooks/useModal';

const FardosList = forwardRef((props, ref) => {
  const [detalleFardo, setDetalleFardo] = useState(null);
  const [fardoAEliminar, setFardoAEliminar] = useState(null);
  const [fardoAClasificar, setFardoAClasificar] = useState(null);

  const {
    fardos,
    prendasClasificadasMap,
    isLoading,
    error,
    totalPaginas,
    pagina,
    cargarFardos,
    setPagina,
    eliminarFardo,
  } = useFardoContext();

  const {
    isOpen: isDetalleModalOpen,
    openModal: openDetalleModal,
    closeModal: closeDetalleModal,
  } = useModal();

  const {
    isOpen: isEliminarModalOpen,
    openModal: openEliminarModal,
    closeModal: closeEliminarModal,
  } = useModal();

  const {
    isOpen: isClasificarModalOpen,
    openModal: openClasificarModal,
    closeModal: closeClasificarModal,
  } = useModal();

  useImperativeHandle(ref, () => ({
    cargarFardos,
  }));

  const handleVerFardo = (fardo) => {
    setDetalleFardo(fardo);
    openDetalleModal();
  };

  const handleEliminarFardo = (fardo) => {
    setFardoAEliminar(fardo);
    openEliminarModal();
  };

  const confirmarEliminarFardo = async () => {
    if (!fardoAEliminar) return;
    await eliminarFardo(fardoAEliminar.codigo_fardo);
    closeEliminarModal();
  };

  const handleClasificarFardo = (fardo) => {
    setFardoAClasificar(fardo);
    openClasificarModal();
  };

  const handlePageChange = (newPage) => {
    setPagina(newPage);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Listado de Fardos</h2>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <FaSpinner className="animate-spin text-blue-500 mr-2 text-2xl" />
          <span className="text-gray-600 font-medium">Cargando datos...</span>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <FardoTableHeader />
              <tbody className="bg-white divide-y divide-gray-300">
                {fardos.length > 0 ? (
                  fardos.map((fardo) => (
                    <FardoRow
                      key={fardo.codigo_fardo}
                      fardo={fardo}
                      prendasClasificadas={prendasClasificadasMap[fardo.codigo_fardo] || 0}
                      onVer={handleVerFardo}
                      onEliminar={handleEliminarFardo}
                      onClasificar={handleClasificarFardo}
                      onImprimir={imprimirCodigoBarras}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M20 4v7a4 4 0 01-4 4H8a4 4 0 01-4-4V4m0 0h16M4 4h16"
                          />
                        </svg>
                        <p className="text-lg font-semibold">No se encontraron fardos</p>
                        <p className="text-sm text-gray-400">Intenta con otros filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <Paginacion
              pagina={pagina}
              totalPaginas={totalPaginas}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <ReactModal
        isOpen={isDetalleModalOpen}
        onRequestClose={closeDetalleModal}
        className="p-0 outline-none overflow-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        {detalleFardo ? (
          <DetalleModal fardo={detalleFardo} onClose={closeDetalleModal} />
        ) : (
          <div className="p-6 flex justify-center items-center">
            <FaSpinner className="animate-spin text-blue-500 mr-2" />
            <p>Cargando detalles del fardo...</p>
          </div>
        )}
      </ReactModal>

      <ReactModal
        isOpen={isClasificarModalOpen}
        onRequestClose={closeClasificarModal}
        className="bg-white rounded-lg shadow-lg max-w-5xl mx-auto p-0 outline-none overflow-auto"
        overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4"
      >
        {fardoAClasificar ? (
          <ClasificarModal
            fardo={fardoAClasificar}
            onClose={closeClasificarModal}
            onClasificacionExitosa={cargarFardos}
          />
        ) : (
          <div className="p-6 flex justify-center items-center">
            <FaSpinner className="animate-spin text-blue-500 mr-2" />
            <p>Cargando datos del fardo...</p>
          </div>
        )}
      </ReactModal>

      <ReactModal
        isOpen={isEliminarModalOpen}
        onRequestClose={closeEliminarModal}
        className="bg-white rounded-lg shadow-lg max-w-md mx-auto p-0 outline-none"
        overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4"
      >
        <EliminarModal
          fardo={fardoAEliminar}
          onCancel={closeEliminarModal}
          onConfirm={confirmarEliminarFardo}
        />
      </ReactModal>
    </div>
  );
});

FardosList.displayName = 'FardosList';

export default FardosList;
