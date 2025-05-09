import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaSearch, FaBarcode, FaSave, FaTimes, FaPlus, FaArrowRight } from 'react-icons/fa';
import cambioService from '../../../services/cambio.services';

const SeccionCambio = () => {

  const [codigoCambio, setCodigoCambio] = useState('');
  const [codigoBarraNuevo, setCodigoBarraNuevo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ventaInfo, setVentaInfo] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  

  const [itemsDevueltos, setItemsDevueltos] = useState([]);
  const [itemsNuevos, setItemsNuevos] = useState([]);
  const [resumenCambio, setResumenCambio] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadDevolver, setCantidadDevolver] = useState(1);
  const [cantidadNueva, setCantidadNueva] = useState(1);
  const [informacionProductoNuevo, setInformacionProductoNuevo] = useState(null);
  

  const [etapaCambio, setEtapaCambio] = useState(1);
  

  const reiniciarForm = () => {
    setCodigoCambio('');
    setCodigoBarraNuevo('');
    setMotivo('');
    setVentaInfo(null);
    setItemsDevueltos([]);
    setItemsNuevos([]);
    setResumenCambio(null);
    setProductoSeleccionado(null);
    setCantidadDevolver(1);
    setCantidadNueva(1);
    setInformacionProductoNuevo(null);
    setError('');
    setMensaje('');
    setEtapaCambio(1);
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
      
      const response = await cambioService.validarCodigoCambio(codigoCambio);
      
      if (response?.data?.venta) {
        setVentaInfo(response.data.venta);
        setMensaje('✅ Ticket validado correctamente');
        setEtapaCambio(2); 
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


  const buscarProductoNuevo = async () => {
    if (!codigoBarraNuevo) {
      setError('Ingrese un código de barra para buscar');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/ventas/validar-prenda/${codigoBarraNuevo}`);
      
      if (response?.data?.data && response.data.data.disponibles > 0) {
        setInformacionProductoNuevo(response.data.data);
      } else {
        setError('El producto no existe o no tiene stock disponible');
      }
    } catch (err) {
      setError('Error al buscar producto: ' + (err.response?.data?.message || err.message));
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
    

    if (itemsDevueltos.length > 0) {
      setEtapaCambio(3); 
    }
  };
  

  const agregarProductoNuevo = () => {
    if (!informacionProductoNuevo) {
      setError('Busque primero la información del producto');
      return;
    }
    
    if (cantidadNueva > informacionProductoNuevo.disponibles) {
      setError(`Solo hay ${informacionProductoNuevo.disponibles} unidades disponibles`);
      return;
    }

    const productoExistente = itemsNuevos.findIndex(
      item => item.codigo_barra === informacionProductoNuevo.codigo_barra
    );
    
    if (productoExistente >= 0) {

      const nuevosItems = [...itemsNuevos];
      nuevosItems[productoExistente].cantidad = cantidadNueva;
      setItemsNuevos(nuevosItems);
    } else {

      setItemsNuevos([...itemsNuevos, {
        codigo_barra: informacionProductoNuevo.codigo_barra,
        cantidad: cantidadNueva,
        precio: informacionProductoNuevo.precio,
        categoria: informacionProductoNuevo.categoria
      }]);
    }
    
    setCodigoBarraNuevo('');
    setInformacionProductoNuevo(null);
    setCantidadNueva(1);
    setError('');
  };

  const eliminarProductoDevuelto = (index) => {
    const nuevosItems = [...itemsDevueltos];
    nuevosItems.splice(index, 1);
    setItemsDevueltos(nuevosItems);
  };

  const eliminarProductoNuevo = (index) => {
    const nuevosItems = [...itemsNuevos];
    nuevosItems.splice(index, 1);
    setItemsNuevos(nuevosItems);
  };

  useEffect(() => {
    if (itemsDevueltos.length > 0 && itemsNuevos.length > 0) {

      const totalDevuelto = itemsDevueltos.reduce(
        (acc, item) => acc + (parseFloat(item.precio_unitario) * item.cantidad), 
        0
      );

      const totalNuevo = itemsNuevos.reduce(
        (acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 
        0
      );

      const diferencia = totalNuevo - totalDevuelto;
      
      setResumenCambio({
        totalDevuelto,
        totalNuevo,
        diferencia
      });
    } else {
      setResumenCambio(null);
    }
  }, [itemsDevueltos, itemsNuevos]);

  const procesarCambio = async () => {
    if (!codigoCambio || itemsDevueltos.length === 0 || itemsNuevos.length === 0) {
      setError('Debe seleccionar productos a devolver y productos nuevos');
      return;
    }
    
    try {
      setLoading(true);
      const datos = {
        codigo_cambio: codigoCambio,
        items_devueltos: itemsDevueltos,
        items_nuevos: itemsNuevos,
        metodo_pago: metodoPago,
        motivo: motivo || undefined
      };
      
      const response = await cambioService.registrarCambio(datos);

      if (resumenCambio.diferencia > 0) {
        setMensaje(`✅ Cambio procesado. Se cobró una diferencia de $${resumenCambio.diferencia.toFixed(0)}`);
      } else if (resumenCambio.diferencia < 0) {
        setMensaje(`✅ Cambio procesado. Se devolvió al cliente $${Math.abs(resumenCambio.diferencia).toFixed(0)}`);
      } else {
        setMensaje('✅ Cambio procesado exitosamente sin diferencias de valor');
      }
      
      reiniciarForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el cambio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        <FaExchangeAlt className="inline mr-2" /> Cambio de productos
      </h3>
      
      {/* ETAPA 1: Sección de búsqueda de código de cambio */}
      <div className={`mb-4 p-3 border rounded-md ${etapaCambio >= 1 ? 'bg-white' : 'bg-gray-100'}`}>
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
      
      {/* ETAPA 2: Productos a devolver */}
      <div className={`mb-4 p-3 border rounded-md ${etapaCambio >= 2 ? 'bg-white' : 'bg-gray-100'}`}>
        <div className="flex items-center mb-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${etapaCambio >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
          <h5 className={`font-medium ${etapaCambio < 2 ? 'text-gray-500' : ''}`}>Seleccione los productos a devolver</h5>
        </div>
        
        {etapaCambio >= 2 && (
          <>
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
                  No hay productos disponibles para cambio.
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
                    <FaPlus className="mr-1" /> Agregar
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
                </div>
                
                {etapaCambio === 2 && (
                  <button 
                    onClick={() => setEtapaCambio(3)}
                    className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                  >
                    Continuar <FaArrowRight className="ml-2" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* ETAPA 3: Productos nuevos */}
      <div className={`mb-4 p-3 border rounded-md ${etapaCambio >= 3 ? 'bg-white' : 'bg-gray-100'}`}>
        <div className="flex items-center mb-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${etapaCambio >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
          <h5 className={`font-medium ${etapaCambio < 3 ? 'text-gray-500' : ''}`}>Seleccione los productos nuevos</h5>
        </div>
        
        {etapaCambio >= 3 && (
          <>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={codigoBarraNuevo}
                onChange={(e) => setCodigoBarraNuevo(e.target.value)}
                placeholder="Código de barra del producto nuevo"
                className="flex-1 border rounded p-2 text-sm"
                disabled={loading}
              />
              <button
                onClick={buscarProductoNuevo}
                disabled={loading || !codigoBarraNuevo}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center"
              >
                <FaSearch className="mr-1" /> Buscar
              </button>
            </div>
            
            {/* Información del producto nuevo encontrado */}
            {informacionProductoNuevo && (
              <div className="mb-3 p-3 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Código: {informacionProductoNuevo.codigo_barra}</p>
                    <p className="text-xs text-gray-600">Precio: ${informacionProductoNuevo.precio}</p>
                    <p className="text-xs text-gray-600">Disponibles: {informacionProductoNuevo.disponibles}</p>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      max={informacionProductoNuevo.disponibles}
                      value={cantidadNueva}
                      onChange={(e) => setCantidadNueva(parseInt(e.target.value) || 1)}
                      className="w-full border rounded p-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={agregarProductoNuevo}
                    className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Agregar
                  </button>
                </div>
              </div>
            )}
            
            {/* Lista de productos nuevos seleccionados */}
            {itemsNuevos.length > 0 && (
              <div>
                <h6 className="text-xs font-medium mb-1 text-gray-500">PRODUCTOS NUEVOS SELECCIONADOS:</h6>
                <div className="bg-white border rounded overflow-hidden">
                  {itemsNuevos.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border-b last:border-b-0">
                      <div>
                        <span className="text-sm font-medium">Código: {item.codigo_barra}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({item.cantidad} x ${item.precio} = ${(item.cantidad * item.precio).toFixed(0)})
                        </span>
                      </div>
                      <button
                        onClick={() => eliminarProductoNuevo(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* RESUMEN Y FINALIZACIÓN */}
      {resumenCambio && (
        <div className="mb-4 p-4 border rounded-lg bg-yellow-50">
          <h5 className="text-sm font-semibold mb-3">Resumen del cambio</h5>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white p-2 rounded border">
              <div className="text-xs text-gray-500 mb-1">PRODUCTOS A DEVOLVER</div>
              <div className="text-sm font-semibold">${resumenCambio.totalDevuelto.toFixed(0)}</div>
            </div>
            <div className="bg-white p-2 rounded border">
              <div className="text-xs text-gray-500 mb-1">PRODUCTOS NUEVOS</div>
              <div className="text-sm font-semibold">${resumenCambio.totalNuevo.toFixed(0)}</div>
            </div>
          </div>
          
          <div className="p-3 bg-white rounded border mb-3">
            <div className="text-xs text-gray-500 mb-1">DIFERENCIA A {resumenCambio.diferencia > 0 ? 'PAGAR' : 'DEVOLVER'}</div>
            <div className={`text-lg font-bold ${resumenCambio.diferencia > 0 ? 'text-red-600' : resumenCambio.diferencia < 0 ? 'text-green-600' : 'text-gray-600'}`}>
              ${Math.abs(resumenCambio.diferencia).toFixed(0)}
            </div>
            <div className="text-sm mt-1">
              {resumenCambio.diferencia > 0 
                ? 'El cliente debe pagar esta diferencia' 
                : resumenCambio.diferencia < 0 
                ? 'Se debe devolver este monto al cliente' 
                : 'No hay diferencia de valor'}
            </div>
          </div>
          
          {resumenCambio.diferencia !== 0 && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de {resumenCambio.diferencia > 0 ? 'Pago' : 'Devolución'}
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
          )}
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del cambio (opcional)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ingrese el motivo del cambio"
              className="w-full border rounded p-2 text-sm"
              rows="2"
              disabled={loading}
            />
          </div>

          <button
            onClick={procesarCambio}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 flex items-center justify-center"
          >
            <FaSave className="mr-2" /> Procesar Cambio
          </button>
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

export default SeccionCambio;