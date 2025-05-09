import React from 'react';
import Section from './Section';
import DataRow from './DataRow';
import { FaCreditCard } from 'react-icons/fa';


const ReembolsosSection = ({ data = {}, formatCurrency = v => v }) => {
  const { reembolsosPorMetodo = {} } = data;
  const totalReembolsado = Object.values(reembolsosPorMetodo).reduce(
    (sum, m) => sum + m,
    0
  );

  return (
    <Section title="Reembolsos" icon={<FaCreditCard />} color="red">
      {Object.entries(reembolsosPorMetodo).map(
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
      <DataRow
        label="Total reembolsado"
        value={formatCurrency(totalReembolsado)}
        isTotal
      />
    </Section>
  );
};

export default ReembolsosSection;
