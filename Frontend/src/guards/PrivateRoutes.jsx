import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';


const PrivateRoute = ({ 
  children, 
  isAuthenticated, 
  requiredRole, 
  requiredRoles, 
  userRole 
}) => {
  useEffect(() => {
  
    const verifySessionOnMount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token disponible');
        }
        

        await api.get('/users/verify-session');
      } catch (error) {
        console.error('❌ Error verificando sesión en PrivateRoute:', error);

        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        window.location.href = '/login';
      }
    };
    
    verifySessionOnMount();
  }, []);

  if (!isAuthenticated) {
    console.log('⚠️ Acceso denegado: Usuario no autenticado');

    return <Navigate to="/login" />;
  }

  
  if (requiredRole && userRole !== requiredRole) {
    console.log(`⚠️ Acceso denegado: Se requiere rol '${requiredRole}', usuario tiene '${userRole}'`);
    return <Navigate to="/no-autorizado" />;
  }


  if (requiredRoles && !requiredRoles.includes(userRole)) {
    console.log(`⚠️ Acceso denegado: Se requiere uno de [${requiredRoles.join(', ')}], usuario tiene '${userRole}'`);
    return <Navigate to="/no-autorizado" />;
  }

 
  return children;
};

export default PrivateRoute;
