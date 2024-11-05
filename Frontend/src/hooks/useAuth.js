import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

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
      const response = await login(email, password);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      setError('Correo electrónico o contraseña incorrectos.');
      setShowResetLink(true);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error, showResetLink, setError };
};

export default useAuth;
