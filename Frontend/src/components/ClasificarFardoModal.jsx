import { useState, useEffect } from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';
import clasificacionService from '../services/Clasificar.services';
import PropTypes from 'prop-types';
import categoriaService from '../services/Categoria.services';

const ClasificarFardoModal = ({ fardo, onClose, onClasificacionExitosa }) => {
  // Estados iniciales
  const [prendasBodega, setPrendasBodega] = useState(0);
  const [prendasClasificadas, setPrendasClasificadas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isEditingCategoria, setIsEditingCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState(null);

  const { codigo_fardo } = fardo || {}; // Extraemos solo el identificador único

  useEffect(() => {
    const fetchData = async () => {
      if (!codigo_fardo) {
        console.warn("Falta el código del fardo, no se ejecutará la carga de datos.");
        return;
      }
  
      try {
        // 1. Cargar categorías
        const categoriasResponse = await categoriaService.obtenerCategorias();
        setCategorias(categoriasResponse);
  
        // 2. Cargar prendas clasificadas
        const clasificadasResponse = await clasificacionService.obtenerPrendasClasificadas(codigo_fardo);
        setPrendasClasificadas(clasificadasResponse.data);
  
        // 3. Cargar prendas en bodega
        const bodegaResponse = await clasificacionService.obtenerPrendasBodega(codigo_fardo);
        setPrendasBodega(bodegaResponse.data.cantidadTotal);
      } catch (err) {
        console.error("Error en la carga inicial:", err);
        setError("Ocurrió un error al cargar los datos.");
      }
    };
  
    fetchData();
  }, [codigo_fardo]); // Observamos únicamente el atributo necesario

// Mostrar mensaje de error en la interfaz si ocurre
if (error) {
  return <p>{error}</p>;
}

// Mostrar mensaje si falta el fardo
if (!fardo || !fardo.codigo_fardo) {
  return <p>Error: Falta el código del fardo.</p>;
}


  // Manejo de la clasificación
  const handleClasificar = async () => {
    try {
      await clasificacionService.clasificarPrendas({
        codigo_fardo: fardo.codigo_fardo,
        cantidad: parseInt(cantidad, 10),
        precio: parseFloat(precio),
        nombre_categoria: isEditingCategoria ? nuevaCategoria : categoria,
      });

      alert('Clasificación realizada con éxito.');
      onClasificacionExitosa();
      onClose();
    } catch (err) {
      console.error('Error al clasificar prendas:', err);
      alert('Ocurrió un error al clasificar.');
    }
  };
    // Mostrar error si existe
    if (error) {
      return <p>{error}</p>;
    }

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
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clasificar Fardo: {fardo.codigo_fardo}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FaTimes size={20} />
        </button>
      </div>
  
      <div className="grid grid-cols-2 gap-12">
        {/* Columna Izquierda: Prendas Clasificadas */}
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
                    <FaPrint size={16} /> {/* Ícono de impresión */}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay prendas clasificadas aún.</p>
          )}
        </div>
  
        {/* Columna Derecha: Formulario para Clasificar */}
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
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700">Cantidad</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm"
              />
            </div>
  
            <div>
              <label className="block text-gray-700">Precio</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full px-3 py-2 border rounded-md shadow-sm"
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
// Validación de las props
ClasificarFardoModal.propTypes = {
  fardo: PropTypes.shape({
    codigo_fardo: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onClasificacionExitosa: PropTypes.func.isRequired,
};

export default ClasificarFardoModal;
