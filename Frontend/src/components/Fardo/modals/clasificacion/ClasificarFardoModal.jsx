import { useState, useEffect } from 'react';
import { FaTimes, FaBoxOpen } from 'react-icons/fa';
import { clasificacionService, categoriaService } from '@/services';
import Tabs from './Tabs';
import FormularioClasificar from './FormularioClasificar';
import ListaClasificadas from './ListaClasificadas';
import ConfirmModal from './ConfirmModal';

const ClasificarFardoModal = ({ fardo, onClose, onClasificacionExitosa }) => {
  const [prendasBodega, setPrendasBodega] = useState(0);
  const [prendasClasificadas, setPrendasClasificadas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isEditingCategoria, setIsEditingCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingClasification, setPendingClasification] = useState(null);
  const [activeTab, setActiveTab] = useState('clasificar');
  const [error, setError] = useState(null);

  const { codigo_fardo, categoria: categoriaObj } = fardo || {};
  const categoria_origen = categoriaObj?.nombre_categoria || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!codigo_fardo) return;

      try {

        const categoriasResponse = await categoriaService.obtenerCategorias();
        setCategorias(categoriasResponse);


        const resumen = await clasificacionService.obtenerResumenConHistorico(codigo_fardo);
        setPrendasClasificadas(resumen);


        const bodegaResponse = await clasificacionService.obtenerPrendasBodega(codigo_fardo);
        setPrendasBodega(bodegaResponse.data.cantidadTotal);
      } catch (err) {
        console.error("Error en la carga inicial:", err);
        setError("Ocurrió un error al cargar los datos.");
      }
    };

    fetchData();
  }, [codigo_fardo]);

  const handleClasificar = () => {
    const selectedCategoria = isEditingCategoria ? nuevaCategoria.trim() : categoria;
    if (!cantidad || cantidad <= 0) return alert('Por favor, ingresa una cantidad válida.');
    if (!precio || precio <= 0) return alert('Por favor, ingresa un precio válido.');
    if (!selectedCategoria) return alert('Por favor, selecciona o ingresa una categoría.');

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


      const resumen = await clasificacionService.obtenerResumenConHistorico(codigo_fardo);
      setPrendasClasificadas(resumen);


      const bodegaResponse = await clasificacionService.obtenerPrendasBodega(codigo_fardo);
      setPrendasBodega(bodegaResponse.data.cantidadTotal);

      setCantidad('');
      setPrecio('');
      setCategoria('');
      alert('Clasificación realizada con éxito.');
      onClasificacionExitosa();
    } catch (err) {
      console.error('Error al clasificar prendas:', err);
      alert('Ocurrió un error al clasificar.');
    } finally {
      setShowConfirmModal(false);
      setPendingClasification(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideIn">
        {showConfirmModal && (
          <ConfirmModal
            categoria_origen={categoria_origen}
            onConfirm={() => realizarClasificacion(pendingClasification)}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5">
          <div className="flex items-center">
            <FaBoxOpen size={24} className="mr-3" />
            <h2 className="text-2xl font-bold">Fardo #{codigo_fardo}</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          prendasBodega={prendasBodega}
          totalClasificadas={prendasClasificadas.length}
        />

        {/* Content */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          {activeTab === 'clasificar' ? (
            <FormularioClasificar
              categorias={categorias}
              categoria={categoria}
              setCategoria={setCategoria}
              isEditingCategoria={isEditingCategoria}
              setIsEditingCategoria={setIsEditingCategoria}
              nuevaCategoria={nuevaCategoria}
              setNuevaCategoria={setNuevaCategoria}
              cantidad={cantidad}
              setCantidad={setCantidad}
              precio={precio}
              setPrecio={setPrecio}
              onSubmit={handleClasificar}
            />
          ) : (
            <ListaClasificadas prendasClasificadas={prendasClasificadas} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClasificarFardoModal;
