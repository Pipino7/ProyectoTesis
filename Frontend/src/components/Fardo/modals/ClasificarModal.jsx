import React from 'react';
import ClasificarFardoModal from './clasificacion/ClasificarFardoModal';

const ClasificarModal = ({ fardo, onClose, onClasificacionExitosa }) => {
  return fardo ? (
    <ClasificarFardoModal
      fardo={fardo}
      onClose={onClose}
      onClasificacionExitosa={onClasificacionExitosa}
    />
  ) : (
    <p className="text-center py-10 text-gray-500">Cargando datos del fardo...</p>
  );
};

export default ClasificarModal;
