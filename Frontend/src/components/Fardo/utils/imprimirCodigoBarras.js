// components/Fardo/utils/imprimirCodigoBarras.js
const imprimirCodigoBarras = (codigo_barra_fardo, nombre_categoria, codigo_fardo) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Impresión</title>
          <style>
            body { text-align: center; font-family: Arial; }
            #barcode { margin-top: 20px; }
          </style>
        </head>
        <body>
          <p><strong>Fardo:</strong> ${codigo_fardo}</p>
          <p><strong>Categoría:</strong> ${nombre_categoria}</p>
          <canvas id="barcode"></canvas>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode", "${codigo_barra_fardo}", {
              format: "CODE128",
              width: 2,
              height: 100,
              displayValue: true,
              fontSize: 18
            });
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  export default imprimirCodigoBarras;
  