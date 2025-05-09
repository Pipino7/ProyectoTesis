import React, { useState } from 'react';
import { FaUndo, FaSearch, FaBarcode, FaSave, FaArrowRight, FaTimes } from 'react-icons/fa';
import devolucionService from '../../../services/devolucion.services';

const SeccionDevolucion = () => {

  const [codigoCambio, setCodigoCambio] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ventaInfo, setVentaInfo] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadDevolver, setCantidadDevolver] = useState(1);
  const [itemsDevueltos, setItemsDevueltos] = useState([]);
  

  const reiniciarForm = () => {
    setCodigoCambio('');
    setMotivo('');
    setVentaInfo(null);
    setItemsDevueltos([]);
    setProductoSeleccionado(null);
    setCantidadDevolver(1);
    setError('');
    setMensaje('');
  };


  const validarCodigoCambio = async () => {
    if (!codigoCambio) {
      setError('Ingrese un código de cambio');
      return;
    }


    if (!codigoCambio.startsWith('TCC')) {
      setError('El código de cambio debe comenzar con TCC');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await devolucionService.validarCodigoCambio(codigoCambio);
      
      if (response?.data?.venta) {
        setVentaInfo(response.data.venta);
        setMensaje('✅ Ticket validado correctamente');
      } else {
        setError('La respuesta del servidor no contiene datos de venta válidos');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al validar el código de cambio';
      setError(`${errorMsg}`);
      setVentaInfo(null);
    } finally {
      setLoading(false);
    }
  };
  

  const agregarProductoDevuelto = () => {
    if (!productoSeleccionado) {
      setError('Seleccione un producto de la venta original');
      return;
    }
    
    if (cantidadDevolver > productoSeleccionado.cantidad) {
      setError(`Solo puede devolver hasta ${productoSeleccionado.cantidad} unidades`);
      return;
    }
    

    const productoExistente = itemsDevueltos.findIndex(
      item => item.codigo_barra === productoSeleccionado.codigo_barra
    );
    
    if (productoExistente >= 0) {

      const nuevosItems = [...itemsDevueltos];
      nuevosItems[productoExistente].cantidad = cantidadDevolver;
      setItemsDevueltos(nuevosItems);
    } else {

      setItemsDevueltos([...itemsDevueltos, {
        codigo_barra: productoSeleccionado.codigo_barra,
        cantidad: cantidadDevolver,
        precio_unitario: productoSeleccionado.precio_unitario,
        categoria: productoSeleccionado.categoria
      }]);
    }
    
    setProductoSeleccionado(null);
    setCantidadDevolver(1);
    setError('');
  };
  

  const eliminarProductoDevuelto = (index) => {
    const nuevosItems = [...itemsDevueltos];
    nuevosItems.splice(index, 1);
    setItemsDevueltos(nuevosItems);
  };


  const registrarDevolucion = async () => {
    if (!codigoCambio || itemsDevueltos.length === 0) {
      setError('Complete todos los campos requeridos y seleccione al menos un producto');
      return;
    }

    try {
      setLoading(true);
      

      const primerProducto = itemsDevueltos[0];
      
      const datos = {
        codigo_cambio: codigoCambio,
        codigo_barra_devuelto: primerProducto.codigo_barra,
        cantidad: primerProducto.cantidad,
        motivo: motivo || undefined
      };

      const response = await devolucionService.registrarDevolucion(datos);
      setMensaje('✅ Devolución registrada exitosamente');
      reiniciarForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar la devolución');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        <FaUndo className="inline mr-2" /> Devolución de productos
      </h3>
      
      {/* ETAPA 1: Sección de búsqueda de código de cambio */}
      <div className="mb-4 p-3 border rounded-md bg-white">
        <div className="flex items-center mb-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">1</div>
          <h5 className="font-medium">Validar ticket de cambio</h5>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={codigoCambio}
            onChange={(e) => setCodigoCambio(e.target.value)}
            placeholder="Ingrese código (ej: TCC1234567890)"
            className="flex-1 border rounded p-2 text-sm"
            disabled={loading || !!ventaInfo}
          />
          <button
            onClick={validarCodigoCambio}
            disabled={loading || !!ventaInfo}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <FaSearch className="mr-1" /> Validar
          </button>
        </div>
        
        {ventaInfo && (
          <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded flex items-start">
            <span className="text-lg mr-2">✅</span> 
            <div>
              <p className="font-medium">Ticket #{ventaInfo.id} validado</p>
              <p>Fecha: {new Date(ventaInfo.fecha_venta).toLocaleDateString()}</p>
              <p>Total: ${ventaInfo.total_venta}</p>
            </div>
          </div>
        )}
      </div>

      {/* ETAPA 2: Selección de productos a devolver */}
      {ventaInfo && (
        <div className="mb-4 p-3 border rounded-md bg-white">
          <div className="flex items-center mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">2</div>
            <h5 className="font-medium">Seleccione los productos a devolver</h5>
          </div>
          
          <div className="bg-gray-50 border rounded overflow-hidden">
            {ventaInfo.detalle && Array.isArray(ventaInfo.detalle) && ventaInfo.detalle.length > 0 ? (
              ventaInfo.detalle.map((producto, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-blue-50">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Código: {producto.codigo_barra}</div>
                    <div className="flex text-xs text-gray-600 mt-0.5">
                      <span>{producto.cantidad} x ${producto.precio_unitario}</span>
                      <span className="ml-2 text-blue-600">{producto.categoria}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setProductoSeleccionado(producto)}
                    className={`px-2 py-1 rounded text-xs ${
                      productoSeleccionado?.codigo_barra === producto.codigo_barra
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Seleccionar
                  </button>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-600">
                No hay productos disponibles para devolución.
              </div>
            )}
          </div>
          
          {/* Panel para confirmar cantidad */}
          {productoSeleccionado && (
            <div className="mt-3 p-3 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">Código: {productoSeleccionado.codigo_barra}</p>
                  <p className="text-xs text-gray-600">Precio: ${productoSeleccionado.precio_unitario}</p>
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    max={productoSeleccionado.cantidad}
                    value={cantidadDevolver}
                    onChange={(e) => setCantidadDevolver(parseInt(e.target.value) || 1)}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <button
                  onClick={agregarProductoDevuelto}
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center"
                >
                  <FaArrowRight className="mr-1" /> Agregar
                </button>
              </div>
            </div>
          )}
          
          {/* Lista de productos seleccionados para devolver */}
          {itemsDevueltos.length > 0 && (
            <div className="mt-3">
              <h6 className="text-xs font-medium mb-1 text-gray-500">PRODUCTOS SELECCIONADOS PARA DEVOLVER:</h6>
              <div className="bg-white border rounded overflow-hidden">
                {itemsDevueltos.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <div>
                      <span className="text-sm font-medium">Código: {item.codigo_barra}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        ({item.cantidad} x ${item.precio_unitario} = ${(item.cantidad * item.precio_unitario).toFixed(0)})
                      </span>
                    </div>
                    <button
                      onClick={() => eliminarProductoDevuelto(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                {/* Monto total a devolver */}
                <div className="p-2 bg-gray-50 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total a devolver:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${itemsDevueltos.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: Finalización */}
          {itemsDevueltos.length > 0 && (
            <div className="mt-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de la devolución (opcional)
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ingrese el motivo de la devolución"
                  className="w-full border rounded p-2 text-sm"
                  rows="2"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Devolución
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  disabled={loading}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <button
                onClick={registrarDevolucion}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
              >
                <FaSave className="mr-2" /> Registrar Devolución
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded flex items-start">
          <span className="text-lg mr-2">❌</span> {error}
        </div>
      )}

      {mensaje && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 p-3 rounded flex items-start">
          <span className="text-lg mr-2">✅</span> {mensaje}
        </div>
      )}

      <button
        onClick={reiniciarForm}
        className="mt-3 w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
      >
        Cancelar
      </button>
    </div>
  );
};

export default SeccionDevolucion;