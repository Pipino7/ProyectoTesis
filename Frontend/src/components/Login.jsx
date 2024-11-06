// Login.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';  
import InputField from '../components/InputField';    
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, loading, error, showResetLink, setError } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    handleLogin(email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-100">
      <div className="w-full max-w-md bg-pink-200 rounded-lg shadow-lg p-8 m-4">
        <div className="bg-pink-50 bg-opacity-90 p-6 rounded-lg">
          <h2 className="text-2xl mb-4 text-center text-pink-800 font-semibold">¡Bienvenido a Isa Moda!</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            {}
            <InputField
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              IconComponent={FaEnvelope}  // Le pasamos el icono 
            />
            {/* Campo de contraseña con icono de candado */}
            <InputField
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              IconComponent={FaLock}  // Le pasamos el icono 
            />
            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded mt-4 flex items-center justify-center transition duration-300"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
