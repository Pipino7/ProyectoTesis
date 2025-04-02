import FardoActions from './ui/FardoActions';

const FardoRow = ({
  fardo,
  prendasClasificadas = 0,
  onVer,
  onClasificar,
  onEliminar,
  onImprimir,
}) => {
  const totalPrendas = fardo.cantidad_prendas || 0;

  const categoria = typeof fardo.categoria?.nombre_categoria === 'object'
    ? fardo.categoria.nombre_categoria.nombre_categoria
    : fardo.categoria?.nombre_categoria || 'N/A';

  const proveedor = typeof fardo.proveedor?.nombre_proveedor === 'object'
    ? fardo.proveedor.nombre_proveedor.nombre_proveedor
    : fardo.proveedor?.nombre_proveedor || 'N/A';

  const progreso = totalPrendas > 0 ? (prendasClasificadas / totalPrendas) * 100 : 0;
  const barraColor =
    prendasClasificadas === totalPrendas && totalPrendas > 0
      ? 'bg-green-500'
      : prendasClasificadas > 0
      ? 'bg-yellow-500'
      : 'bg-gray-300';

  return (
    <tr className="hover:bg-gray-50 transition duration-200">
      <td className="py-2 px-4 border-b">{fardo.codigo_fardo}</td>
      <td className="py-2 px-4 border-b">{categoria}</td>
      <td className="py-2 px-4 border-b">{proveedor}</td>
      <td className="py-2 px-4 border-b">
        <p className="text-sm font-medium text-gray-700">
          {prendasClasificadas}/{totalPrendas} prendas clasificadas
        </p>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden relative mt-1">
          <div className={`h-full rounded-full ${barraColor}`} style={{ width: `${progreso}%` }}></div>
        </div>
      </td>
      <td className="py-2 px-2 border-b">
        <FardoActions
          fardo={fardo}
          onVer={onVer}
          onClasificar={onClasificar}
          onEliminar={onEliminar}
          onImprimir={onImprimir}
        />
      </td>
    </tr>
  );
};

export default FardoRow;
