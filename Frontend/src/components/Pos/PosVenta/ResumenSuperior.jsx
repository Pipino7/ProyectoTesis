import { useState, useEffect, useRef } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import { cajaService } from '@/services';
import useCajaResumen from '@/hooks/useCajaResumen';
import ResumenDiarioModal from '@/components/Pos/PosVenta/ResumenCaja/ResumenDiarioModal'
import MenuOptions from './Modales/MenuOptions';
import CerrarCajaModal from './Modales/CerrarCajaModal';
import GastoModal from './Modales/GastoModal';
import CobroModal from './Modales/CobroModal';
import PropTypes from 'prop-types';

const ResumenSuperior = ({ total, onVentaRealizada }) => {

  const [isResumenOpen, setIsResumenOpen] = useState(false);
  const [isCerrarCajaOpen, setIsCerrarCajaOpen] = useState(false);
  const [isGastoOpen, setIsGastoOpen] = useState(false);
  const [isCobroOpen, setIsCobroOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  

  const [cajaActiva, setCajaActiva] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  

  const { resumen: resumenVentas, loading, error, refreshResumen } = useCajaResumen();

  const menuRef = useRef(null);

  useEffect(() => {
    if (resumenVentas) {
      console.log('💰 Datos del resumen de caja:', resumenVentas);

      const totalVentasValue = resumenVentas?.totales?.ventas || 0;

      if (resumenVentas?.totales?.balancePorMetodo?.efectivo !== undefined) {
        setBalance(resumenVentas.totales.balancePorMetodo.efectivo);
      } else if (resumenVentas?.totales?.balanceFinal?.efectivo !== undefined) {
        setBalance(resumenVentas.totales.balanceFinal.efectivo);
      } else {
        const montoInicial = resumenVentas?.caja?.monto_inicial || 0;
        const ingresosEfectivo = resumenVentas?.totales?.cobrosPorMetodo?.efectivo || 0;
        const gastosEfectivo = resumenVentas?.totales?.gastosPorMetodo?.efectivo || 0;
        

        const balanceCalculado = montoInicial + ingresosEfectivo - gastosEfectivo;
        setBalance(balanceCalculado);
      }
      

      setTotalVentas(totalVentasValue);
      
      if (resumenVentas?.caja) {
        setCajaActiva(resumenVentas.caja);
      }
      
      console.log(`✅ Resumen actualizado: 
        - Ventas totales: $${totalVentasValue} 
        - Balance efectivo: $${resumenVentas?.totales?.balancePorMetodo?.efectivo || resumenVentas?.totales?.balanceFinal?.efectivo || 'calculado localmente'}`);
    }
  }, [resumenVentas]);


  useEffect(() => {
    const verificarCaja = async () => {
      try {

        const respuestaCaja = await cajaService.verificarCajaActiva();
        

        if (respuestaCaja.usuarioInvalido) {
          console.log('⚠️ Usuario no existe en la base de datos actual:', respuestaCaja.mensaje);

          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          

          alert('Tu sesión ha caducado. Por favor, inicia sesión nuevamente.');
          
 
          window.location.href = '/login';
          return;
        }
        
        if (respuestaCaja.activa) {
          if (respuestaCaja.cajaData) {
            console.log('📋 Datos de caja obtenidos directamente:', respuestaCaja.cajaData);
            setCajaActiva(respuestaCaja.cajaData);

            refreshResumen();
          } 
        } else {
          setCajaActiva(null);
          setBalance(0);
        }
      } catch (error) {
        console.error("Error verificando caja activa:", error);
      }
    };
    
    verificarCaja();
    

    const intervalo = setInterval(() => {
      refreshResumen();
    }, 120000);
    
    return () => clearInterval(intervalo);
  }, [refreshResumen]);

  useEffect(() => {
    if (total > 0) {
      refreshResumen();
    }
  }, [total, refreshResumen]);


  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };


  const handleOptionClick = (option) => {
    setShowMenu(false);
    
    switch(option) {
      case 'resumen':
        setIsResumenOpen(true);
        break;
      case 'gasto':
        setIsGastoOpen(true);
        break;
      case 'cobro':
        setIsCobroOpen(true);
        break;
      case 'cerrarCaja':
        setIsCerrarCajaOpen(true);
        break;
      default:
        break;
    }
  };


  const abrirModalResumen = () => {
    setIsResumenOpen(true);
  };


  const handleCerrarCajaSuccess = () => {
    setCajaActiva(null);
    

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value || 0);

  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg shadow-lg ring-1 ring-gray-200">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
          title="Volver al dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800">🧾 Punto de Venta</h2>
      </div>
      <div className="flex items-center gap-6">
        {loading ? (
          <div className="flex items-center">
            <span className="text-gray-500">Cargando datos...</span>
          </div>
        ) : error ? (
          <div className="flex items-center">
            <span className="text-red-500">Error al cargar datos</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-gray-700 text-base mr-2">
              Total Ventas: <strong className="text-lg text-green-600">{formatCurrency(totalVentas)}</strong>
            </span>
            <span className="ml-4 text-gray-700 text-base">
              Balance en efectivo: <strong className="text-lg">{formatCurrency(balance)}</strong>
            </span>
          </div>
        )}
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700 transition-colors"
          onClick={abrirModalResumen}
        >
          Ver ventas del día
        </button>

        {/* Menú de opciones */}
        <div className="relative" ref={menuRef}>
          <button
            className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors"
            onClick={handleMenuClick}
          >
            <FaEllipsisV />
          </button>
          
          <MenuOptions 
            showMenu={showMenu} 
            onOptionClick={handleOptionClick} 
          />
        </div>
      </div>

      {/* Modal de Resumen Diario */}
      <ResumenDiarioModal 
        isOpen={isResumenOpen} 
        onClose={() => setIsResumenOpen(false)}
      />

      {/* Modal de Cerrar Caja */}
      <CerrarCajaModal 
        isOpen={isCerrarCajaOpen} 
        onClose={() => setIsCerrarCajaOpen(false)}
        onSuccess={handleCerrarCajaSuccess}
      />

      {/* Modal de Registro de Gasto */}
      <GastoModal
        isOpen={isGastoOpen}
        onClose={() => {
          setIsGastoOpen(false);
          refreshResumen(); // Usar refreshResumen del hook
        }}
      />

      {/* Modal de Registro de Cobro */}
      {isCobroOpen && (
        <CobroModal
          isOpen={isCobroOpen}
          onClose={() => {
            setIsCobroOpen(false);
            refreshResumen(); 
          }}
        />
      )}
    </div>
  );
};


ResumenSuperior.propTypes = {
  total: PropTypes.number,
  onVentaRealizada: PropTypes.func
};

// Valores por defecto para las props
ResumenSuperior.defaultProps = {
  total: 0,
  onVentaRealizada: () => {}
};

export default ResumenSuperior;
