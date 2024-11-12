import api from './api';

const categoriaService = {
  obtenerCategorias: async () => {
    const response = await api.get('/api/categorias/obtener');
    return response.data;
  },

  crearCategoria: async (nombre_categoria) => {
    const response = await api.post('/api/categorias/crear', { nombre_categoria });
    return response.data;
  },
};

export default categoriaService;
