import FardoService from '../services/fardo.services.js';

const crearFardoController = async (req, res) => {
  try {
    const fardoCreado = await FardoService.crearFardo(req.body);
    res.status(201).json(fardoCreado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const eliminarFardoController = async (req, res) => {
  try {
    const { codigo_fardo } = req.params;
    if (!codigo_fardo) {
      throw new Error('El código del fardo no fue proporcionado.');
    }
    console.log('Código del fardo recibido para eliminación:', codigo_fardo);

    const fardoEliminado = await FardoService.eliminarFardo(codigo_fardo);
    res.status(200).json(fardoEliminado);
  } catch (error) {
    console.error('Error al eliminar fardo:', error);
    res.status(400).json({ error: error.message });
  }
};



const restaurarFardoController = async (req, res) => {
  try {
    const { codigo_fardo } = req.params;
    const fardoRestaurado = await FardoService.restaurarFardo(codigo_fardo);
    res.status(200).json(fardoRestaurado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const obtenerFardoPorCodigoController = async (req, res) => {
  try {
    const { codigo_fardo } = req.params;
    const fardo = await FardoService.getFardoByCodigo({ codigo_fardo, codigo_barra: req.query.codigo_barra });
    res.status(200).json(fardo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};


const obtenerTodosFardosController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      orden = 'desc',
      proveedor,
      categoria,
      precioMin,
      precioMax,
      fechaInicio,
      fechaFin,
      codigoFardo, 
    } = req.query;

    const fardos = await FardoService.getAllFardos({
      page: parseInt(page),
      limit: parseInt(limit),
      orden,
      proveedor,
      categoria,
      precioMin: parseFloat(precioMin),
      precioMax: parseFloat(precioMax),
      fechaInicio,
      fechaFin,
      codigoFardo, 
    });

    res.status(200).json(fardos);
  } catch (error) {
    console.error("Error en obtenerTodosFardosController:", error);
    res.status(400).json({ error: error.message });
  }
};



export default {
  crearFardoController,
  eliminarFardoController,
  restaurarFardoController,
  obtenerFardoPorCodigoController,
  obtenerTodosFardosController,
};
