import React from 'react';
import Section from './Section';
import DataRow from './DataRow';
import { FaWallet, FaCalendarDay, FaHistory } from 'react-icons/fa';


const BalanceSection = ({ data = {}, formatCurrency = v => v }) => {
  const { 
    balancePorMetodo = {}, 
    cobrosDelDiaPorMetodo = {}, 
    cobrosPendientesPorMetodo = {},
    totalCobrosDelDia = 0,
    totalCobrosPendientes = 0
  } = data;


  const mostrarDesgloseCobros = 
    totalCobrosDelDia > 0 || 
    totalCobrosPendientes > 0;

  return (
    <Section title="Balance por Método de Pago" icon={<FaWallet />} color="blue">
      {/* Sección detallada con desglose de cobros */}
      {mostrarDesgloseCobros && (
        <>
          <div className="font-medium text-sm text-gray-700 mb-2">Desglose de Ingresos:</div>
          
          {/* Cobros del día */}
          {totalCobrosDelDia > 0 && (
            <>
              <div className="flex items-center gap-1 text-sm text-green-700 mb-1">
                <FaCalendarDay size={12} /> Ventas del día
              </div>
              
              {Object.entries(cobrosDelDiaPorMetodo)
                .filter(([_, monto]) => monto > 0)
                .map(([metodo, monto]) => (
                  <DataRow
                    key={`day-${metodo}`}
                    label={`• ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`}
                    value={formatCurrency(monto)}
                    textColor="text-green-700"
                    className="text-sm"
                  />
                ))
              }
              <DataRow
                label="Subtotal ventas del día"
                value={formatCurrency(totalCobrosDelDia)}
                textColor="text-green-700"
                className="text-sm font-medium"
              />
              <div className="mb-2"></div>
            </>
          )}
          
          {/* Cobros de ventas pendientes */}
          {totalCobrosPendientes > 0 && (
            <>
              <div className="flex items-center gap-1 text-sm text-blue-700 mb-1">
                <FaHistory size={12} /> Ventas pendientes
              </div>
              
              {Object.entries(cobrosPendientesPorMetodo)
                .filter(([_, monto]) => monto > 0)
                .map(([metodo, monto]) => (
                  <DataRow
                    key={`pending-${metodo}`}
                    label={`• ${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`}
                    value={formatCurrency(monto)}
                    textColor="text-blue-700"
                    className="text-sm"
                  />
                ))
              }
              <DataRow
                label="Subtotal ventas pendientes"
                value={formatCurrency(totalCobrosPendientes)}
                textColor="text-blue-700"
                className="text-sm font-medium"
              />
              <div className="mb-2"></div>
            </>
          )}

          <hr className="my-3" />
        </>
      )}
      
      {/* Balance total por método */}
      <div className="font-medium text-gray-800 mb-2">Balance Final:</div>
      
      {Object.entries(balancePorMetodo)
        .filter(([metodo]) => metodo !== 'total')
        .map(([metodo, monto]) => (
          <DataRow
            key={metodo}
            label={metodo.charAt(0).toUpperCase() + metodo.slice(1)}
            value={formatCurrency(monto)}
            textColor={monto >= 0 ? 'text-green-700' : 'text-red-600'}
          />
        ))}
      <DataRow
        label="Balance Total"
        value={formatCurrency(balancePorMetodo.total || 0)}
        isTotal
        textColor="text-blue-700"
      />
    </Section>
  );
};

export default BalanceSection;
