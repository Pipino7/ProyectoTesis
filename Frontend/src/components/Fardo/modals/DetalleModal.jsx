import React from 'react';

const DetalleModal = ({ fardo, onClose }) => {
  if (!fardo) return <p>Cargando detalles del fardo...</p>;

  const categoria = typeof fardo.categoria?.nombre_categoria === 'object'
    ? fardo.categoria.nombre_categoria.nombre_categoria
    : fardo.categoria?.nombre_categoria || 'N/A';

  const proveedor = typeof fardo.proveedor?.nombre_proveedor === 'object'
    ? fardo.proveedor.nombre_proveedor.nombre_proveedor
    : fardo.proveedor?.nombre_proveedor || 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-semibold text-gray-800">📦 Detalle del Fardo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl transition"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Código del Fardo" value={fardo.codigo_fardo} />
          <Field label="Código de Barras" value={fardo.codigo_barra_fardo || 'N/A'} />
          <Field label="Costo del Fardo" value={`$${fardo.costo_fardo}`} note="Valor total del fardo con IVA incluido." />
          <Field
            label="Costo Unitario por Prenda"
            value={
              fardo.costo_fardo && fardo.cantidad_prendas
                ? `$${parseFloat(fardo.costo_fardo / fardo.cantidad_prendas).toFixed(2)}`
                : 'N/A'
            }
            note="Se calcula automáticamente dividiendo el costo entre la cantidad."
          />
          <Field label="Cantidad de Prendas" value={fardo.cantidad_prendas} />
          <Field label="Proveedor" value={proveedor} />
          <Field label="Categoría" value={categoria} />
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente reutilizable para cada campo
const Field = ({ label, value, note }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-lg text-gray-900 font-semibold mt-1">{value}</span>
    {note && <span className="text-xs text-gray-400 mt-1">{note}</span>}
  </div>
);

export default DetalleModal;
