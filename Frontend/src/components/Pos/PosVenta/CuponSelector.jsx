import React, { useEffect } from 'react';

const CuponSelector = ({ cupones, detalle, cuponSeleccionado, setCuponSeleccionado, aplicarCupon }) => {
  useEffect(() => {
    console.log("🧩 CuponSelector - Datos recibidos:", { 
      cupones: cupones?.length || 0, 
      detalle: detalle?.length || 0,
      mostrandoSelector: !!(cupones?.length && detalle?.length)
    });
  }, [cupones, detalle]);

  if (!cupones?.length || !detalle.length) return null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-600 mb-1">Cupón</label>
      <select
        value={cuponSeleccionado}
        onChange={e => {
          const val = e.target.value;
          setCuponSeleccionado(val);
          aplicarCupon(val);
        }}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">-- Selecciona un cupón --</option>
        {cupones.map(c => (
          <option key={c.id} value={c.codigo}>
            {c.codigo} — {c.descripcion}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CuponSelector;
