import axios from './api.js';

const categoriaService = {
  obtenerCategorias: async () => {
    const response = await axios.get('/categorias/obtener');
    return response.data; // Retorna los datos de las categorías
  },

  crearCategoria: async (nombre_categoria) => {
    const response = await axios.post('/categorias/crear', { nombre_categoria });
    return response.data; // Retorna los datos de la categoría creada
  },
};

export default categoriaService;
