import React from 'react';
import Section from './Section';
import DataRow from './DataRow';
import { FaMoneyBillWave, FaTicketAlt, FaClock, FaCalendarDay, FaHistory } from 'react-icons/fa';


const IngresosSection = ({ data = {}, formatCurrency = v => v }) => {
  const {
    cobrosPorMetodo = {},
    cobrosDelDiaPorMetodo = {}, 
    cobrosPendientesPorMetodo = {}, 
    pendientesPorMetodo = {}, 
    totalCobrosDelDia = 0,
    totalCobrosPendientes = 0,
    ventas = 0,
    totalPrendas = 0,
    ventasConCupon = 0,
    ventasConTicketCambio = 0,
    totalDescuentos = 0,
  } = data;


  const totalPendientes = Object.values(pendientesPorMetodo).reduce(
    (sum, monto) => sum + (monto || 0), 
    0
  );


  const hayCobrosDelDia = Object.values(cobrosDelDiaPorMetodo).some(monto => monto > 0);
  

  const hayCobrosPendientes = Object.values(cobrosPendientesPorMetodo).some(monto => monto > 0);

  return (
    <Section title="Ingresos" icon={<FaMoneyBillWave />} color="green">
      {/* 1. Sección de cobros de ventas del día */}
      <div className="flex items-center gap-2 font-medium text-green-700 my-2">
        <FaCalendarDay /> Cobros de ventas del día
      </div>
      
      {hayCobrosDelDia ? (
        <>
          {Object.entries(cobrosDelDiaPorMetodo).map(
            ([metodo, monto]) =>
              monto > 0 && (
                <DataRow
                  key={`day-${metodo}`}
                  label={metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                  value={formatCurrency(monto)}
                  textColor="text-green-700"
                />
              )
          )}
          <DataRow 
            label="Total cobros del día" 
            value={formatCurrency(totalCobrosDelDia)}
            textColor="text-green-700"
            isTotal
          />
        </>
      ) : (
        <div className="text-gray-500 italic text-sm mb-2">No hay cobros de ventas del día</div>
      )}
      
      <hr className="my-2" />
      
      {/* 2. Sección de cobros de ventas pendientes (anteriores) */}
      <div className="flex items-center gap-2 font-medium text-blue-600 my-2">
        <FaHistory /> Cobros de ventas pendientes
      </div>
      
      {hayCobrosPendientes ? (
        <>
          {Object.entries(cobrosPendientesPorMetodo).map(
            ([metodo, monto]) =>
              monto > 0 && (
                <DataRow
                  key={`pending-payment-${metodo}`}
                  label={metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                  value={formatCurrency(monto)}
                  textColor="text-blue-600"
                />
              )
          )}
          <DataRow 
            label="Total cobros pendientes" 
            value={formatCurrency(totalCobrosPendientes)}
            textColor="text-blue-600"
            isTotal
          />
        </>
      ) : (
        <div className="text-gray-500 italic text-sm mb-2">No hay cobros de ventas pendientes</div>
      )}
      
      <hr className="my-2" />
      
      {/* 3. Totales generales */}
      <div className="flex items-center gap-2 font-medium text-green-800 my-2">
        <FaMoneyBillWave /> Ingresos totales
      </div>
      
      {Object.entries(cobrosPorMetodo).map(
        ([metodo, monto]) =>
          monto > 0 && (
            <DataRow
              key={metodo}
              label={`Total ${metodo}`}
              value={formatCurrency(monto)}
              textColor="text-green-800"
            />
          )
      )}
      <DataRow 
        label="Total cobros" 
        value={formatCurrency(totalCobrosDelDia + totalCobrosPendientes)}
        textColor="text-green-800"
        isTotal
      />
      
      <hr className="my-2" />
      
      {/* 4. Sección de ventas y productos */}
      <DataRow label="Total ventas" value={formatCurrency(ventas)} />
      <DataRow label="Prendas vendidas" value={totalPrendas} />
      
      <hr className="my-2" />
      
      {/* 5. Sección de pendientes por cobrar (aún no cobrados) */}
      {totalPendientes > 0 && (
        <>
          <div className="flex items-center gap-2 font-medium text-amber-600 my-2">
            <FaClock /> Pendientes por cobrar
          </div>
          
          {Object.entries(pendientesPorMetodo).map(
            ([metodo, monto]) =>
              monto > 0 && (
                <DataRow
                  key={`uncollected-${metodo}`}
                  label={`${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`}
                  value={formatCurrency(monto)}
                  textColor="text-amber-600"
                />
              )
          )}
          
          <DataRow 
            label="Total pendiente" 
            value={formatCurrency(totalPendientes)}
            textColor="text-amber-600"
            isTotal
          />
          <hr className="my-2" />
        </>
      )}
      
      {/* 6. Sección de datos adicionales */}
      <DataRow label="Ventas con cupón" value={ventasConCupon} />
      <DataRow label="Ventas con ticket cambio" value={ventasConTicketCambio} />
      <DataRow
        label="Total descuentos"
        value={formatCurrency(totalDescuentos)}
      />
    </Section>
  );
};

export default IngresosSection;
