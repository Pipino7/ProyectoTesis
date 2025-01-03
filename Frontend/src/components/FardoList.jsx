// frontend/src/components/FardoList.jsx

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { FaPrint, FaEye, FaTrash, FaTags } from 'react-icons/fa';

// Servicios
import fardoService from '../services/fardos';
import ClasificarService from '../services/Clasificar.services';
import useModal from '../hooks/useModal';
import ClasificarFardoModal from './ClasificarFardoModal';

const ITEMS_POR_PAGINA = 15;

const imprimirCodigoBarras = (codigo_barra_fardo, nombre_categoria, codigo_fardo) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Impresión de Código de Barras</title>
        <style>
          @media print {
            @page { margin: 0; }
            body { margin: 0; padding: 0; text-align: center; font-family: Arial, sans-serif; }
          }
          body { text-align: center; font-family: Arial, sans-serif; margin: 0; padding: 0; }
          #barcode { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div>
          <p><strong>Fardo:</strong> ${codigo_fardo}</p>
          <p><strong>Categoría:</strong> ${nombre_categoria}</p>
          <canvas id="barcode"></canvas>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function() {
            JsBarcode("#barcode", "${codigo_barra_fardo}", {
              format: "CODE128",
              width: 2,
              height: 100,
              displayValue: true,
              fontSize: 18
            });
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

// Componente Principal
const FardosList = forwardRef((props, ref) => {
  // Estados
  const [fardos, setFardos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [detalleFardo, setDetalleFardo] = useState(null);
  const [fardoAEliminar, setFardoAEliminar] = useState(null);
  const [fardoAClasificar, setFardoAClasificar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prendasClasificadasMap, setPrendasClasificadasMap] = useState({});
  const [error, setError] = useState(null);

  // Modales
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

  // Funciones
  const cargarFardos = useCallback(async () => {
    setIsLoading(true); // Indicar que la carga ha comenzado
    try {
      // 1. Carga los fardos
      const data = await fardoService.obtenerFardos({
        fechaInicio: props.fechaInicio,
        fechaFin: props.fechaFin,
        proveedor: props.proveedor,
        precioMin: props.precioMin,
        precioMax: props.precioMax,
        orden: props.orden,
        page: pagina,
        limit: ITEMS_POR_PAGINA,
        codigoFardo: props.busquedaCodigo, // Incluir el filtro de código de fardo
      });

      const fardosCargados = data.fardos || [];
      setFardos(fardosCargados); 
      setTotalPaginas(data.totalPages || 1); 

      // 2. Cargar prendas clasificadas para cada fardo
      const mapClasificaciones = {};
      await Promise.all(
        fardosCargados.map(async (fardo) => {
          try {
            const clasificadasResponse = await ClasificarService.obtenerPrendasClasificadas(fardo.codigo_fardo);
            const totalClasificadas = clasificadasResponse?.data.reduce(
              (total, prenda) => total + prenda.cantidad,
              0 // Valor inicial
            ) || 0;
    
            mapClasificaciones[fardo.codigo_fardo] = totalClasificadas;
          } catch (error) {
            console.error(`Error al cargar prendas clasificadas para el fardo ${fardo.codigo_fardo}:`, error);
            mapClasificaciones[fardo.codigo_fardo] = 0;
          }
        })
      );
      
      console.log('Final Map Clasificaciones:', mapClasificaciones);
      setPrendasClasificadasMap((prevMap) => ({
        ...prevMap,
        ...mapClasificaciones,
      }));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('No se pudieron cargar los datos. Inténtelo de nuevo más tarde.');
    } finally {
      setIsLoading(false); 
    }
  }, [pagina, props.fechaInicio, props.fechaFin, props.proveedor, props.precioMin, props.precioMax, props.orden, props.busquedaCodigo]);

  useEffect(() => {
    cargarFardos();
  }, [cargarFardos]);

  useImperativeHandle(ref, () => ({
    cargarFardos,
  }));

  // Manejo de eventos
  const handleVerFardo = (fardo) => {
    setDetalleFardo(fardo);
    openDetalleModal();
  };

  const handleEliminarFardo = (fardo) => {
    setFardoAEliminar(fardo);
    openEliminarModal();
  };

  const confirmarEliminarFardo = async () => {
    try {
      await fardoService.eliminarFardo(fardoAEliminar.codigo_fardo);
      closeEliminarModal();
      cargarFardos(); 
    } catch (error) {
      console.error('Error al eliminar fardo:', error);
      setError('No se pudo eliminar el fardo. Inténtelo de nuevo.');
    }
  };

  const handleClasificarFardo = (fardo) => {
    setFardoAClasificar(fardo);
    openClasificarModal();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Listado de Fardos</h2>
      {isLoading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Código del Fardo</th>
              <th className="py-2 px-4 border-b">Tipo de Prenda</th>
              <th className="py-2 px-4 border-b">Proveedor</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {fardos.length > 0 ? (
              fardos.map((fardo) => {
                const totalPrendas = fardo.cantidad_prendas || 0;
                const prendasClasificadas = prendasClasificadasMap[fardo.codigo_fardo] || 0;
                return (
                  <tr key={fardo.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="py-2 px-4 border-b">{fardo.codigo_fardo}</td>
                    <td className="py-2 px-4 border-b">
                      {typeof fardo.categoria?.nombre_categoria === 'object'
                        ? fardo.categoria.nombre_categoria.nombre_categoria
                        : fardo.categoria?.nombre_categoria || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {typeof fardo.proveedor?.nombre_proveedor === 'object'
                        ? fardo.proveedor.nombre_proveedor.nombre_proveedor
                        : fardo.proveedor?.nombre_proveedor || 'N/A'}
                    </td>
                    <td className="py-2 px-4 border-b flex justify-between items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {prendasClasificadas}/{totalPrendas} prendas clasificadas
                        </p>
                        <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden relative mt-1">
                          <div
                            className={`h-full rounded-full ${
                              prendasClasificadas === totalPrendas && totalPrendas > 0
                                ? 'bg-green-500'
                                : prendasClasificadas > 0
                                ? 'bg-yellow-500'
                                : 'bg-gray-300'
                            }`}
                            style={{
                              width: `${totalPrendas > 0 ? (prendasClasificadas / totalPrendas) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            imprimirCodigoBarras(
                              fardo.codigo_barra_fardo,
                              typeof fardo.categoria?.nombre_categoria === 'object'
                                ? fardo.categoria.nombre_categoria.nombre_categoria
                                : fardo.categoria?.nombre_categoria || 'N/A',
                              fardo.codigo_fardo
                            )
                          }
                          className="bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600"
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => handleVerFardo(fardo)}
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleClasificarFardo(fardo)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          <FaTags />
                        </button>
                        <button
                          onClick={() => handleEliminarFardo(fardo)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">No se encontraron fardos.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modales */}
      {/* Detalle Modal */}
      <ReactModal
        isOpen={isDetalleModalOpen}
        onRequestClose={closeDetalleModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        {detalleFardo ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Detalle del Fardo</h2>
            <div className="grid grid-cols-2 gap-4">
              <p className="text-gray-700 font-medium">Código del Fardo:</p>
              <p className="text-gray-900">{detalleFardo.codigo_fardo}</p>
              <p className="text-gray-700 font-medium">Código de Barras:</p>
              <p className="text-gray-900">{detalleFardo.codigo_barra_fardo}</p>
              <p className="text-gray-700 font-medium">Costo del Fardo:</p>
              <p className="text-gray-900">${detalleFardo.costo_fardo}</p>
              <p className="text-gray-700 font-medium">Costo Unitario por Prenda:</p>
              <p className="text-gray-900">
                ${detalleFardo.costo_fardo && detalleFardo.cantidad_prendas
                  ? parseFloat(detalleFardo.costo_fardo / detalleFardo.cantidad_prendas).toFixed(2)
                  : 'N/A'}
              </p>
              <p className="text-gray-700 font-medium">Cantidad de Prendas:</p>
              <p className="text-gray-900">{detalleFardo.cantidad_prendas}</p>
              <p className="text-gray-700 font-medium">Proveedor:</p>
              <p className="text-gray-900">
                {typeof detalleFardo.proveedor?.nombre_proveedor === 'object'
                  ? detalleFardo.proveedor.nombre_proveedor.nombre_proveedor
                  : detalleFardo.proveedor?.nombre_proveedor || 'N/A'}
              </p>
              <p className="text-gray-700 font-medium">Categoría:</p>
              <p className="text-gray-900">
                {typeof detalleFardo.categoria?.nombre_categoria === 'object'
                  ? detalleFardo.categoria.nombre_categoria.nombre_categoria
                  : detalleFardo.categoria?.nombre_categoria || 'N/A'}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDetalleModal}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <p>Cargando detalles del fardo...</p>
        )}
      </ReactModal>

      {/* Clasificar Modal */}
      <ReactModal
        isOpen={isClasificarModalOpen}
        onRequestClose={closeClasificarModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        {fardoAClasificar ? (
          <ClasificarFardoModal
            fardo={fardoAClasificar}
            onClose={closeClasificarModal}
            onClasificacionExitosa={cargarFardos}
          />
        ) : (
          <p>Cargando datos del fardo...</p>
        )}
      </ReactModal>

      {/* Eliminar Modal */}
      <ReactModal
        isOpen={isEliminarModalOpen}
        onRequestClose={closeEliminarModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div>
          <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
          <p>
            ¿Está seguro de que desea eliminar el fardo{' '}
            <strong>{fardoAEliminar?.codigo_fardo}</strong>?
          </p>
          <div className="flex justify-end mt-4">
            <button
              onClick={closeEliminarModal}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminarFardo}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </ReactModal>
    </div>
  );
});

// Validación de Props
FardosList.propTypes = {
  fechaInicio: PropTypes.string,
  fechaFin: PropTypes.string,
  proveedor: PropTypes.string,
  precioMin: PropTypes.number,
  precioMax: PropTypes.number,
  orden: PropTypes.string,
  busquedaCodigo: PropTypes.string, 
};

FardosList.displayName = 'FardosList';

export default FardosList;
