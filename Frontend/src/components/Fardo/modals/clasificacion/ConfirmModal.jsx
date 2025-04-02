import { FaTag } from 'react-icons/fa';

const ConfirmModal = ({ categoria_origen, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all scale-100 animate-fadeIn">
        <div className="flex items-center mb-4 text-amber-600">
          <FaTag className="mr-2" size={20} />
          <h2 className="text-xl font-semibold">Categoría Diferente</h2>
        </div>
        <p className="text-gray-700 mb-3">La categoría seleccionada es diferente a la categoría de origen del fardo:</p>
        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
          <p className="font-medium">{categoria_origen}</p>
        </div>
        <p className="mb-4">¿Desea continuar con la clasificación?</p>
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            onClick={onCancel} 
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
