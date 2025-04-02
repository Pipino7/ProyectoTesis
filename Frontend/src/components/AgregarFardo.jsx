import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import fardoSchema from '../Validation/fardoSchema';
import categoriaService from '../services/Categoria.services';
import fardoService from '../services/fardos.js';

const AgregarFardo = ({ onClose, onFardoAgregado }) => {
  const [categorias, setCategorias] = useState([]);
  const [isEditingCategoria, setIsEditingCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [datosResumen, setDatosResumen] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(fardoSchema),
    defaultValues: {
      fecha_adquisicion: '',
      nombre_proveedor: '',
      costo_fardo: '',
      cantidad_prendas: '',
      nombre_categoria: '',
    },
  });

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const categoriasObtenidas = await categoriaService.obtenerCategorias();
        setCategorias(categoriasObtenidas);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    cargarCategorias();
  }, []);

  const onSubmit = (data) => {
    const categoriaFinal = isEditingCategoria ? nuevaCategoria.trim() : data.nombre_categoria;
    setDatosResumen({ ...data, nombre_categoria: categoriaFinal });
    setMostrarResumen(true);
  };

  const confirmarAgregarFardo = async () => {
    const data = { ...datosResumen };

    try {
      if (isEditingCategoria && nuevaCategoria.trim()) {
        const categoriaCreada = await categoriaService.crearCategoria(nuevaCategoria);
        data.nombre_categoria = categoriaCreada.nombre_categoria;
      }

      delete data.nuevaCategoria;

      const response = await fardoService.crearFardo(data);
      alert('Fardo agregado exitosamente.');
      reset();
      setMostrarResumen(false);
      onFardoAgregado(response.codigo_fardo);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al agregar el fardo. Verifica los datos ingresados.');
    }
  };

  const cancelarAgregarCategoria = () => {
    setIsEditingCategoria(false);
    setNuevaCategoria('');
    setValue('nombre_categoria', '');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      {mostrarResumen ? (
        <div className="border rounded-lg p-5 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 border-b pb-2">Resumen de Datos</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-500 text-sm">Fecha de Adquisición</p>
              <p className="font-medium">{new Date(datosResumen.fecha_adquisicion).toLocaleDateString()}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-500 text-sm">Proveedor</p>
              <p className="font-medium">{datosResumen.nombre_proveedor}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-500 text-sm">Costo del Fardo</p>
              <p className="font-medium">${datosResumen.costo_fardo.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-gray-500 text-sm">Cantidad de Prendas</p>
              <p className="font-medium">{datosResumen.cantidad_prendas}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-sm col-span-2">
              <p className="text-gray-500 text-sm">Categoría</p>
              <p className="font-medium">{datosResumen.nombre_categoria}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setMostrarResumen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editar
            </button>
            <button
              onClick={confirmarAgregarFardo}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Confirmar y Agregar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <h2 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">Agregar Nuevo Fardo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Fecha de Adquisición</label>
              <input
                type="date"
                {...register('fecha_adquisicion')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.fecha_adquisicion && <p className="text-red-500 text-sm mt-1">{errors.fecha_adquisicion.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Proveedor</label>
              <input
                {...register('nombre_proveedor')}
                placeholder="Nombre del proveedor"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.nombre_proveedor && <p className="text-red-500 text-sm mt-1">{errors.nombre_proveedor.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Costo del Fardo
                <span className="text-xs text-gray-500 ml-1">(incrementos de 5000)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="5000"
                  {...register('costo_fardo')}
                  placeholder="0"
                  className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {errors.costo_fardo && <p className="text-red-500 text-sm mt-1">{errors.costo_fardo.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Cantidad de Prendas</label>
              <input
                type="number"
                {...register('cantidad_prendas')}
                placeholder="Ingrese la cantidad"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.cantidad_prendas && <p className="text-red-500 text-sm mt-1">{errors.cantidad_prendas.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Categoría</label>
            {isEditingCategoria ? (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => {
                    const valor = e.target.value;
                    const regex = /^[a-zA-Z\s]*$/;
                    if (regex.test(valor)) {
                      setNuevaCategoria(valor);
                      setValue('nombre_categoria', valor);
                    }
                  }}
                  placeholder="Escribe la nueva categoría"
                  autoFocus
                  onBlur={() => {
                    if (!nuevaCategoria.trim()) {
                      cancelarAgregarCategoria();
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={cancelarAgregarCategoria}
                    className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <select
                {...register('nombre_categoria')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value === 'agregar_nueva') {
                    setIsEditingCategoria(true);
                    setNuevaCategoria('');
                  } else {
                    setValue('nombre_categoria', e.target.value);
                  }
                }}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
                <option value="agregar_nueva">+ Agregar nueva categoría</option>
              </select>
            )}
            {errors.nombre_categoria && <p className="text-red-500 text-sm mt-1">{errors.nombre_categoria.message}</p>}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-200 mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Revisar Datos
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AgregarFardo;
