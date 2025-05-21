import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaCalendarDay, FaChartLine, FaHistory, FaTshirt } from 'react-icons/fa';

const VentasLayout = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-bold px-4 py-3 border-b border-gray-200 mb-4">Ventas</h2>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/ventas" 
                end
                className={({ isActive }) => `flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}
              >
                <FaChartLine className="mr-3" />
                Dashboard de Ventas
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/ventas/diarias" 
                className={({ isActive }) => `flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}
              >
                <FaCalendarDay className="mr-3" />
                Ventas Diarias
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/ventas/historial" 
                className={({ isActive }) => `flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}
              >              <FaHistory className="mr-3" />
                Historial de Ventas
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/ventas/categorias" 
                className={({ isActive }) => `flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}
              >
                <FaTshirt className="mr-3" />
                Análisis por Categorías
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default VentasLayout;