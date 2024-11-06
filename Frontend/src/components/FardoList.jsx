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
      
      console.log("Datos de fardos recibidos en el front:", data);
  
      if (data.fardos && data.fardos.length > 0) {
        setFardos(data.fardos);
        setTotalPaginas(data.totalPages);
      } else {
        console.warn("La respuesta contiene una lista vacía de fardos.");
        setFardos([]);  // Asegura que el array esté vacío en caso de que no haya resultados.
      }
    } catch (error) {
      console.error("Error al cargar fardos en el front:", error);
    }
  };

  useEffect(() => {
    console.log("Estado de fardos después de cargarFardos:", fardos);
  }, [fardos]);

  useImperativeHandle(ref, () => ({
    cargarFardos,
  }));

  const handleVerFardo = (fardo) => {
    setDetalleFardo(fardo);
    openDetalleModal();
  };

  const imprimirCodigoBarras = (codigo_barra_fardos, tipo_prenda, codigo_fardo) => {
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
          <h1>Código de Barras del Fardo</h1>
          <p><strong>Fardo:</strong> ${codigo_fardo}</p>
          <p><strong>Prenda:</strong> ${tipo_prenda}</p>
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
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Listado de Fardos</h2>
      <table className="min-w-full bg-white shadow-lg rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Código del Fardo</th>
            <th className="py-2 px-4 border-b">Tipo de Prenda</th>
            <th className="py-2 px-4 border-b">Proveedor</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fardos.length > 0 ? (
            fardos.map((fardo) => (
              <tr key={fardo.id}>
                <td className="py-2 px-4 border-b">{fardo.codigo_fardo}</td>
                <td className="py-2 px-4 border-b">{fardo.categoria?.nombre_categoria || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{fardo.proveedor?.nombre_proveedor || 'N/A'}</td>
                <td className="py-2 px-4 border-b flex justify-end space-x-2">
                  <button
                    onClick={() => imprimirCodigoBarras(fardo.codigo_barra_fardos, fardo.categoria?.nombre_categoria, fardo.codigo_fardo)}
                    className="bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 transition duration-200 flex items-center"
                  >
                    <FaPrint />
                  </button>
                  <button
                    onClick={() => handleVerFardo(fardo)}
                    className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition duration-200 flex items-center"
                  >
                    <FaEye className="mr-2" /> Ver
                  </button>
                  <button
                    onClick={() => handleEliminarFardo(fardo)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition duration-200 flex items-center"
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

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
          disabled={pagina === 1}
          className={`px-4 py-2 rounded ${pagina === 1 ? 'bg-gray-300 text-gray-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
        >
          Anterior
        </button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button
          onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
          disabled={pagina === totalPaginas}
          className={`px-4 py-2 rounded ${pagina === totalPaginas ? 'bg-gray-300 text-gray-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
});

export default FardosList;
