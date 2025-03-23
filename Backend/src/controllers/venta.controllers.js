import VentasService from '../services/venta.services.js';

const VentasController = {
  registrarVenta: async (req, res) => {
    try {
      const datosVenta = req.body;
      const resultado = await VentasService.registrarVenta(datosVenta);
      res.status(201).json(resultado);
    } catch (error) {
      if (error.message.includes('No hay suficiente stock')) {
        return res.status(409).json({ error: 'Conflicto: ' + error.message }); 
      }
      if (error.message.includes('Método de pago no válido')) {
        return res.status(400).json({ error: 'Validación: ' + error.message }); 
      }
      res.status(500).json({ error: 'Error interno del servidor: ' + error.message }); 
    }
  },


  listarVentas: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const resultado = await VentasService.listarVentas({ page, limit });
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar ventas.' });
    }
  },

  verDetalleVenta: async (req, res) => {
    try {
      const { id } = req.params;
      const resultado = await VentasService.verDetalleVenta(id);
      if (!resultado) {
        return res.status(404).json({ error: 'Venta no encontrada.' });
      }
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener detalle de la venta.' });
    }
  },
};

export default VentasController;
