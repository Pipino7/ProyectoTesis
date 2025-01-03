import { useState, useEffect } from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';
import clasificacionService from '../services/Clasificar.services';
import PropTypes from 'prop-types';
import categoriaService from '../services/Categoria.services';

const ClasificarFardoModal = ({ fardo, onClose, onClasificacionExitosa }) => {
  const [prendasBodega, setPrendasBodega] = useState(0);
  const [prendasClasificadas, setPrendasClasificadas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isEditingCategoria, setIsEditingCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingClasification, setPendingClasification] = useState(null);

  const { codigo_fardo, categoria: categoriaObj } = fardo || {};
  const categoria_origen = categoriaObj?.nombre_categoria || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!codigo_fardo) {
        console.warn("Falta el código del fardo, no se ejecutará la carga de datos.");
        return;
      }

      try {
        const categoriasResponse = await categoriaService.obtenerCategorias();
        setCategorias(categoriasResponse);

        const clasificadasResponse = await clasificacionService.obtenerPrendasClasificadas(codigo_fardo);
        setPrendasClasificadas(clasificadasResponse.data);

        const bodegaResponse = await clasificacionService.obtenerPrendasBodega(codigo_fardo);
        setPrendasBodega(bodegaResponse.data.cantidadTotal);
      } catch (err) {
        console.error("Error en la carga inicial:", err);
        setError("Ocurrió un error al cargar los datos.");
      }
    };

    fetchData();
  }, [codigo_fardo]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!fardo || !fardo.codigo_fardo) {
    return <p className="text-red-500">Error: Falta el código del fardo.</p>;
  }

  const handleClasificar = () => {
    const selectedCategoria = isEditingCategoria ? nuevaCategoria.trim() : categoria;

    if (!cantidad || cantidad <= 0) {
      alert('Por favor, ingresa una cantidad válida.');
      return;
    }

    if (!precio || precio <= 0) {
      alert('Por favor, ingresa un precio válido.');
      return;
    }

    if (!selectedCategoria) {
      alert('Por favor, selecciona o ingresa una categoría.');
      return;
    }

    if (selectedCategoria !== categoria_origen) {
      setPendingClasification({ cantidad, precio, categoria: selectedCategoria });
      setShowConfirmModal(true);
    } else {
      realizarClasificacion({ cantidad, precio, categoria: selectedCategoria });
    }
  };

  const realizarClasificacion = async (datos) => {
    try {
      await clasificacionService.clasificarPrendas({
        codigo_fardo: fardo.codigo_fardo,
        cantidad: parseInt(datos.cantidad, 10),
        precio: parseFloat(datos.precio),
        nombre_categoria: datos.categoria,
      });

      alert('Clasificación realizada con éxito.');
      onClasificacionExitosa();
      onClose();
    } catch (err) {
      console.error('Error al clasificar prendas:', err);
      alert('Ocurrió un error al clasificar.');
    } finally {
      setShowConfirmModal(false);
      setPendingClasification(null);
    }
  };

  const handleConfirmClasificacion = () => {
    if (pendingClasification) {
      realizarClasificacion(pendingClasification);
    }
  };

  const handleCancelClasificacion = () => {
    setShowConfirmModal(false);
    setPendingClasification(null);
  };

  const ConfirmModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Categoría Diferente</h2>
        <p>
          La categoría seleccionada es diferente a la categoría de origen del fardo
          (<strong>{categoria_origen}</strong>). ¿Desea continuar?
        </p>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sí
          </button>
        </div>
      </div>
    </div>
  );

  const imprimirCodigoBarras = (codigoBarra, nombreCategoria, precio) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; }
            #barcode { margin-top: 20px; }
          </style>
        </head>
        <body>
          <p><strong>Categoría:</strong> ${nombreCategoria}</p>
          <p><strong>Precio:</strong> $${precio.toFixed(2)}</p>
          <canvas id="barcode"></canvas>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              JsBarcode("#barcode", "${codigoBarra}", {
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto relative">
      {showConfirmModal && (
        <ConfirmModal
          onConfirm={handleConfirmClasificacion}
          onCancel={handleCancelClasificacion}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clasificar Fardo: {codigo_fardo}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FaTimes size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div>
          <h3 className="text-lg font-semibold mb-4">Prendas Clasificadas</h3>
          {prendasClasificadas.length > 0 ? (
            <ul className="border p-4 rounded-md bg-gray-50">
              {prendasClasificadas.map((prenda) => (
                <li key={prenda.codigo_barra_prenda} className="flex justify-between items-center mb-4">
                  <div>
                    <p><strong>Categoría:</strong> {prenda.nombre_categoria}</p>
                    <p><strong>Precio:</strong> ${prenda.precio ? prenda.precio.toFixed(2) : 'N/A'}</p>
                    <p><strong>Cantidad:</strong> {prenda.cantidad}</p>
                  </div>
                  <button
                    onClick={() =>
                      imprimirCodigoBarras(prenda.codigo_barra_prenda, prenda.nombre_categoria, prenda.precio || 0)
                    }
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center"
                  >
                    <FaPrint size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay prendas clasificadas aún.</p>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Prendas en Bodega</h3>
            {prendasBodega > 0 ? (
              <p className="text-gray-700">Cantidad total: {prendasBodega}</p>
            ) : (
              <p className="text-gray-500">No hay prendas en estado bodega.</p>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-4">Clasificar Nuevas Prendas</h3>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-gray-700">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Precio</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Categoría</label>
              {isEditingCategoria ? (
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Escribe la nueva categoría"
                  className="w-full px-3 py-2 border rounded-md shadow-sm"
                  required
                />
              ) : (
                <select
                  value={categoria}
                  onChange={(e) => {
                    if (e.target.value === 'agregar_nueva') {
                      setIsEditingCategoria(true);
                      setNuevaCategoria('');
                    } else {
                      setCategoria(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md shadow-sm"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre_categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                  <option value="agregar_nueva">Agregar nueva categoría...</option>
                </select>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClasificar}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
              >
                Clasificar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ClasificarFardoModal.propTypes = {
  fardo: PropTypes.shape({
    codigo_fardo: PropTypes.string.isRequired,
    categoria: PropTypes.shape({
      nombre_categoria: PropTypes.string.isRequired,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onClasificacionExitosa: PropTypes.func.isRequired,
};

export default ClasificarFardoModal;
