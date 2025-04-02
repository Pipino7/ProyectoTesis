import { FaPrint, FaTshirt } from 'react-icons/fa';

const ListaClasificadas = ({ prendasClasificadas }) => {
  const imprimirCodigoBarras = (codigoBarra, nombreCategoria, precio) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; }
            #barcode { margin-top: 20px; }
          </style>
        </head>
        <body>
          <p><strong>Categoría:</strong> ${nombreCategoria}</p>
          <p><strong>Precio:</strong> $${precio.toFixed(0)}</p>
          <canvas id="barcode"></canvas>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              JsBarcode("#barcode", "${codigoBarra}", {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 18
              });
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-5 text-gray-800">Prendas Clasificadas</h3>
      {prendasClasificadas.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {prendasClasificadas
            .filter(prenda => prenda.categoria && prenda.precio && prenda.codigo_barra)
            .map((prenda, idx) => (
              <div key={idx} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-50 px-4 py-3 border-b flex justify-between items-center">
                  <span className="text-blue-800 font-medium">{prenda.categoria}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ${parseInt(prenda.precio)}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 mb-1">Código: {prenda.codigo_barra}</p>
                      <p className="text-gray-800 font-medium">{prenda.cantidad} unidades</p>
                    </div>
                    <button
                      onClick={() =>
                        imprimirCodigoBarras(prenda.codigo_barra, prenda.categoria, parseFloat(prenda.precio) || 0)
                      }
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      title="Imprimir código de barras"
                    >
                      <FaPrint size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FaTshirt className="mx-auto mb-4 text-gray-400" size={40} />
          <p className="text-gray-500">No hay prendas clasificadas aún.</p>
        </div>
      )}
    </div>
  );
};

export default ListaClasificadas;
