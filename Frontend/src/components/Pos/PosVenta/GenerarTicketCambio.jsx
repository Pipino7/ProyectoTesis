import React from "react";

const GenerarTicketCambio = ({ generarTicketCambio, setGenerarTicketCambio, cuponSeleccionado }) => {
  const handleChange = (e) => {
    const newValue = e.target.checked;
    console.log(`Cambiando generarTicketCambio a: ${newValue}`);
    setGenerarTicketCambio(newValue);
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <input
        type="checkbox"
        checked={generarTicketCambio}
        onChange={handleChange}
        disabled={!!cuponSeleccionado}
        id="generar-ticket-cambio"
      />
      <label 
        htmlFor="generar-ticket-cambio" 
        className={cuponSeleccionado ? "text-gray-400" : ""}
      >
        Generar ticket de cambio
        {cuponSeleccionado && (
          <span className="ml-1 text-xs text-red-400">(no disponible con cupón)</span>
        )}
      </label>
    </div>
  );
};

export default GenerarTicketCambio;
