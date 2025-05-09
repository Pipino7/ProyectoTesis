import React from 'react';

const MetodosPago = ({ metodosPago, pago, handleInputPago, fillAll, tipoVenta, total }) => {
  if (!metodosPago?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Pagos por método</p>
      {metodosPago.map(metodo => {
        const sumaSin = Object.entries(pago)
          .filter(([m]) => m !== metodo)
          .reduce((acc, [, val]) => acc + (parseInt(val) || 0), 0);
        const restante = tipoVenta !== 'contado' ? 0 : total - sumaSin;
        return (
          <div key={metodo} className="flex items-center gap-2">
            <label className="text-sm capitalize w-20">{metodo}</label>
            <input
              type="number"
              value={pago[metodo] || ''}
              onChange={e => handleInputPago(metodo, e.target.value)}
              className="flex-1 border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => fillAll(metodo)}
              className="text-blue-600 underline text-sm"
            >
              Todo
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default MetodosPago;