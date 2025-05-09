import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaHandHoldingUsd, FaUserFriends, FaClipboardList, FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { cajaService } from '@/services';
import VentaService from '@/services/venta.services';
import cobroService from '@/services/cobro.services';

const CobroModal = ({ isOpen, onClose }) => {

  const [modoCobroMultiple, setModoCobroMultiple] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  

  const [ventas, setVentas] = useState([]);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [montoCobro, setMontoCobro] = useState('');
  const [loadingVentas, setLoadingVentas] = useState(false);
  

  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [montoCobroCliente, setMontoCobroCliente] = useState('');
  const [deudaCliente, setDeudaCliente] = useState(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingDeuda, setLoadingDeuda] = useState(false);
  

  const extraerClientes = (ventas) => {

    const clientesMap = {};
    
    ventas.forEach(venta => {
      if (venta.cliente && venta.cliente.id) {
        const { id, nombre, telefono } = venta.cliente;
        
        if (!clientesMap[id]) {
          clientesMap[id] = { id, nombre, telefono };
        }
      }
    });
    

    return Object.values(clientesMap);
  };


  useEffect(() => {
    const cargarVentasPendientes = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingVentas(true);
        const response = await cobroService.obtenerVentasPendientes();
        setVentas(response || []);
        

        const clientesUnicos = extraerClientes(response || []);
        setClientes(clientesUnicos);
      } catch (error) {
        console.error('Error al cargar ventas pendientes:', error);
        toast.error('No se pudieron cargar las ventas pendientes');
      } finally {
        setLoadingVentas(false);
      }
    };
    
    cargarVentasPendientes();
  }, [isOpen]);


  const handleSelectVenta = (venta) => {
    setSelectedVenta(venta);
    setMontoCobro(venta.saldo_pendiente.toString());
  };

  const handleSelectCliente = async (cliente) => {
    setSelectedCliente(cliente);
    setMontoCobroCliente('');
    setDeudaCliente(null);
    
    try {
      setLoadingDeuda(true);
      const deudaInfo = await cobroService.obtenerDeudaCliente(cliente.id);
      setDeudaCliente(deudaInfo);
      

      if (deudaInfo && deudaInfo.deuda_total) {
        setMontoCobroCliente(deudaInfo.deuda_total.toString());
      }
    } catch (error) {
      console.error(`Error al obtener deuda del cliente ${cliente.id}:`, error);
      toast.error('No se pudo obtener la información de deuda del cliente');
    } finally {
      setLoadingDeuda(false);
    }
  };

  const handleChangeModo = (esMultiple) => {
    setModoCobroMultiple(esMultiple);
    

    setSelectedVenta(null);
    setMontoCobro('');
    setSelectedCliente(null);
    setMontoCobroCliente('');
    setDeudaCliente(null);
  };


  const handleSubmitCobroIndividual = async (e) => {
    e.preventDefault();
    
    if (!selectedVenta) {
      toast.error('Debe seleccionar una venta');
      return;
    }
    
    if (!montoCobro || parseFloat(montoCobro) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    
    if (parseFloat(montoCobro) > selectedVenta.saldo_pendiente) {
      toast.error(`El monto no puede ser mayor al saldo pendiente (${selectedVenta.saldo_pendiente})`);
      return;
    }
    
    try {
      setLoading(true);
      
      await cobroService.registrarCobro({
        venta_id: selectedVenta.id,
        monto: parseFloat(montoCobro),
        metodo_pago: metodoPago
      });
      
      toast.success('Cobro registrado correctamente');
      
      // Reset form
      setSelectedVenta(null);
      setMontoCobro('');
      setMetodoPago('efectivo');
      onClose();
    } catch (error) {
      console.error('Error al registrar cobro:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el cobro');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmitCobroCliente = async (e) => {
    e.preventDefault();
    
    if (!selectedCliente) {
      toast.error('Debe seleccionar un cliente');
      return;
    }
    
    if (!montoCobroCliente || parseFloat(montoCobroCliente) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    
    if (deudaCliente && parseFloat(montoCobroCliente) > deudaCliente.deuda_total) {
      toast.error(`El monto no puede ser mayor a la deuda total del cliente (${formatCurrency(deudaCliente.deuda_total)})`);
      return;
    }
    
    try {
      setLoading(true);
      
      const resultado = await cobroService.registrarCobroMultiple({
        cliente_id: selectedCliente.id,
        monto_total: parseFloat(montoCobroCliente),
        metodo_pago: metodoPago
      });
      
      toast.success(`Cobro por ${formatCurrency(montoCobroCliente)} distribuido entre ${resultado.cobro.ventas_procesadas} ventas`);
      

      setSelectedCliente(null);
      setMontoCobroCliente('');
      setDeudaCliente(null);
      setMetodoPago('efectivo');
      onClose();
    } catch (error) {
      console.error('Error al registrar cobro por cliente:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el cobro');
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value || 0);

  // Renderizar ícono según método de pago
  const renderMetodoIcon = (metodo) => {
    switch (metodo) {
      case 'efectivo': return <FaMoneyBillWave className="text-green-600" />;
      case 'transferencia': return <FaExchangeAlt className="text-blue-600" />;
      case 'tarjeta': return <FaCreditCard className="text-purple-600" />;
      default: return <FaMoneyBillWave className="text-green-600" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-xl mx-auto my-12 max-w-3xl shadow-2xl relative border border-gray-200"
      overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-green-600 text-white p-5 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <FaHandHoldingUsd className="mr-3 text-white" />
            Registrar Cobro
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={22} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Selector de modo */}
          <div className="mb-6 flex border rounded-lg overflow-hidden shadow-sm">
            <button 
              className={`flex-1 py-3 px-4 ${!modoCobroMultiple ? 'bg-green-600 text-white font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              onClick={() => handleChangeModo(false)}
            >
              <div className="flex items-center justify-center">
                <FaClipboardList className="mr-2" size={18} />
                Cobro por Venta
              </div>
            </button>
            <button 
              className={`flex-1 py-3 px-4 ${modoCobroMultiple ? 'bg-green-600 text-white font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              onClick={() => handleChangeModo(true)}
            >
              <div className="flex items-center justify-center">
                <FaUserFriends className="mr-2" size={18} />
                Cobro por Cliente
              </div>
            </button>
          </div>
          
          {/* MODO COBRO POR VENTA */}
          {!modoCobroMultiple && (
            <>
              {loadingVentas ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
                  <p className="ml-4 text-gray-600">Cargando ventas...</p>
                </div>
              ) : ventas.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FaClipboardList className="mx-auto text-gray-400" size={48} />
                  <p className="text-gray-500 mt-4 text-lg">No hay ventas pendientes de cobro</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {/* Lista de ventas pendientes */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-700 flex items-center">
                      <FaClipboardList className="mr-2 text-green-600" />
                      Seleccionar Venta Pendiente
                    </h3>
                    <div className="max-h-56 overflow-y-auto border rounded-lg shadow-inner bg-white">
                      {ventas.map((venta) => (
                        <div 
                          key={venta.id}
                          className={`p-4 border-b cursor-pointer hover:bg-green-50 transition-colors ${selectedVenta?.id === venta.id ? 'bg-green-100 border-l-4 border-l-green-600' : ''}`}
                          onClick={() => handleSelectVenta(venta)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{venta.cliente?.nombre || 'Cliente sin nombre'}</p>
                              <p className="text-sm text-gray-500">
                                {venta.cliente?.telefono && `Tel: ${venta.cliente.telefono}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-700">{formatCurrency(venta.saldo_pendiente)}</p>
                              <p className="text-xs text-gray-500">Pendiente</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Formulario de cobro individual */}
                  {selectedVenta && (
                    <form onSubmit={handleSubmitCobroIndividual} className="space-y-5 border-t pt-5">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm mb-1">Venta seleccionada: <span className="font-semibold text-gray-800">{selectedVenta.cliente?.nombre || 'Cliente sin nombre'}</span></p>
                        <p className="text-sm">Saldo pendiente: <span className="font-semibold text-green-700">{formatCurrency(selectedVenta.saldo_pendiente)}</span></p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="montoCobro" className="block text-sm font-medium text-gray-700 mb-2">
                            Monto a cobrar ($) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">$</span>
                            </div>
                            <input
                              type="number"
                              id="montoCobro"
                              value={montoCobro}
                              onChange={(e) => setMontoCobro(e.target.value)}
                              max={selectedVenta.saldo_pendiente}
                              min="1"
                              step="1"
                              className="pl-8 pr-3 py-3 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Máximo: {formatCurrency(selectedVenta.saldo_pendiente)}
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-700 mb-2">
                            Método de Pago <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              {renderMetodoIcon(metodoPago)}
                            </div>
                            <select
                              id="metodoPago"
                              value={metodoPago}
                              onChange={(e) => setMetodoPago(e.target.value)}
                              className="pl-10 pr-3 py-3 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                              required
                            >
                              <option value="efectivo">Efectivo</option>
                              <option value="transferencia">Transferencia</option>
                              <option value="tarjeta">Tarjeta</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={onClose}
                          className="py-3 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md disabled:opacity-50"
                          disabled={loading}
                        >
                          {loading ? 
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                              <span>Procesando...</span>
                            </div> : 
                            'Registrar Cobro'
                          }
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* MODO COBRO POR CLIENTE */}
          {modoCobroMultiple && (
            <>
              {loadingVentas ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
                  <p className="ml-4 text-gray-600">Cargando clientes...</p>
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FaUserFriends className="mx-auto text-gray-400" size={48} />
                  <p className="text-gray-500 mt-4 text-lg">No hay clientes con deudas pendientes</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {/* Lista de clientes con deudas */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-700 flex items-center">
                      <FaUserFriends className="mr-2 text-green-600" />
                      Seleccionar Cliente con Deuda
                    </h3>
                    <div className="max-h-56 overflow-y-auto border rounded-lg shadow-inner bg-white">
                      {clientes.map((cliente) => (
                        <div 
                          key={cliente.id}
                          className={`p-4 border-b cursor-pointer hover:bg-green-50 transition-colors ${selectedCliente?.id === cliente.id ? 'bg-green-100 border-l-4 border-l-green-600' : ''}`}
                          onClick={() => handleSelectCliente(cliente)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{cliente.nombre || 'Cliente sin nombre'}</p>
                              <p className="text-sm text-gray-500">
                                {cliente.telefono && `Tel: ${cliente.telefono}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Formulario de cobro por cliente */}
                  {selectedCliente && (
                    <form onSubmit={handleSubmitCobroCliente} className="space-y-5 border-t pt-5">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm mb-1">Cliente seleccionado: <span className="font-semibold text-gray-800">{selectedCliente.nombre || 'Cliente sin nombre'}</span></p>
                        
                        {loadingDeuda ? (
                          <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent mr-2"></div>
                            <span className="text-gray-600">Calculando deuda...</span>
                          </div>
                        ) : deudaCliente ? (
                          <>
                            <p className="text-sm mb-1">Deuda total: <span className="font-semibold text-green-700">{formatCurrency(deudaCliente.deuda_total)}</span></p>
                            <p className="text-sm mb-2">Ventas pendientes: <span className="font-semibold text-gray-800">{deudaCliente.total_ventas_pendientes}</span></p>
                            {deudaCliente.ventas_detalle && deudaCliente.ventas_detalle.length > 0 && (
                              <div className="mt-2 bg-white border rounded-md p-3 max-h-36 overflow-y-auto shadow-inner">
                                <p className="text-xs font-medium mb-2 text-gray-700">Detalle de ventas pendientes:</p>
                                {deudaCliente.ventas_detalle.map((venta, index) => (
                                  <div key={index} className="text-xs flex justify-between border-b py-1.5">
                                    <span className="text-gray-700">{new Date(venta.fecha_venta).toLocaleDateString()}</span>
                                    <span className="font-medium text-green-700">{formatCurrency(venta.saldo_pendiente)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 py-2">Calculando deuda del cliente...</p>
                        )}
                      </div>
                      
                      {deudaCliente && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="montoCobroCliente" className="block text-sm font-medium text-gray-700 mb-2">
                              Monto a cobrar ($) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">$</span>
                              </div>
                              <input
                                type="number"
                                id="montoCobroCliente"
                                value={montoCobroCliente}
                                onChange={(e) => setMontoCobroCliente(e.target.value)}
                                max={deudaCliente.deuda_total}
                                min="1"
                                step="1"
                                className="pl-8 pr-3 py-3 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                                required
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Máximo: {formatCurrency(deudaCliente.deuda_total)}
                            </p>
                          </div>
                          
                          <div>
                            <label htmlFor="metodoPagoCliente" className="block text-sm font-medium text-gray-700 mb-2">
                              Método de Pago <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {renderMetodoIcon(metodoPago)}
                              </div>
                              <select
                                id="metodoPagoCliente"
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                className="pl-10 pr-3 py-3 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                                required
                              >
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="tarjeta">Tarjeta</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={onClose}
                          className="py-3 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md disabled:opacity-50"
                          disabled={loading || !deudaCliente}
                        >
                          {loading ? 
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                              <span>Procesando...</span>
                            </div> : 
                            'Registrar Cobro'
                          }
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CobroModal;