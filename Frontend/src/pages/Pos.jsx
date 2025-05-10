import React, { useEffect, useState } from 'react';
import { cajaService } from '@/services';
import useModal from '@/hooks/useModal';
import { useNavigate } from 'react-router-dom';
import EncabezadoPOS from '@/components/Pos/EncabezadoPOS';
import CajaActiva from '@/components/Pos/CajaActiva';
import CajaInactiva from '@/components/Pos/CajaInactiva';
import ModalAperturaCaja from '@/components/Pos/ModalAperturaCaja';
import PosToolbar from '@/components/Pos/PosToolbar';

const Pos = () => {
  const navigate = useNavigate();
  const [cajaActiva, setCajaActiva] = useState(false);
  const [cajaData, setCajaData] = useState(null);
  const [montoInicial, setMontoInicial] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();


  const verificarCajaActual = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Verificando estado de caja...');
      
      const resultado = await cajaService.verificarCajaActiva();
      console.log('🧾 Resultado de verificación completo:', resultado);
      

      if (resultado.usuarioInvalido) {
        console.log('⚠️ Usuario no existe en la DB actual:', resultado.mensaje);
        alert('La sesión ha caducado. Por favor, inicie sesión nuevamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        window.location.href = '/login';
        return;
      }
      
      if (resultado.activa && (resultado.cajaData || resultado.caja)) {
        const cajaInfo = resultado.cajaData || resultado.caja;
        console.log(`✅ Caja activa encontrada con ID: ${cajaInfo.id || 'desconocido'}`);
        setCajaActiva(true);
        setCajaData(cajaInfo);
      } else {
        console.log('ℹ️ No hay caja activa para este usuario');
        setCajaActiva(false);
        setCajaData(null);
      }
    } catch (error) {
      console.error('❌ Error al verificar caja activa:', error);
      setError('Error al verificar el estado de la caja. Intente nuevamente.');
      setCajaActiva(false);
      setCajaData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verificarCajaActual();
    
    const intervaloVerificacion = setInterval(() => {
      if (!loading) {
        verificarCajaActual();
      }
    }, 30000);
    
    return () => clearInterval(intervaloVerificacion);
  }, []);

  const abrirCaja = async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!montoInicial || isNaN(montoInicial)) {
        alert('❌ Por favor, ingrese un monto inicial válido.');
        setLoading(false);
        return;
      }
      

      const montoInicialNumerico = parseFloat(montoInicial.toString().replace(/[^\d.-]/g, ''));
      
      console.log('💰 Intentando abrir caja con monto:', montoInicialNumerico);
      
      if (isNaN(montoInicialNumerico) || montoInicialNumerico <= 0) {
        alert('❌ El monto inicial debe ser un número mayor que cero.');
        setLoading(false);
        return;
      }
      
      const response = await cajaService.abrirCaja(montoInicialNumerico);
      console.log('✅ Caja abierta exitosamente con monto inicial:', montoInicialNumerico);
      console.log('✅ Respuesta de apertura:', response);
      

      if (response.activa === true && (response.caja || response.cajaData || response.data)) {
       const dataCaja = response.caja || response.cajaData || response.data;
        console.log('🎯 Datos de caja detectados directamente en la respuesta:', dataCaja);
        setCajaActiva(true);
        setCajaData(dataCaja);
        closeModal();
        setLoading(false);
        

        console.log('🚀 Redirigiendo directamente a POS venta');
        navigate('/posventa');
        return;
      }
      

      console.log('⏳ Esperando a que el sistema registre la caja...');
      setTimeout(async () => {
        try {

          const estadoCaja = await cajaService.verificarCajaActiva();
          console.log('🔄 Verificación después de apertura:', estadoCaja);
          
          if (estadoCaja.activa) {
            console.log('✅ Caja verificada como activa, redirigiendo a POS venta');
            setCajaActiva(true);
            setCajaData(estadoCaja.cajaData || estadoCaja.caja);
            closeModal();
            navigate('/posventa');
          } else {
            console.log('⚠️ La caja no se registró correctamente como activa');
            setCajaActiva(false);
            setError('La caja se abrió pero no se registró correctamente. Intente nuevamente.');
            closeModal();
          }
        } catch (verifyError) {
          console.error('❌ Error en verificación post-apertura:', verifyError);
          setError('Error al verificar el estado de la caja después de abrirla. Intente nuevamente.');
        } finally {
          setLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Error detallado:', error);
      const msg = error?.response?.data?.message || 'Error al abrir la caja. Intente nuevamente.';
      setError(msg);
      alert(`❌ ${msg}`);
      

      await verificarCajaActual();
      setLoading(false);
    }
  };

  const cerrarCaja = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔒 Intentando cerrar caja...');
      

      await cajaService.cerrarCaja({
        monto_declarado: 0,
        observacion: 'Cierre manual desde POS',
      });
      
      console.log('✅ Solicitud de cierre de caja enviada correctamente');
      setTimeout(async () => {
        console.log('🔄 Verificando estado después del cierre...');
        await verificarCajaActual();
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error detallado al cerrar caja:', error);
      const msg = error?.response?.data?.message || 'Error al cerrar la caja. Intente nuevamente.';
      setError(msg);
      alert(`❌ ${msg}`);
      
      setTimeout(async () => {
        await verificarCajaActual();
        setLoading(false);
      }, 1000);
    }
  };

  const forzarVerificacion = () => {
    console.log('🔄 Forzando verificación manual del estado de caja...');
    verificarCajaActual();
  };

  const irAPosVenta = () => {
    navigate('/posventa');
  };

  if (loading) return <p className="p-6 text-gray-600">Cargando punto de venta...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <EncabezadoPOS />
      <PosToolbar />
      
      {error && (
        <div className="p-4 my-2 mx-6 bg-red-100 border border-red-200 text-red-700 rounded-md">
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={forzarVerificacion}
            className="mt-2 text-sm underline text-red-700 hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}
      
      <div className="p-6">
        {cajaActiva ? (
          <div className="space-y-4">
            <CajaActiva onCerrarCaja={cerrarCaja} cajaData={cajaData} />
            <div className="text-center mt-4">
              <button
                onClick={irAPosVenta}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-lg font-medium"
              >
                ➡️ Ir a Pantalla de Ventas
              </button>
            </div>
          </div>
        ) : (
          <CajaInactiva openModal={openModal} />
        )}
      </div>

      {isOpen && (
        <ModalAperturaCaja
          isOpen={isOpen}
          closeModal={closeModal}
          montoInicial={montoInicial}
          setMontoInicial={setMontoInicial}
          abrirCaja={abrirCaja}
        />
      )}
      
      {/* Botón de actualización manual para depuración */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={forzarVerificacion}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full shadow"
          title="Forzar actualización del estado de caja"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default Pos;
