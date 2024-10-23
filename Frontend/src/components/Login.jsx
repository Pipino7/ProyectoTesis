// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';  // Importa la función de login
import InputField from '../components/InputField';  // Importa el componente reutilizable
import { FaSpinner } from 'react-icons/fa';  // Para el indicador de carga

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');  // Para manejar errores
  const [loading, setLoading] = useState(false);  // Indicador de carga
  const [showResetLink, setShowResetLink] = useState(false);  // Para mostrar el enlace de restablecer contraseña
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResetLink(false);

    // Validación básica en el frontend
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.token);  // Guarda el token en el localStorage
      navigate('/dashboard');  // Redirige al dashboard
    } catch (error) {
      setError('Correo electrónico o contraseña incorrectos.');  // Establece el mensaje de error
      setShowResetLink(true);  // Muestra el enlace de restablecer contraseña
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-100">
      {/* Contenedor principal con tonos rosados */}
      <div className="w-full max-w-md bg-pink-200 rounded-lg shadow-lg p-8 m-4">
        <div className="bg-pink-50 bg-opacity-90 p-6 rounded-lg">
          {/* Logo o nombre de la tienda */}
          <div className="flex justify-center mb-4">
            <img src="/path/to/your/logo.png" alt="Isa Moda" className="h-16" />
          </div>
          {/* Mensaje de bienvenida */}
          <h2 className="text-2xl mb-4 text-center text-pink-800 font-semibold">¡Bienvenido a Isa Moda!</h2>
          <p className="text-center text-pink-600 mb-6">Ingresa tus datos para continuar</p>
          {/* Muestra el error si existe */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <InputField
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon="email"
            />
            <InputField
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon="lock"
            />
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded mt-4 flex items-center justify-center transition duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Iniciando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
          {/* Enlaces adicionales */}
          <div className="mt-6 flex justify-between items-center">
            <a
              href="/register"
              className="text-pink-700 hover:underline text-sm"
            >
              Crear una cuenta
            </a>
            {showResetLink && (
              <a
                href="/forgot-password"
                className="text-pink-700 hover:underline text-sm"
              >
                ¿Olvidaste tu contraseña?
              </a>
            )}
          </div>
          {}
        </div>
      </div>
    </div>
  );
};

export default Login;
