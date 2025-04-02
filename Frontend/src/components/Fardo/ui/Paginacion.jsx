// src/components/Fardo/ui/Paginacion.jsx
import React from 'react';

const Paginacion = ({ pagina, totalPaginas, onPageChange }) => {
  if (totalPaginas <= 1) return null;

  const irPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      onPageChange(numero);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => irPagina(pagina - 1)}
          disabled={pagina === 1}
          className={`px-3 py-2 border rounded-l-md text-sm font-medium ${
            pagina === 1
              ? 'text-gray-300 bg-white border-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100 border-gray-300'
          }`}
        >
          &laquo;
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => irPagina(num)}
            className={`px-4 py-2 border text-sm font-medium ${
              num === pagina
                ? 'bg-blue-100 text-blue-700 border-blue-400 z-10'
                : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-300'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => irPagina(pagina + 1)}
          disabled={pagina === totalPaginas}
          className={`px-3 py-2 border rounded-r-md text-sm font-medium ${
            pagina === totalPaginas
              ? 'text-gray-300 bg-white border-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100 border-gray-300'
          }`}
        >
          &raquo;
        </button>
      </nav>
    </div>
  );
};

export default Paginacion;
