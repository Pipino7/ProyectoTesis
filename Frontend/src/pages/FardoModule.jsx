import React, { useState, useRef } from 'react';
import FardosList from '../components/FardoList.jsx'; 
import ReactModal from 'react-modal';
import AgregarFardo from '../components/AgregarFardo';
import Barcode from 'react-barcode';
import { FaBars } from 'react-icons/fa';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const FardosModule = () => {
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [codigoFardoReciente, setCodigoFardoReciente] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precio, setPrecio] = useState([0, 1000000]); 
  const [orden, setOrden] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const fardosListRef = useRef();

  const cerrarModal = () => {
    setMostrarAgregar(false);
  };

  const handleFardoAgregado = (codigoFardo) => {
    setCodigoFardoReciente(codigoFardo);
    setMostrarAgregar(false);
    if (fardosListRef.current) {
      fardosListRef.current.cargarFardos();
    }
  };

  const imprimirCodigoBarras = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Imprimir Código de Barras</title></head>
        <body>
          <div style="text-align: center;">
            <h1>Código de Barras del Fardo</h1>
            <div id="barcode"></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      const barcodeElement = printWindow.document.getElementById('barcode');
      const barcode = document.createElement('div');
      barcodeElement.appendChild(barcode);

      import('react-dom').then((ReactDOM) => {
        ReactDOM.render(<Barcode value={codigoFardoReciente} />, barcode);
      });

      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const handleFechaInicioChange = (e) => setFechaInicio(e.target.value);
  const handleFechaFinChange = (e) => setFechaFin(e.target.value);
  const handleProveedorChange = (e) => setProveedor(e.target.value);
  const handlePrecioChange = (value) => setPrecio(value);
  const handleOrdenChange = (e) => setOrden(e.target.value);
  const toggleFiltros = () => setMostrarFiltros(!mostrarFiltros);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex">
      <div className={`fixed inset-y-0 left-0 bg-white shadow-lg p-6 transform ${mostrarFiltros ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <h2 className="text-2xl font-bold mb-4">Filtros</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Fecha Inicio</label>
          <input type="date" value={fechaInicio} onChange={handleFechaInicioChange} className="mt-1 block w-full" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Fecha Fin</label>
          <input type="date" value={fechaFin} onChange={handleFechaFinChange} className="mt-1 block w-full" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Proveedor</label>
          <input type="text" value={proveedor} onChange={handleProveedorChange} className="mt-1 block w-full" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Precio</label>
          <Slider range min={0} max={1000000} step={10000} value={precio} onChange={handlePrecioChange} />
          <div className="flex justify-between mt-2">
            <span>${precio[0]}</span><span>${precio[1]}</span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Orden</label>
          <select value={orden} onChange={handleOrdenChange} className="mt-1 block w-full">
            <option value="">Seleccionar</option>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <button onClick={toggleFiltros} className="bg-red-500 text-white px-4 py-2 rounded">Cerrar Filtros</button>
      </div>

      <div className="flex-1 ml-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <button onClick={toggleFiltros} className="text-gray-600 hover:text-gray-800">
                  <FaBars size={24} />
                </button>
                <h1 className="text-4xl font-extrabold text-gray-900 ml-4">Gestión de Fardos</h1>
              </div>
              <button onClick={() => setMostrarAgregar(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">Agregar Fardo</button>
            </div>

            <FardosList ref={fardosListRef} fechaInicio={fechaInicio} fechaFin={fechaFin} proveedor={proveedor} precioMin={precio[0]} precioMax={precio[1]} orden={orden} />
          </div>

          <ReactModal isOpen={mostrarAgregar} onRequestClose={cerrarModal} contentLabel="Agregar Fardo" overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" className="bg-white rounded-lg overflow-auto max-h-full w-full max-w-2xl mx-auto p-8">
            <AgregarFardo onClose={cerrarModal} onFardoAgregado={handleFardoAgregado} />
          </ReactModal>
        </div>
      </div>
    </div>
  );
};

export default FardosModule;
