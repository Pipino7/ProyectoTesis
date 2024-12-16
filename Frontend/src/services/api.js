import axios from 'axios';


const API_URL = import.meta.env.VITE_BASE_URL || 
console.log("Base URL:", API_URL);


const api = axios.create({
  baseURL: API_URL,
});


api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');
    if (token) {
   
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expirado o no válido. Redirigiendo al login...");
      localStorage.removeItem('token'); 
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
