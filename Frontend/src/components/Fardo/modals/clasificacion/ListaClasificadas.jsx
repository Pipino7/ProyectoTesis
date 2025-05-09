import { FaPrint, FaTshirt } from 'react-icons/fa';

const ListaClasificadas = ({ prendasClasificadas }) => {
  const imprimirCodigoBarras = (codigoBarra, nombreCategoria, precio) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: 29mm 90.3mm; margin: 0; }
            body {
              width: 29mm; height: 90.3mm;
              margin: 0; padding: 0;
              display: flex; flex-direction: column;
              align-items: center; justify-content: space-around;
              font-family: Arial, sans-serif;
              box-sizing: border-box;
            }
            p { margin: 0; font-size: 10pt; }
            svg#barcode { width: 27mm; height: auto; }
          </style>
        </head>
        <body>
          <p><strong>Categoría:</strong> ${nombreCategoria}</p>
          <p><strong>Precio:</strong> $${precio.toFixed(0)}</p>
          <svg id="barcode"></svg>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              JsBarcode("#barcode", "${codigoBarra}", {
                format: "CODE128",
                displayValue: true,
                fontSize: 12,
                margin: 0,
                xmlDocument: document
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
            {[...prendasClasificadas]
              .filter(prenda => prenda.categoria && prenda.precio && prenda.codigo_barra)
              .sort((a, b) => b.codigo_barra.localeCompare(a.codigo_barra))
              .map((prenda, idx) => (
              <div
                key={idx}
                className={`rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border ${
                  prenda.disponibles === 0 ? 'bg-gray-50 border-red-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="bg-blue-50 px-4 py-3 border-b flex justify-between items-center">
                  <span className="text-blue-800 font-medium">{prenda.categoria}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ${parseInt(prenda.precio, 10)}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                    <p className="text-gray-500 mb-1">
                        Código: {prenda.codigo_barra}
                        {prenda.disponibles === 0 && (
                          <span className="ml-2 text-red-600 text-xs font-semibold">(Todas vendidas)</span>
                        )}
                    </p>

                      {/* Ahora muestro el histórico de clasificadas */}
                      <p className="text-gray-800 font-medium">
                        Clasificadas: {prenda.clasificadas} unidad{prenda.clasificadas !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    {prenda.disponibles === 0 ? (
  <span className="text-red-500 text-sm font-semibold">Agotado</span>
) : (
  <button
    onClick={() =>
      imprimirCodigoBarras(
        prenda.codigo_barra,
        prenda.categoria,
        parseFloat(prenda.precio) || 0
      )
    }
    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
    title="Imprimir código de barras"
  >
    <FaPrint size={16} />
  </button>
)}

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
