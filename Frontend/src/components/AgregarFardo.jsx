// src/components/AgregarFardo.jsx

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import fardoService from '../services/fardos'; 

const AgregarFardo = ({ onClose, onFardoAgregado }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(fardoSchema),
    defaultValues: {
      tipo_prenda: '',
      fecha_adquisicion: '',
      nombre_proveedor: '',
      costo_fardo: '',
      cantidad_prendas: '',
      precios: [{ cantidad: '', precio: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'precios',
  });

  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [datosResumen, setDatosResumen] = useState(null);

  const onSubmit = (data) => {
    const totalPrendasPrecios = data.precios.reduce(
      (acc, curr) => acc + parseInt(curr.cantidad || 0, 10),
      0
    );
    if (totalPrendasPrecios !== parseInt(data.cantidad_prendas, 10)) {
      alert(
        'La suma de las cantidades por precio debe coincidir con la cantidad total de prendas.'
      );
      return;
    }

    setDatosResumen(data);
    setMostrarResumen(true);
  };

  const confirmarAgregarFardo = async () => {
    const data = datosResumen;

    try {
      const response = await fardoService.crearFardo(data); // Usa fardoService para llamar a crearFardo

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

  const cancelarResumen = () => {
    setMostrarResumen(false);
  };

  return (
    <div>
      {mostrarResumen ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Resumen de Datos</h2>
          {datosResumen && (
            <div>
              <p><strong>Tipo de Prenda:</strong> {datosResumen.tipo_prenda}</p>
              <p><strong>Fecha de Adquisición:</strong> {new Date(datosResumen.fecha_adquisicion).toLocaleDateString()}</p>
              <p><strong>Nombre del Proveedor:</strong> {datosResumen.nombre_proveedor}</p>
              <p><strong>Costo del Fardo:</strong> ${datosResumen.costo_fardo}</p>
              <p><strong>Cantidad de Prendas:</strong> {datosResumen.cantidad_prendas}</p>
              <p><strong>Detalles de Precios:</strong></p>
              <ul className="list-disc list-inside">
                {datosResumen.precios.map((precio, index) => (
                  <li key={index}>{precio.cantidad} prendas a ${precio.precio} cada una</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button type="button" onClick={cancelarResumen} className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400 transition duration-200">
              Editar
            </button>
            <button type="button" onClick={confirmarAgregarFardo} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200">
              Confirmar y Agregar Fardo
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Agregar Fardo</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700">Tipo de Prenda</label>
              <input
                {...register('tipo_prenda')}
                className={`w-full p-2 border rounded ${
                  errors.tipo_prenda ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tipo_prenda && (
                <p className="text-red-500 text-sm mt-1">{errors.tipo_prenda.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Fecha de Adquisición</label>
              <input
                type="date"
                {...register('fecha_adquisicion')}
                className={`w-full p-2 border rounded ${
                  errors.fecha_adquisicion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fecha_adquisicion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fecha_adquisicion.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Nombre del Proveedor</label>
              <input
                {...register('nombre_proveedor')}
                className={`w-full p-2 border rounded ${
                  errors.nombre_proveedor ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombre_proveedor && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nombre_proveedor.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Costo del Fardo</label>
              <input
                type="number"
                step="0.01"
                {...register('costo_fardo')}
                className={`w-full p-2 border rounded ${
                  errors.costo_fardo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.costo_fardo && (
                <p className="text-red-500 text-sm mt-1">{errors.costo_fardo.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Cantidad de Prendas</label>
              <input
                type="number"
                {...register('cantidad_prendas')}
                className={`w-full p-2 border rounded ${
                  errors.cantidad_prendas ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cantidad_prendas && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cantidad_prendas.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Detalles de Precios</label>
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-center mb-2">
                  <input
                    type="number"
                    placeholder="Cantidad"
                    {...register(`precios.${index}.cantidad`)}
                    className={`w-1/2 p-2 border rounded mr-2 ${
                      errors.precios?.[index]?.cantidad
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    {...register(`precios.${index}.precio`)}
                    className={`w-1/2 p-2 border rounded mr-2 ${
                      errors.precios?.[index]?.precio ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition duration-200"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
              {errors.precios && typeof errors.precios.message === 'string' && (
                <p className="text-red-500 text-sm mt-1">{errors.precios.message}</p>
              )}
              <button
                type="button"
                onClick={() => append({ cantidad: '', precio: '' })}
                className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition duration-200 mt-2"
              >
                Agregar Otro Precio
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400 transition duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
              >
                Revisar Datos
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AgregarFardo;
