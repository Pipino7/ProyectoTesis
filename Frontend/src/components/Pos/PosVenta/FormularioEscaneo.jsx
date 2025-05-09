import React, { useRef, useState } from 'react';
import ventaService from '@/services/venta.services'; 
import { FaBarcode, FaPlus } from 'react-icons/fa';

const FormularioEscaneo = ({ onAgregarPrenda }) => {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null); 

  const manejarEscaneo = async (e) => {
    e.preventDefault();
    setError('');

    if (!codigo.trim()) return;

    try {
      const prenda = await ventaService.validarPrenda(codigo.trim());
      onAgregarPrenda({
        codigo_barra: prenda.codigo_barra,
        precio: prenda.precio,
        categoria: prenda.categoria,
        disponibles: prenda.disponibles
      });      
      setCodigo('');
    } catch (err) {
      setError('❌ Prenda no encontrada o no disponible');
    } finally {

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50); 
    }
  };

  return (
    <form onSubmit={manejarEscaneo} className="bg-gray-50 p-8 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaBarcode className="text-blue-600" />
        Escaneo de Prendas
      </h3>
      <div className="flex items-center gap-4">
        <input
          ref={inputRef} // ✅ Aquí se conecta el ref
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Escanea o escribe el código de barra"
          className="flex-1 border border-gray-300 px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          autoFocus
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
        >
          <FaPlus />
          Agregar
        </button>
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-600 flex items-center">
          {error}
        </p>
      )}
    </form>
  );
};

export default FormularioEscaneo;

