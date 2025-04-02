import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/services'; // ← aquí el cambio

const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetLink, setShowResetLink] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setError('');
    setShowResetLink(false);
    setLoading(true);
    
    try {
      const response = await auth.login(email, password); // ← cambio aquí
      console.log('🎯 Datos finales recibidos:', response);

      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('rol', usuario.rol_usuario);

      const rol = usuario.rol_usuario;

      if (rol === 'admin') {
        navigate('/dashboard');
      } else if (rol === 'ventas') {
        navigate('/pos');
      } else {
        navigate('/no-autorizado');
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      setError('Correo electrónico o contraseña incorrectos.');
      setShowResetLink(true);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error, showResetLink, setError };
};

export default useAuth;
