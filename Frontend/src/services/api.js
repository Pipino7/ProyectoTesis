import axios from 'axios';


const API_URL = import.meta.env.VITE_BASE_URL; 
console.log("🌐 API_URL detectada:", API_URL); // 👈 Añade esta línea
const api = axios.create({
  baseURL: API_URL,
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('Intentando hacer una solicitud sin token de autenticación');
      
      const publicPaths = ['/', '/login', '/no-autorizado'];
      if (!publicPaths.includes(window.location.pathname)) {
        console.error('Redirigiendo al login por falta de token');
        window.location.href = '/login';
        
      }
    }
    

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
    // Manejar errores de autenticación (401) o autorización (403)
    if (error.response) {
      console.error(`Error de respuesta: ${error.response.status} - ${error.response.statusText}`);
      
      // Si recibimos un error 401 (no autenticado) o 403 (no autorizado)
      if (error.response.status === 401) {
        console.warn("🚫 Token expirado, inválido o usuario no encontrado en BD:", 
          error.response.data?.message || "Error de autenticación");
        
        localStorage.removeItem('token'); 
        localStorage.removeItem('rol');
        localStorage.removeItem('username');
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          alert("Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.");
        }
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          console.log('⚠️ Redirigiendo al login desde interceptor por error 401 (Unauthorized)');
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
          return Promise.reject(new Error('Sesión expirada o inválida'));
        }
      } else if (error.response.status === 403) {
        console.warn("🔒 Sin permisos para acceder a este recurso:", 
          error.response.data?.message || "Error de autorización");
        
        if (window.location.pathname !== '/no-autorizado' && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/') {
          console.log('⚠️ Redirigiendo a /no-autorizado por error 403 (Forbidden)');
          window.location.href = '/no-autorizado';
        }
      }
    } else if (error.request) {
      console.error('❌ No se recibió respuesta del servidor:', error.request);
      

      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('username');
      
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        console.log('⚠️ Redirigiendo al login por falta de respuesta del servidor');
        window.location.href = '/login';
      }
    } else {
      console.error('❌ Error en la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
