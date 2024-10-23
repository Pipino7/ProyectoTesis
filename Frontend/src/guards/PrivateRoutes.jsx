import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente que verifica si el usuario está autenticado
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');  // Verifica si el token está en localStorage

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" />;
  }

  // Si hay token, renderiza el componente hijo (Dashboard)
  return children;
};

export default PrivateRoute;
