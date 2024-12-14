import axios from './api.js';

export const login = async (email, password) => {
  const response = await axios.post(`/auth/login`, { email, password });
  return response.data; 
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`/auth/forgot-password`, { email });
  return response.data; 
};

export const resetPassword = async (token, nuevaPassword) => {
  const response = await axios.post(`/auth/reset-password`, { token, nuevaPassword });
  return response.data; 
};
