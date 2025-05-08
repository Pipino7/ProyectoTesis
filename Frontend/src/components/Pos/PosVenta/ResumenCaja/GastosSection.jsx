import React from 'react';
import Section from './Section';
import DataRow from './DataRow';
import { FaReceipt } from 'react-icons/fa';

const GastosSection = ({ data = {}, formatCurrency = v => v }) => {
  const { gastosPorMetodo = {}, gastos = 0 } = data;

  return (
    <Section title="Gastos" icon={<FaReceipt />} color="red">
      {Object.entries(gastosPorMetodo).map(
        ([metodo, monto]) =>
          monto > 0 && (
            <DataRow
              key={metodo}
              label={metodo.charAt(0).toUpperCase() + metodo.slice(1)}
              value={formatCurrency(monto)}
              textColor="text-red-600"
            />
          )
      )}
      <DataRow label="Total gastos" value={formatCurrency(gastos)} isTotal />
    </Section>
  );
};

export default GastosSection;
