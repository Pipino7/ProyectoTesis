import React from 'react';
import { FaBoxOpen, FaShoppingCart, FaUsers, FaWarehouse } from 'react-icons/fa';
import DashboardModule from '../components/DashboardModule';
import useLogout from '../hooks/useLogout';

const Dashboard = () => {
  const handleLogout = useLogout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-6 shadow-lg mb-8 rounded-xl border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-1 bg-blue-600 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Isa Moda</h1>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 lg:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center space-x-2 shadow-md hover:shadow-lg"
          aria-label="Cerrar Sesión"
        >
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Contenido del Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardModule
          icon={FaBoxOpen}
          title="Ver Fardos"
          description="Consulta y gestiona los fardos registrados."
          navigateTo="/fardos"
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        />
        <DashboardModule
          icon={FaShoppingCart}
          title="Ver Ventas"
          description="Consulta el historial de ventas."
          navigateTo="/ventas"
          className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        />
        <DashboardModule
          icon={FaWarehouse}
          title="Gestión de Inventario"
          description="Controla y actualiza el inventario de prendas."
          navigateTo="/inventario"
          className="bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900"
        />
        <DashboardModule
          icon={FaUsers}
          title="Gestión de Usuarios"
          description="Administra usuarios y permisos."
          navigateTo="/usuarios"
          className="bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950"
        />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>© 2024 Isa Moda - Sistema de Gestión</p>
      </div>
    </div>
  );
};

export default Dashboard;