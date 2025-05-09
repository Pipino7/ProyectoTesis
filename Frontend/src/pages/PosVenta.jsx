import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cajaService } from '@/services';
import FormularioEscaneo from '@/components/Pos/PosVenta/FormularioEscaneo';
import TablaPrendas from '@/components/Pos/PosVenta/TablaPrendas';
import ResumenVenta from '@/components/Pos/PosVenta/ResumenVenta';
import ResumenSuperior from '@/components/Pos/PosVenta/ResumenSuperior';
import ModuloPago from '@/components/Pos/PosVenta/ModuloPago';
import SeccionDevolucionCambio from '@/components/Pos/PosVenta/SeccionDevolucionCambio';
import { FaTrash } from 'react-icons/fa';



const PosVenta = () => {
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [total, setTotal] = useState(0);
  const [cuponSeleccionado, setCuponSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const verificarCajaActiva = async () => {
      try {
        const resultado = await cajaService.verificarCajaActiva();
        

        if (resultado.usuarioInvalido) {
          alert('La sesión ha caducado. Por favor, inicie sesión nuevamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          window.location.href = '/login';
          return;
        }
        

        if (!resultado.activa) {
          alert('Debe abrir una caja antes de realizar ventas.');
          navigate('/pos');
          return;
        }
      } catch (error) {
        console.error('Error al verificar caja activa:', error);
        alert('Ocurrió un error al verificar el estado de la caja.');
        navigate('/pos');
        return;
      } finally {
        setLoading(false);
      }
    };
    
    verificarCajaActiva();
  }, [navigate]);

  const agregarPrenda = prenda => {
    const existe = detalleVenta.find(p => p.codigo_barra === prenda.codigo_barra);
    const cantidadEnCarrito = existe ? existe.cantidad : 0;
    if (cantidadEnCarrito >= prenda.disponibles) {
      alert(`❌ Solo hay ${prenda.disponibles} unidades disponibles.`);
      return;
    }
    const nuevo = existe
      ? detalleVenta.map(p =>
          p.codigo_barra === prenda.codigo_barra
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      : [...detalleVenta, { ...prenda, cantidad: 1 }];
    setDetalleVenta(nuevo);
    actualizarTotal(nuevo);
    console.log("🛒 Carrito actualizado:", nuevo);

  };

  const eliminarPrenda = codigo => {
    const nuevo = detalleVenta.filter(p => p.codigo_barra !== codigo);
    setDetalleVenta(nuevo);
    actualizarTotal(nuevo);
  };

  const limpiarCarrito = () => {
    if (!detalleVenta.length) return;
    if (window.confirm('¿Vaciar carrito?')) {
      setDetalleVenta([]);
      setTotal(0);
    }
  };

  const editarDescuento = (codigo_barra, nuevoDescuento) => {
    const actualizado = detalleVenta.map(p =>
      p.codigo_barra === codigo_barra
        ? { ...p, descuento: nuevoDescuento }
        : p
    );
    setDetalleVenta(actualizado);
    actualizarTotal(actualizado);
  };

  const actualizarTotal = lista => {
    const sum = lista.reduce((acc, p) => {
      const desc = p.descuento || 0;
      return acc + (p.precio * p.cantidad - desc);
    }, 0);
    setTotal(sum);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando estado de la caja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-gray-100 to-gray-200">
      <ResumenSuperior total={total} />

      <div className="flex justify-end mb-4">
        <button
          onClick={limpiarCarrito}
          className="text-red-600 hover:text-red-800 flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md"
          title="Vaciar carrito"
        >
          <FaTrash />
          <span>Vaciar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Izquierda */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FormularioEscaneo onAgregarPrenda={agregarPrenda} />
          <TablaPrendas
            detalle={detalleVenta}
            onEliminar={eliminarPrenda}
            onEditarDescuento={editarDescuento}
            cuponSeleccionado={cuponSeleccionado}
          />
          <SeccionDevolucionCambio />
        </div>
        {/* Derecha */}
        <div className="bg-white p-6 rounded-lg shadow-md">
        <ModuloPago
          total={total}
          detalle={detalleVenta}
          setDetalle={setDetalleVenta}
          actualizarTotal={actualizarTotal}
          cuponSeleccionado={cuponSeleccionado}
          setCuponSeleccionado={setCuponSeleccionado}
        />
          <ResumenVenta total={total} detalle={detalleVenta} />
        </div>
      </div>
    </div>
  );
};

export default PosVenta;
