import api from './api';

// Obtener fardos paginados
export const obtenerFardos = async (page = 1, limit = 20) => {
  const response = await api.get(`api/fardos/paginados?page=${page}&limit=${limit}`);
  return response.data;
};

// Crear un nuevo fardo
export const crearFardo = async (datosFardo) => {
  const response = await api.post('api/fardos/crear', datosFardo);
  return response.data;
};

// Eliminar un fardo por su código
export const eliminarFardo = async (codigo_fardo) => {
  const response = await api.delete(`api/fardos/${codigo_fardo}`);
  return response.data;
};

// Obtener un fardo por su código
export const obtenerFardoPorCodigo = async (codigo_fardo) => {
  const response = await api.get(`/api/fardos/${codigo_fardo}`);
  return response.data;
};

// Obtener las categorías de prendas asociadas a un fardo
export const obtenerCategoriasDePrendas = async (fardoId) => {
  const response = await api.get(`/fardos/${fardoId}/categorias`);
  return response.data;
};


export const obtenerFardosConFiltros = async (filtros) => {
  const response = await api.get('api/fardos/Filtro', {
    params: {
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
      nombre_proveedor: filtros.proveedor, // Cambia el nombre a 'nombre_proveedor' en los parámetros
      precio_min: filtros.precioMin,
      precio_max: filtros.precioMax,
      orden_fecha: filtros.orden, // Aquí cambiamos a `orden_fecha` para que coincida con la URL
      page: filtros.page,
      limit: filtros.limit
    }
  });
  return response.data;
};

