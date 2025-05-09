import React from 'react';
import Section from './Section';
import DataRow from './DataRow';
import { FaExchangeAlt } from 'react-icons/fa';


const CambiosDevolucionesSection = ({ data = {} }) => {
  const {
    cambiosRealizados = 0,
    devolucionesRealizadas = 0,
    prendasDevueltas = 0,
  } = data;

  return (
    <Section title="Cambios y Devoluciones" icon={<FaExchangeAlt />} color="gray">
      <DataRow label="Cambios realizados" value={cambiosRealizados} />
      <DataRow label="Devoluciones realizadas" value={devolucionesRealizadas} />
      <hr className="my-2" />
      <DataRow label="Total prendas devueltas" value={prendasDevueltas} isTotal />
    </Section>
  );
};

export default CambiosDevolucionesSection;
