import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaArrowLeft, FaRedoAlt, FaCalendarAlt } from 'react-icons/fa';

import useResumenCajas from './useResumenCajas';
import ResumenCajasTable from './ResumenCajasTable';


const ResumenHistorico = () => {
  const { cajas, loading, error, refresh } = useResumenCajas();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)} 
                className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Volver"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaChartBar className="text-blue-600 mr-3" />
                Historial de Cajas Cerradas
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 flex items-center">
                <FaCalendarAlt className="mr-2" />
                {new Date().toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <button 
                onClick={refresh}
                className="ml-2 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded transition-colors flex items-center"
                title="Actualizar datos"
              >
                <FaRedoAlt />
                <span className="ml-2">Actualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información contextual */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h2 className="text-lg font-medium text-blue-800 mb-1">
            Historial de registros de caja
          </h2>
          <p className="text-blue-700">
            Aquí se muestran todas las cajas que han sido cerradas, incluyendo información sobre 
            fechas, montos, ventas realizadas y observaciones. Los registros se muestran en orden cronológico,
            con los cierres más recientes primero.
          </p>
        </div>

        {/* Estado de carga */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando registros históricos...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={refresh} 
              className="mt-2 text-red-600 hover:text-red-800 flex items-center"
            >
              <FaRedoAlt className="mr-1" /> Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Resumen */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-gray-700">
                <p>Se encontraron <strong>{cajas.length}</strong> registros de cajas cerradas.</p>
              </div>
            </div>
            
            {/* Tabla de cajas */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ResumenCajasTable cajas={cajas} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumenHistorico;