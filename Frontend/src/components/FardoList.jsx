import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import fardoService from '../services/fardos';
import ReactModal from 'react-modal';
import { FaPrint, FaEye, FaTrash } from 'react-icons/fa';
import useModal from '../hooks/useModal';

const FardosList = forwardRef((props, ref) => {
  const [fardos, setFardos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [detalleFardo, setDetalleFardo] = useState(null);
  const [fardoAEliminar, setFardoAEliminar] = useState(null);

  // Modales
  const { isOpen: isDetalleModalOpen, openModal: openDetalleModal, closeModal: closeDetalleModal } = useModal();
  const { isOpen: isEliminarModalOpen, openModal: openEliminarModal, closeModal: closeEliminarModal } = useModal();

  useEffect(() => {
    cargarFardos();
  }, [pagina, props.fechaInicio, props.fechaFin, props.proveedor, props.precioMin, props.precioMax, props.orden]);

  const cargarFardos = async () => {
    try {
      const data = await fardoService.obtenerFardos({
        fechaInicio: props.fechaInicio,
        fechaFin: props.fechaFin,
        proveedor: props.proveedor,
        precioMin: props.precioMin,
        precioMax: props.precioMax,
        orden: props.orden,
        page: pagina,
        limit: 15,
      });

      if (data.fardos && data.fardos.length > 0) {
        setFardos(data.fardos);
        setTotalPaginas(data.totalPages);
      } else {
        setFardos([]);
      }
    } catch (error) {
      console.error('Error al cargar fardos:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    cargarFardos,
  }));

  const handleVerFardo = (fardo) => {
    setDetalleFardo(fardo); // Establecer el detalle del fardo seleccionado
    openDetalleModal(); // Abrir el modal de detalles
  };

  const imprimirCodigoBarras = (codigo_barra_fardos, nombre_categoria, codigo_fardo) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Código de Barras</title>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; }
            #barcode { margin-top: 20px; }
          </style>
        </head>
        <body>
          <p><strong>Fardo:</strong> ${codigo_fardo}</p>
          <p><strong>Categoría:</strong> ${nombre_categoria}</p>
          <canvas id="barcode"></canvas>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              JsBarcode("#barcode", "${codigo_barra_fardos}", {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 18
              });
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleEliminarFardo = (fardo) => {
    setFardoAEliminar(fardo); // Establecer el fardo a eliminar
    openEliminarModal(); // Abrir el modal de confirmación
  };

  const confirmarEliminarFardo = async () => {
    try {
      await fardoService.eliminarFardo(fardoAEliminar.codigo_fardo); // Llamar al servicio para eliminar
      closeEliminarModal(); // Cerrar el modal después de eliminar
      cargarFardos(); // Recargar la lista de fardos
    } catch (error) {
      console.error('Error al eliminar fardo:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Listado de Fardos</h2>
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
            fardos.map((fardo) => (
              <tr key={fardo.id} className="hover:bg-gray-50 transition duration-200">
                <td className="py-2 px-4 border-b">{fardo.codigo_fardo}</td>
                <td className="py-2 px-4 border-b">{fardo.categoria?.nombre_categoria || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{fardo.proveedor?.nombre_proveedor || 'N/A'}</td>
                <td className="py-2 px-4 border-b flex justify-end space-x-2">
                  <button
                    onClick={() => imprimirCodigoBarras(fardo.codigo_barra_fardos, fardo.categoria?.nombre_categoria, fardo.codigo_fardo)}
                    className="bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600 transition duration-200 flex items-center"
                  >
                    <FaPrint />
                  </button>
                  <button
                    onClick={() => handleVerFardo(fardo)}
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition duration-200 flex items-center"
                  >
                    <FaEye className="mr-2" /> Ver
                  </button>
                  <button
                    onClick={() => handleEliminarFardo(fardo)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200 flex items-center"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No se encontraron fardos.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de Detalle */}
      <ReactModal
        isOpen={isDetalleModalOpen}
        onRequestClose={closeDetalleModal}
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        {detalleFardo ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Detalle del Fardo</h2>
            <p><strong>Código del Fardo:</strong> {detalleFardo.codigo_fardo}</p>
            <p><strong>Código de Barras:</strong> {detalleFardo.codigo_barra_fardos}</p>
            <p><strong>Costo del Fardo:</strong> ${detalleFardo.costo_fardo}</p>
            <p><strong>Costo Unitario por Prenda:</strong> ${parseFloat(detalleFardo.costo_fardo / detalleFardo.cantidad_prendas).toFixed(2)}</p>
            <p><strong>Cantidad de Prendas:</strong> {detalleFardo.cantidad_prendas}</p>
            <p><strong>Proveedor:</strong> {detalleFardo.proveedor?.nombre_proveedor || 'N/A'}</p>
            <p><strong>Categoría:</strong> {detalleFardo.categoria?.nombre_categoria || 'N/A'}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDetalleModal}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <p>Cargando detalles del fardo...</p>
        )}
      </ReactModal>

      {/* Modal de Eliminación */}
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
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminarFardo}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      </ReactModal>
    </div>
  );
});

export default FardosList;
