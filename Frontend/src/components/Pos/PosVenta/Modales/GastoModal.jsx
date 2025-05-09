import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import gastoService from '@/services/gasto.services';

const GastoModal = ({ isOpen, onClose }) => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!monto || !descripcion) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      

      await gastoService.crearGasto({
        monto: parseFloat(monto),
        motivo: descripcion, 
        metodo_pago: metodoPago,
        tipo: 'caja' 
      });
      
      toast.success('Gasto registrado correctamente');
      

      setMonto('');
      setDescripcion('');
      setMetodoPago('efectivo');
      onClose();
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white p-4 rounded-md mx-auto my-20 max-w-md"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex"
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-bold">Registrar Gasto</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
              Monto ($) *
            </label>
            <input
              type="number"
              id="monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-700">
              Método de Pago *
            </label>
            <select
              id="metodoPago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          
          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-200 py-2 px-4 rounded-md text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 py-2 px-4 rounded-md text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default GastoModal;