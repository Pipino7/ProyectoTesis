import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../pages/Dashboard';
import FardoModule from '../pages/FardoModule';
import PrivateRoute from '../guards/PrivateRoutes';
import NoAutorizado from '../pages/NoAutorizado'; // Pantalla para rol no permitido

const AppRoutes = () => {
const rol = localStorage.getItem('rol');

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard accesible para cualquier usuario logueado */}
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />

      {/* Solo admin puede ver /fardos */}
      <Route path="/fardos" element={
        rol === 'admin'
          ? <PrivateRoute><FardoModule /></PrivateRoute>
          : <Navigate to="/no-autorizado" />
      } />

      {/* Ruta para mostrar mensaje si no tiene permiso */}
      <Route path="/no-autorizado" element={<NoAutorizado />} />
    </Routes>
  );
};

export default AppRoutes;
