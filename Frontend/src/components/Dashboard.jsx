import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaShoppingCart, FaUsers, FaWarehouse } from 'react-icons/fa';

const DashboardModule = ({ icon: Icon, title, description, navigateTo }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-purple-200 transition duration-200 flex items-center"
      onClick={() => navigate(navigateTo)}
    >
      <Icon className="text-purple-700 mr-4" size={40} />
      <div>
        <h2 className="text-xl font-semibold text-purple-700">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-purple-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-purple-700 p-4 shadow-md mb-8 rounded-lg">
        <h1 className="text-3xl font-bold text-white">Dashboard de Isa Moda</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          aria-label="Cerrar Sesión"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Contenido del Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardModule
          icon={FaBoxOpen}
          title="Ver Fardos"
          description="Consulta y gestiona los fardos registrados."
          navigateTo="/fardos"
        />
        <DashboardModule
          icon={FaShoppingCart}
          title="Ver Ventas"
          description="Consulta el historial de ventas."
          navigateTo="/ventas"
        />
        <DashboardModule
          icon={FaWarehouse}
          title="Gestión de Inventario"
          description="Controla y actualiza el inventario de prendas."
          navigateTo="/inventario"
        />
        <DashboardModule
          icon={FaUsers}
          title="Gestión de Usuarios"
          description="Administra usuarios y permisos."
          navigateTo="/usuarios"
        />
      </div>
    </div>
  );
};

export default Dashboard;
