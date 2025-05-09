import { FaBoxOpen, FaShoppingCart, FaUsers, FaWarehouse, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import DashboardModule from '../components/DashboardModule';
import useLogout from '../hooks/useLogout';
import { FaCashRegister } from 'react-icons/fa'; 

const Dashboard = () => {
  const rol = localStorage.getItem('rol');
  const username = localStorage.getItem('username') || 'Usuario';
  const handleLogout = useLogout();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex">
        <div className="fixed hidden lg:flex flex-col w-64 h-screen bg-white shadow-lg z-10">
          <div className="p-5 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Isa Moda</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema de Gestión</p>
          </div>
          <div className="p-5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-full">
                <FaUsers className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium capitalize">{username}</p>
                <p className="text-xs text-gray-500 capitalize">Rol: {rol}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {(rol === 'admin') && (
                <>
                  <a href="/fardos" className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-gray-700">
                    <FaBoxOpen /> <span>Fardos</span>
                  </a>
                  <a href="/inventario" className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-gray-700">
                    <FaWarehouse /> <span>Inventario</span>
                  </a>
                  <a href="/usuarios" className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-gray-700">
                    <FaUsers /> <span>Usuarios</span>
                  </a>
                </>
              )}
              {(rol === 'ventas' || rol === 'admin') && (
                <a href="/ventas" className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-gray-700">
                  <FaShoppingCart /> <span>Ventas</span>
                </a>
              )}
            </nav>
          </div>
          <div className="mt-auto p-5 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full text-left text-gray-700 hover:text-red-600"
            >
              <FaSignOutAlt />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Cont principal */}
        <div className="lg:ml-64 w-full">
          {/* Header */}
          <header className="bg-white shadow-sm p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="lg:hidden flex items-center text-gray-700">
                <span className="text-sm font-medium">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="lg:hidden bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md transition-all"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </header>

          <div className="p-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Fardos Totales</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">128</h2>
                  </div>
                  <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                    <FaBoxOpen />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-xs">
                  <span className="text-green-500 flex items-center">
                    <FaChartLine className="mr-1" /> +12% este mes
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Ventas Mensuales</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">67</h2>
                  </div>
                  <div className="p-2 rounded-md bg-green-50 text-green-600">
                    <FaShoppingCart />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-xs">
                  <span className="text-green-500 flex items-center">
                    <FaChartLine className="mr-1" /> +5% este mes
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Inventario</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">2,459</h2>
                  </div>
                  <div className="p-2 rounded-md bg-purple-50 text-purple-600">
                    <FaWarehouse />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-xs">
                  <span className="text-green-500 flex items-center">
                    <FaChartLine className="mr-1" /> +8% este mes
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Usuarios</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{rol === 'admin' ? '12' : '-'}</h2>
                  </div>
                  <div className="p-2 rounded-md bg-amber-50 text-amber-600">
                    <FaUsers />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-xs">
                  <span className="text-gray-500 flex items-center">
                    <FaChartLine className="mr-1" /> Sin cambios
                  </span>
                </div>
              </div>
            </div>

            {/* Access Modules */}
            <h2 className="text-lg font-semibold text-gray-700 mb-5">Acceso Rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(rol === 'admin') && (
                <>
                  <DashboardModule
                    icon={FaBoxOpen}
                    title="Gestión de Fardos"
                    description="Registro, consulta y gestión de fardos."
                    navigateTo="/fardos"
                    className="bg-white hover:shadow-md border border-gray-100 shadow-sm"
                    iconClass="bg-blue-50 text-blue-600"
                  />
                  <DashboardModule
                    icon={FaWarehouse}
                    title="Inventario"
                    description="Control y actualización del inventario."
                    navigateTo="/inventario"
                    className="bg-white hover:shadow-md border border-gray-100 shadow-sm"
                    iconClass="bg-purple-50 text-purple-600"
                  />
                  <DashboardModule
                    icon={FaUsers}
                    title="Usuarios"
                    description="Administración de usuarios y permisos."
                    navigateTo="/usuarios"
                    className="bg-white hover:shadow-md border border-gray-100 shadow-sm"
                    iconClass="bg-amber-50 text-amber-600"
                  />
                </>
            )}

            {(rol === 'ventas' || rol === 'admin') && (
              <>
                <DashboardModule
                  icon={FaShoppingCart}
                  title="Ventas"
                  description="Registro y consulta de ventas."
                  navigateTo="/ventas"
                  className="bg-white hover:shadow-md border border-gray-100 shadow-sm"
                  iconClass="bg-green-50 text-green-600"
                />
                <DashboardModule
                  icon={FaCashRegister}
                  title="POS"
                  description="Punto de venta en tiempo real."
                  navigateTo="/pos"
                  className="bg-white hover:shadow-md border border-gray-100 shadow-sm"
                  iconClass="bg-pink-50 text-pink-600"
                />
              </>
            )}
            </div>
          </div>

          <footer className="mt-8 text-center text-gray-500 text-xs p-4 border-t border-gray-100">
            <p>© 2024 Isa Moda - Sistema de Gestión</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;