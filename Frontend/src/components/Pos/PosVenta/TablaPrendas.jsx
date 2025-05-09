import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';

const TablaPrendas = ({ detalle, onEliminar, onEditarDescuento, cuponSeleccionado }) => {

  return (
    <div className="overflow-x-auto shadow rounded mb-4">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-2">Código</th>
            <th className="p-2">Categoría</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Descuento</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Subtotal</th>
            <th className="p-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {detalle.map((p, i) => (
            <tr key={i} className="border-b">
            <td className="p-2">{p.codigo_barra}</td>
            <td className="p-2">{p.categoria?.nombre_categoria || p.categoria || 'Sin categoría'}</td>
              <td className="p-2">${p.precio}</td>
              <td className="p-2">
              <input
                type="number"
                value={p.descuento || 0}
                min={0}
                max={p.precio}
                disabled={!!cuponSeleccionado} 
                onChange={e => {
                  const nuevoDescuento = parseInt(e.target.value || 0, 10);
                  const descuentoFinal = Math.min(nuevoDescuento, p.precio); 
                  onEditarDescuento(p.codigo_barra, descuentoFinal);
                }}
                className={`w-20 border rounded px-2 py-1 text-right ${cuponSeleccionado ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              />

              </td>
              <td className="p-2">{p.cantidad}</td>
              <td className="p-2">
                ${ Math.max(0, p.precio - (p.descuento || 0)) * p.cantidad }
              </td>
              <td className="p-2 text-center">
                <button
                  onClick={() => onEliminar(p.codigo_barra)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar prenda"
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaPrendas;
