import axios from 'axios';

const API_URL = 'http://localhost:3200/api';  // Ajusta la URL si es necesario

// Función de login
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;  // Retorna los datos de la respuesta
  } catch (error) {
    throw error;  // Lanza el error para ser manejado por el frontend
  }
};



// Función para solicitar el restablecimiento de contraseña (envío de token al correo)
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;  // Retorna el mensaje del backend
  } catch (error) {
    throw error;
  }
};


// Función para restablecer la contraseña usando el token
export const resetPassword = async (token, nuevaPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { token, nuevaPassword });
    return response.data;  // Retorna el mensaje del backend
  } catch (error) {
    throw error;  // Lanza el error para ser manejado por el frontend
  }
};

