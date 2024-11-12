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
    setDatosResumen({ ...data, nuevaCategoria });
    setMostrarResumen(true);
  };

  const confirmarAgregarFardo = async () => {
    const data = datosResumen;

    // Si hay una nueva categoría, envíala al backend
    if (nuevaCategoria) {
      try {
        const categoriaCreada = await categoriaService.crearCategoria(nuevaCategoria);
        data.nombre_categoria = categoriaCreada.nombre_categoria; // Actualiza con el valor creado
        setNuevaCategoria('');
      } catch (error) {
        console.error('Error al crear nueva categoría:', error);
        alert('Error al agregar la nueva categoría. Intenta nuevamente.');
        return;
      }
    }

    try {
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {mostrarResumen ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Resumen de Datos</h2>
          <p><strong>Fecha de Adquisición:</strong> {new Date(datosResumen.fecha_adquisicion).toLocaleDateString()}</p>
          <p><strong>Proveedor:</strong> {datosResumen.nombre_proveedor}</p>
          <p><strong>Costo del Fardo:</strong> ${datosResumen.costo_fardo}</p>
          <p><strong>Cantidad de Prendas:</strong> {datosResumen.cantidad_prendas}</p>
          <p><strong>Categoría:</strong> {datosResumen.nombre_categoria || nuevaCategoria}</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setMostrarResumen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition duration-200"
            >
              Editar
            </button>
            <button
              onClick={confirmarAgregarFardo}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            >
              Confirmar y Agregar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">Fecha de Adquisición</label>
            <input
              type="date"
              {...register('fecha_adquisicion')}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
            />
            {errors.fecha_adquisicion && <p className="text-red-500 text-sm">{errors.fecha_adquisicion.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Proveedor</label>
            <input
              {...register('nombre_proveedor')}
              placeholder="Proveedor"
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
            />
            {errors.nombre_proveedor && <p className="text-red-500 text-sm">{errors.nombre_proveedor.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Costo del Fardo</label>
            <input
              type="number"
              step="5000"
              {...register('costo_fardo')}
              placeholder="Costo del Fardo (incrementos de 5000)"
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
            />
            {errors.costo_fardo && <p className="text-red-500 text-sm">{errors.costo_fardo.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Cantidad de Prendas</label>
            <input
              type="number"
              {...register('cantidad_prendas')}
              placeholder="Cantidad de Prendas"
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
            />
            {errors.cantidad_prendas && <p className="text-red-500 text-sm">{errors.cantidad_prendas.message}</p>}
          </div>

          <div>
  <label className="block text-gray-700">Categoría</label>
  {isEditingCategoria ? (
    <input
      type="text"
      value={nuevaCategoria}
      onChange={(e) => {
        // Permitir solo letras
        const regex = /^[a-zA-Z\s]*$/;
        if (regex.test(e.target.value)) {
          setNuevaCategoria(e.target.value);
        }
      }}
      placeholder="Escribe la nueva categoría"
      autoFocus // Habilita automáticamente el enfoque al seleccionar "Agregar nueva categoría"
      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
    />
  ) : (
    <select
      {...register('nombre_categoria')}
      className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm"
      onChange={(e) => {
        if (e.target.value === 'agregar_nueva') {
          setIsEditingCategoria(true);
          setNuevaCategoria(''); // Limpia el campo para escribir
        } else {
          setValue('nombre_categoria', e.target.value);
        }
      }}
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
  {errors.nombre_categoria && <p className="text-red-500 text-sm">{errors.nombre_categoria.message}</p>}
</div>


          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 mr-2"
            >
              Revisar Datos
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AgregarFardo;
