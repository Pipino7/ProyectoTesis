import React from 'react';
import Section from './Section';
import DataRow from './DataRow';
import { FaChartLine } from 'react-icons/fa';

const EstadisticasSection = ({ data = {} }) => {
  const {
    ventas = 0,
    ventasPagadas = 0,
    totalPrendas = 0,
  } = data;

  return (
    <Section title="Estadísticas" icon={<FaChartLine />} color="blue">
      <DataRow label="Ventas totales" value={ventas} />
      <DataRow label="Ventas pagadas" value={ventasPagadas} />
      <DataRow label="Prendas vendidas" value={totalPrendas} isTotal />
    </Section>
  );
};

export default EstadisticasSection;
