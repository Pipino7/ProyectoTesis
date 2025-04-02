import { useRef, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import FardoContext from '@/context/FardoContext';
const { useFardoContext } = FardoContext;

export default function FiltrosFardos() {
  const {
    filtros,
    setFiltros,
    mostrarFiltros,
    setMostrarFiltros,
    setPagina,
  } = useFardoContext();

  const ref = useRef();

  // Cierra el panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setMostrarFiltros(false);
      }
    };

    if (mostrarFiltros) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarFiltros, setMostrarFiltros]);

  // Solo renderiza el panel cuando está activo
  if (!mostrarFiltros) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Fondo semitransparente */}
      <div className="fixed inset-0 bg-black bg-opacity-25 z-40" />
      {/* Panel de filtros */}
      <div
        ref={ref}
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-50 translate-x-0"
      >
        <h2 className="text-2xl font-bold mb-4">Filtros</h2>

        {/* Campo Código */}
        <div className="mb-4">
          <label className="block text-gray-700">Código de Fardo</label>
          <input
            type="text"
            name="codigo"
            value={filtros.codigo}
            onChange={(e) => {
              const { name, value } = e.target;
              setFiltros((prev) => ({ ...prev, [name]: value }));
              setPagina(1);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Campo Fecha Inicio */}
        <div className="mb-4">
          <label className="block text-gray-700">Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={(e) => {
              const { name, value } = e.target;
              setFiltros((prev) => ({ ...prev, [name]: value }));
              setPagina(1);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Campo Fecha Fin */}
        <div className="mb-4">
          <label className="block text-gray-700">Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={filtros.fechaFin}
            onChange={(e) => {
              const { name, value } = e.target;
              setFiltros((prev) => ({ ...prev, [name]: value }));
              setPagina(1);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Campo Proveedor */}
        <div className="mb-4">
          <label className="block text-gray-700">Proveedor</label>
          <input
            type="text"
            name="proveedor"
            value={filtros.proveedor}
            onChange={(e) => {
              const { name, value } = e.target;
              setFiltros((prev) => ({ ...prev, [name]: value }));
              setPagina(1);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* Slider de Precio */}
        <div className="mb-4">
          <label className="block text-gray-700">Precio</label>
          <Slider
            range
            min={0}
            max={1000000}
            step={10000}
            value={filtros.precio}
            onChange={(value) => {
              setFiltros((prev) => ({ ...prev, precio: value }));
              setPagina(1);
            }}
            className="mt-2"
          />
          <div className="flex justify-between mt-2">
            <span>${filtros.precio[0]}</span>
            <span>${filtros.precio[1]}</span>
          </div>
        </div>

        {/* Orden */}
        <div className="mb-4">
          <label className="block text-gray-700">Orden</label>
          <select
            name="orden"
            value={filtros.orden}
            onChange={(e) => {
              const { name, value } = e.target;
              setFiltros((prev) => ({ ...prev, [name]: value }));
              setPagina(1);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Seleccionar</option>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>
    </div>
  );
}
