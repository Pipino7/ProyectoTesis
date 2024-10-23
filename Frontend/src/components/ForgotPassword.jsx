import React, { useState } from 'react';
import { forgotPassword } from '../services/auth';  // Importamos el servicio de restablecimiento

const ForgotPassword = () => {
  const [email, setEmail] = useState('');  // Estado para almacenar el correo
  const [message, setMessage] = useState('');  // Mensaje para mostrar en la interfaz
  const [error, setError] = useState('');  // Estado para almacenar errores

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);  // Llama al servicio para enviar el correo de restablecimiento
      setMessage('Si el correo está en nuestro sistema, recibirás un enlace para restablecer tu contraseña.');  // Mensaje de confirmación
      setError('');  // Limpiamos el error
    } catch (error) {
      setError('Hubo un problema al procesar la solicitud. Inténtalo de nuevo.');  // Manejo de errores
      setMessage('');  // Limpiamos el mensaje de éxito
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl mb-6 text-center">Restablecer Contraseña</h2>
        {message && <p className="text-green-500 mb-4">{message}</p>}  {/* Muestra el mensaje de confirmación */}
        {error && <p className="text-red-500 mb-4">{error}</p>}  {/* Muestra el error si ocurre */}
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}  // Actualiza el estado de correo
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Enviar enlace de restablecimiento
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
