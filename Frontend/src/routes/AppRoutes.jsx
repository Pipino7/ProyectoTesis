// AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Dashboard from '../pages/Dashboard';
import FardoModule from '../pages/FardoModule';  // Importamos el FardosModule
import PrivateRoute from '../guards/PrivateRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Definir la ruta raíz */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      {/* Rutas protegidas: Solo accesibles si está autenticado */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/fardos" element={<PrivateRoute><FardoModule /></PrivateRoute>} />
    </Routes>
  );
};

export default AppRoutes;
