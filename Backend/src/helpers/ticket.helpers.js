// src/helpers/ticket.helpers.js
const TicketHelper = {
    validarVigenciaTicket: (fechaVenta, diasValidos = 7) => {
      const hoy = new Date();
      const fecha = new Date(fechaVenta);
      const diferenciaEnDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
      if (diferenciaEnDias > diasValidos) {
        throw new Error(`El ticket de cambio ha expirado. Validez máxima: ${diasValidos} días.`);
      }
    }
  };
  
  export default TicketHelper;
  