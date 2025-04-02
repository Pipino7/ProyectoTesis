// components/Fardo/modals/EliminarModal.jsx
import React from 'react';

const EliminarModal = ({ fardo, onConfirm, onCancel }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
      <p>
        ¿Está seguro de que desea eliminar el fardo{' '}
        <strong>{fardo?.codigo_fardo}</strong>?
      </p>
      <div className="flex justify-end mt-4">
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default EliminarModal;
