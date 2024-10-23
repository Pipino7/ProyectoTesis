import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { obtenerFardos, eliminarFardo, obtenerFardosConFiltros } from '../services/fardos'; // Asegúrate de que estas funciones están bien configuradas
import ReactModal from 'react-modal';
import { FaPrint, FaEye, FaTrash } from 'react-icons/fa';  // Importar los iconos de impresión, ver y eliminar

const FardosList = forwardRef((props, ref) => {
  const [fardos, setFardos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [detalleFardo, setDetalleFardo] = useState(null); // Para almacenar los detalles del fardo
  const [modalEliminarIsOpen, setModalEliminarIsOpen] = useState(false);
  const [fardoAEliminar, setFardoAEliminar] = useState(null);

  // Cargar los fardos desde el backend usando los filtros proporcionados en props
  useEffect(() => {
    cargarFardos();
  }, [pagina, props.fechaInicio, props.fechaFin, props.proveedor, props.precioMin, props.precioMax, props.orden]);

  const cargarFardos = async () => {
    try {
      // Utiliza los filtros pasados desde FardosModule a través de props
      const data = await obtenerFardosConFiltros({
        fechaInicio: props.fechaInicio,
        fechaFin: props.fechaFin,
        proveedor: props.proveedor,
        precioMin: props.precioMin,
        precioMax: props.precioMax,
        orden: props.orden,
        page: pagina,
        limit: 20
      });
      setFardos(data.fardos);
      setTotalPaginas(data.totalPages);
    } catch (error) {
      console.error('Error al cargar fardos:', error);
    }
  };

  // Exponer la función cargarFardos al componente padre si es necesario
  useImperativeHandle(ref, () => ({
    cargarFardos,
  }));

  // Función para manejar la apertura del modal con detalles del fardo
  const handleVerFardo = (fardo) => {
    setDetalleFardo(fardo); // Guardar el fardo seleccionado en el estado
    setModalIsOpen(true);  // Abrir el modal
  };

  // Función para imprimir el código de barras de un fardo específico
  const imprimirCodigoBarras = (codigo_barra_fardos, tipo_prenda, codigo_fardo) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Código de Barras</title>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; }
            #barcode { margin-top: 20px; }
            h1 { color: #4A90E2; }
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

  // Función para manejar la apertura del modal de confirmación de eliminación
  const handleEliminarFardo = (fardo) => {
    setFardoAEliminar(fardo);
    setModalEliminarIsOpen(true);
  };

  // Función para confirmar la eliminación del fardo
  const confirmarEliminarFardo = async () => {
    try {
      await eliminarFardo(fardoAEliminar.codigo_fardo);
      setModalEliminarIsOpen(false);
      cargarFardos(); // Recargar la lista de fardos
    } catch (error) {
      console.error('Error al eliminar fardo:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Tabla de fardos */}
      <table className="min-w-full bg-white shadow-lg rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Tipo de Prenda</th>
            <th className="py-2 px-4 border-b">Proveedor</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fardos.map((fardo) => (
            <tr key={fardo.id}>
              <td className="py-2 px-4 border-b">{fardo.tipo_prenda}</td>
              <td className="py-2 px-4 border-b">{fardo.nombre_proveedor}</td>
              <td className="py-2 px-4 border-b flex justify-end">
                {/* Botón para imprimir el código de barras */}
                <button
                  onClick={() => imprimirCodigoBarras(fardo.codigo_barra_fardos, fardo.tipo_prenda, fardo.codigo_fardo)}
                  className="bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 transition duration-200 flex items-center"
                >
                  <FaPrint />
                </button>

                {/* Botón para ver los detalles del fardo */}
                <button
                  onClick={() => handleVerFardo(fardo)}
                  className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition duration-200 flex items-center ml-2"
                >
                  <FaEye className="mr-2" /> Ver
                </button>

                {/* Botón para eliminar el fardo */}
                <button
                  onClick={() => handleEliminarFardo(fardo)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition duration-200 flex items-center ml-2"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
  <button
    onClick={() => setPagina(pagina - 1)}
    disabled={pagina === 1}
    className={`px-4 py-2 rounded ${pagina === 1 ? 'bg-gray-300 text-gray-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
  >
    Anterior
  </button>
  <span>
    Página {pagina} de {totalPaginas}
  </span>
  <button
    onClick={() => setPagina(pagina + 1)}
    disabled={pagina === totalPaginas}
    className={`px-4 py-2 rounded ${pagina === totalPaginas ? 'bg-gray-300 text-gray-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
  >
    Siguiente
  </button>
</div>


      {/* Modal para ver detalles del fardo */}
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Detalles del Fardo"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        className="bg-white rounded-lg overflow-auto max-h-full w-full max-w-2xl mx-auto p-6 relative shadow-lg"
      >
        {detalleFardo && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-center">Detalles del Fardo</h2>
            <table className="min-w-full bg-white">
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Código del Fardo</td>
                  <td className="py-2 px-4 border-b">{detalleFardo.codigo_fardo}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Tipo de Prenda</td>
                  <td className="py-2 px-4 border-b">{detalleFardo.tipo_prenda}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Proveedor</td>
                  <td className="py-2 px-4 border-b">{detalleFardo.nombre_proveedor}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Cantidad de Prendas</td>
                  <td className="py-2 px-4 border-b">{detalleFardo.cantidad_prendas}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Costo del Fardo</td>
                  <td className="py-2 px-4 border-b">${detalleFardo.costo_fardo}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Ganancias Estimadas</td>
                  <td className="py-2 px-4 border-b">${detalleFardo.ganancias_estimadas}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Costo Unitario por Prenda</td>
                  <td className="py-2 px-4 border-b">${detalleFardo.costo_unitario_por_prenda}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-semibold">Estado del Fardo</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-4 py-2 rounded-full ${detalleFardo.estado_fardo === 'En stock' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {detalleFardo.estado_fardo}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </ReactModal>

      {/* Modal para confirmar eliminación del fardo */}
      <ReactModal
        isOpen={modalEliminarIsOpen}
        onRequestClose={() => setModalEliminarIsOpen(false)}
        contentLabel="Confirmar Eliminación"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        className="bg-white rounded-lg overflow-auto max-h-full w-full max-w-md mx-auto p-6 relative"
      >
        <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
        <p>¿Estás seguro de que deseas eliminar el fardo <strong>{fardoAEliminar?.codigo_fardo}</strong>?</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setModalEliminarIsOpen(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-200 mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarEliminarFardo}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
          >
            Aceptar
          </button>
        </div>
      </ReactModal>
    </div>
  );
});

export default FardosList;
