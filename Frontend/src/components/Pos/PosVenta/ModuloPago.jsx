// src/components/Pos/PosVenta/ModuloPago.jsx
import React, { useState, useEffect } from "react";
import metodoPagoService from "@/services/metodoPago.services";
import cuponService from "@/services/CuponService";
import ventaService from "@/services/venta.services";
import FormularioCliente from "./FormularioCliente";
import MetodosPago from "./MetodoPago";
import ResumenPago from "./ResumenPago";
import CuponSelector from "./CuponSelector";
import GenerarTicketCambio from "./GenerarTicketCambio";
import useCajaResumen from "@/hooks/useCajaResumen";

const ModuloPago = ({
  total,
  detalle,
  setDetalle,
  actualizarTotal,
  cuponSeleccionado,
  setCuponSeleccionado,
  onVentaRealizada
}) => {
  const [tipoVenta, setTipoVenta] = useState("contado");
  const [metodosPago, setMetodosPago] = useState([]);
  const [pago, setPago] = useState({});
  const [cliente, setCliente] = useState({ nombre: "", telefono: "" });
  const [generarTicketCambio, setGenerarTicketCambio] = useState(true);
  const [cupones, setCupones] = useState([]);
  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formularioValido, setFormularioValido] = useState(true);
  
  // Use the hook to get access to refreshResumen
  const { refreshResumen } = useCajaResumen();

  useEffect(() => {
    (async () => {
      try {
        const met = await metodoPagoService.obtenerMetodosPago();
        setMetodosPago(met.filter(m => m !== "mixto"));
        console.log("🔍 Intentando obtener cupones...");
        const cuponesData = await cuponService.obtenerCuponesActivos();
        console.log("✅ Cupones obtenidos:", cuponesData);
        setCupones(cuponesData);
      } catch (err) {
        console.error("❌ Error al cargar cupones:", err);
      }
    })();
  }, []);

  const resetearEstados = () => {
    setDetalle([]);
    setCliente({ nombre: "", telefono: "" });
    setPago({});
    setCuponSeleccionado("");
    setDescuentoTotal(0);
    setTipoVenta("contado");
  };

  const handleInputPago = (metodo, valor) => {
    const nuevo = parseInt(valor || 0, 10);
    if (isNaN(nuevo)) return;
    const sumaSin = Object.entries(pago)
      .filter(([m]) => m !== metodo)
      .reduce((a, [, v]) => a + (parseInt(v) || 0), 0);
    if (nuevo > total - sumaSin) {
      alert(`⚠️ No puedes ingresar más de $${(total - sumaSin).toLocaleString()} en ${metodo}`);
      return;
    }
    setPago(prev => ({ ...prev, [metodo]: nuevo }));
    if (tipoVenta === "credito" && sumaSin + nuevo >= total) setTipoVenta("contado");
  };

  const fillAll = metodo => {
    const sumaSin = Object.entries(pago)
      .filter(([m]) => m !== metodo)
      .reduce((a, [, v]) => a + (parseInt(v) || 0), 0);
    const restante = total - sumaSin;
    setPago(prev => ({ ...prev, [metodo]: restante }));
    if (tipoVenta === "credito" && sumaSin + restante >= total) setTipoVenta("contado");
  };

  const aplicarCupon = async codigo => {
    if (!codigo) {
      setDetalle(detalle.map(p => ({ ...p, descuento: 0 })));
      setDescuentoTotal(0);
      return;
    }
    if (!detalle.length) {
      alert("⚠️ Agrega prendas antes de usar cupón.");
      setCuponSeleccionado("");
      return;
    }
    try {
      const data = await cuponService.simularDescuento({ cupon: codigo, detalle: detalle.map(p => ({ codigo_barra: p.codigo_barra, cantidad: p.cantidad, precio: p.precio })) });
      const { items, descuentoTotal } = data;
      const nuevoDet = detalle.map(p => {
        const i = items.find(x => x.codigo_barra === p.codigo_barra);
        return { ...p, descuento: i?.descuento || 0 };
      });
      setDetalle(nuevoDet);
      actualizarTotal(nuevoDet);
      setDescuentoTotal(descuentoTotal);
    } catch (err) {
      alert("❌ " + (err.response?.data?.details?.join('\n') || err.message));
      setCuponSeleccionado("");
    }
  };

  const realizarVenta = async () => {
    if (!window.confirm("¿Confirmar la venta?")) return;
    if (!detalle.length) {
      alert("Agrega al menos una prenda.");
      return;
    }
    if (tipoVenta === "credito") {
      const tel = cliente.telefono.replace(/\D/g, '');
      if (!cliente.nombre.trim() || tel.length !== 8) {
        alert("Nombre y teléfono (8 dígitos) son obligatorios.");
        return;
      }
    }
    const body = {
      metodo_pago: tipoVenta,
      generar_ticket_cambio: generarTicketCambio,
      detalle: detalle.map(p => ({ codigo_barra: p.codigo_barra, cantidad: p.cantidad, descuento: p.descuento || 0 })),
      ...(Object.keys(pago).length > 0 ? { pago } : {}),
      ...(cliente.nombre ? { cliente } : {}),
      ...(cuponSeleccionado ? { cupon: cuponSeleccionado } : {})
    };
    if (tipoVenta === "contado") {
      const suma = Object.values(pago).reduce((a, v) => a + (parseInt(v) || 0), 0);
      if (suma !== total) {
        alert(`⚠️ Pagos (${suma}) ≠ Total (${total})`);
        return;
      }
    }
    setLoading(true);
    try {
      const response = await ventaService.crearVenta(body);
      
      refreshResumen();
      
 
      if (typeof onVentaRealizada === 'function') {
        onVentaRealizada(total);
      }
      
      alert("✅ Venta registrada exitosamente");
      resetearEstados();
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">Módulo de Pago</h2>
      {/* Tipo de Venta */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 mb-1">Tipo de Venta</label>
        <select value={tipoVenta} onChange={e => setTipoVenta(e.target.value)} className="border rounded px-3 py-2">
          <option value="contado">Contado</option>
          <option value="credito">Crédito</option>
        </select>
      </div>
      {/* Formulario Cliente */}
      {tipoVenta === "credito" && (
      <FormularioCliente
      cliente={cliente}
      setCliente={setCliente}
      setFormularioValido={setFormularioValido}
      />
      )}
      {/* Métodos de Pago */}
      <MetodosPago metodosPago={metodosPago} pago={pago} handleInputPago={handleInputPago} fillAll={fillAll} tipoVenta={tipoVenta} total={total} />
      {/* Resumen de Pago */}
      <ResumenPago pago={pago} total={total} tipoVenta={tipoVenta} setTipoVenta={setTipoVenta} />
      
      {/* Generar Ticket de Cambio */}
      {tipoVenta === "contado" && (
        <GenerarTicketCambio 
          generarTicketCambio={generarTicketCambio} 
          setGenerarTicketCambio={setGenerarTicketCambio}
          cuponSeleccionado={cuponSeleccionado}
        />
      )}
      {/* Selector de Cupones */}
      <CuponSelector cupones={cupones} detalle={detalle} cuponSeleccionado={cuponSeleccionado} setCuponSeleccionado={setCuponSeleccionado} aplicarCupon={aplicarCupon} />
      {/* Total Final */}
      <div className="text-right text-xl text-gray-800 font-semibold">Total: ${total.toLocaleString()}</div>
      {/* Botón Finalizar */}
      <button
        onClick={realizarVenta}
        disabled={loading || (tipoVenta === "credito" && !formularioValido)}
        className={`w-full py-2 rounded text-white ${
          loading || (tipoVenta === "credito" && !formularioValido)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        } transition`}
      >
        {loading ? 'Procesando...' : 'Finalizar Venta'}
      </button>

    </div>
  );
};

export default ModuloPago;