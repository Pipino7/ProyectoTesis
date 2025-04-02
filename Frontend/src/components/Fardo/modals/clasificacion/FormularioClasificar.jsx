const FormularioClasificar = ({
    categorias,
    categoria,
    setCategoria,
    isEditingCategoria,
    setIsEditingCategoria,
    nuevaCategoria,
    setNuevaCategoria,
    cantidad,
    setCantidad,
    precio,
    setPrecio,
    onSubmit
  }) => {
    return (
      <div className="bg-white rounded-lg p-6 max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-2">Nueva Clasificación</h3>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Cantidad */}
          <div className="space-y-3">
            <label className="block text-gray-700 font-medium">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              min="1"
              placeholder="Número de prendas"
              required
            />
          </div>
  
          {/* Precio */}
          <div className="space-y-3">
            <label className="block text-gray-700 font-medium">Precio</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                min="1"
                placeholder="Precio por unidad"
                required
              />
            </div>
          </div>
  
          {/* Categoría */}
          <div className="space-y-3">
            <label className="block text-gray-700 font-medium">Categoría</label>
            {isEditingCategoria ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Escribe la nueva categoría"
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setIsEditingCategoria(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Volver a categorías existentes
                </button>
              </div>
            ) : (
              <select
                value={categoria}
                onChange={(e) => {
                  if (e.target.value === 'agregar_nueva') {
                    setIsEditingCategoria(true);
                    setNuevaCategoria('');
                  } else {
                    setCategoria(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre_categoria}>
                    {cat.nombre_categoria}
                  </option>
                ))}
                <option value="agregar_nueva">Agregar nueva categoría...</option>
              </select>
            )}
          </div>
  
          {/* Botón */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onSubmit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clasificar Prendas
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  export default FormularioClasificar;
  