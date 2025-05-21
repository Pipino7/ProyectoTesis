import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../pages/Dashboard';
import FardoModule from '../pages/FardoModule';
import PrivateRoute from '../guards/PrivateRoutes';
import NoAutorizado from '../pages/NoAutorizado';
import Pos from '../pages/Pos'; 
import PosVenta from '@/pages/PosVenta';
import ResumenHistorico from '@/components/Pos/ResumenHistorico';


import VentasLayout from '@/components/Ventas/VentasLayout';
import VentasDashboard from '@/components/Ventas/VentasDashboard';
import VentasDiarias from '@/components/Ventas/VentasDiarias';
import VentasHistorial from '@/components/Ventas/VentasHistorial';
import VentasEstadisticas from '@/components/Ventas/VentasEstadisticas';
import VentasCambiosDevoluciones from '@/components/Ventas/VentasCambiosDevoluciones';
import AnalisisVentasPorCategoria from '@/components/Ventas/AnalisisVentasPorCategoria';

import api from '../services/api';

const AppRoutes = () => {

  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    if (!token || !rol) {

      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      setUserRole(null);
      setIsLoading(false);
      return;
    }
    
    try {

      const response = await api.get('/users/verify-session');
      console.log('✅ Verificación de sesión exitosa:', response.data);
      

      if (!response.data || !response.data.data || !response.data.data.user) {
        console.error('❌ Respuesta de verificación de sesión incompleta');
        throw new Error('Respuesta de verificación incompleta');
      }
      

      const userData = response.data.data.user;
      
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Token con formato inválido');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      
      
      if (payload.id !== userData.id) {
        console.error('❌ ID de usuario en token no coincide con el devuelto por el backend');
        throw new Error('Inconsistencia en la identidad del usuario');
      }
      

      setIsAuthenticated(true);
      setUserRole(rol);
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      
      
      if (error.response && error.response.status === 401) {
        console.warn('⚠️ Usuario no encontrado en la base de datos o token inválido');
        
        
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          alert('Tu sesión ha expirado o tu usuario ya no existe. Por favor, inicia sesión nuevamente.');
        }
      }
      

      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      setUserRole(null);
      
      
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        console.log('⚠️ Redirigiendo al login desde checkAuth');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {

    checkAuth();
    

    window.addEventListener('storage', checkAuth);
    
    
    const interval = setInterval(checkAuth, 60000);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* Dashboard accesible para cualquier usuario logueado */}
      <Route path="/dashboard" element={
        <PrivateRoute isAuthenticated={isAuthenticated} userRole={userRole}>
          <Dashboard />
        </PrivateRoute>
      } />

      {/* Solo admin puede ver /fardos */}
      <Route path="/fardos" element={
        <PrivateRoute isAuthenticated={isAuthenticated} requiredRole="admin" userRole={userRole}>
          <FardoModule />
        </PrivateRoute>
      } />

      {/* Punto de venta (accesible para admin y ventas) */}
      <Route path="/pos" element={
        <PrivateRoute 
          isAuthenticated={isAuthenticated} 
          requiredRoles={['admin', 'ventas']} 
          userRole={userRole}
        >
          <Pos />
        </PrivateRoute>
      } />

      {/* Venta (accesible para admin y ventas) */}
      <Route path="/posventa" element={
        <PrivateRoute 
          isAuthenticated={isAuthenticated} 
          requiredRoles={['admin', 'ventas']} 
          userRole={userRole}
        >
          <PosVenta />
        </PrivateRoute>
      } />
      
      {/* Historial de cajas (accesible para admin y ventas) */}
      <Route path="/ResumenHistorico" element={
        <PrivateRoute 
          isAuthenticated={isAuthenticated} 
          requiredRoles={['admin', 'ventas']} 
          userRole={userRole}
        >
          <ResumenHistorico />
        </PrivateRoute>
      } />
      
      {/* Nueva estructura de Ventas con rutas anidadas */}
      <Route path="/ventas/*" element={
        <PrivateRoute 
          isAuthenticated={isAuthenticated} 
          requiredRoles={['admin', 'ventas']} 
          userRole={userRole}
        >          <Routes>
            <Route element={<VentasLayout />}>
              <Route index element={<VentasDashboard />} />
              <Route path="diarias" element={<VentasDiarias />} />
              <Route path="historial" element={<VentasHistorial />} />
              <Route path="estadisticas" element={<VentasEstadisticas />} />
              <Route path="cambios-devoluciones" element={<VentasCambiosDevoluciones />} />
              <Route path="categorias" element={<AnalisisVentasPorCategoria />} />
            </Route>
          </Routes>
        </PrivateRoute>
      } />

      {/* Ruta catch-all para cualquier otra URL no definida */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
