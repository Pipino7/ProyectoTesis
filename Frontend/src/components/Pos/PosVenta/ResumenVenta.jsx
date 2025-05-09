import React from 'react';

const ResumenVenta = ({ total, detalle }) => {
  const totalDescuento = detalle.reduce((sum, p) => sum + (p.descuento || 0) * p.cantidad, 0);

  return (
    <div className="bg-white shadow rounded p-4 mt-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">🧾 Resumen</h2>

      <div className="flex justify-between text-gray-600 mb-2">
        <span>Total Bruto:</span>
        <span>${total + totalDescuento}</span>
      </div>

      <div className="flex justify-between text-red-600 mb-2">
        <span>Descuentos:</span>
        <span>- ${totalDescuento}</span>
      </div>

      <div className="flex justify-between text-gray-800 font-bold text-lg">
        <span>Total Neto:</span>
        <span>${total}</span>
      </div>
    </div>
  );
};

export default ResumenVenta;
