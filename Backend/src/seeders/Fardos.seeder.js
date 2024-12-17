import AppDataSource from '../config/ConfigDB.js';
import Fardo from '../entities/fardo.js';
import GeneradorCodigo from '../services/helpers.services.js';
import Categoria from '../entities/categoria.js';
import Proveedor from '../entities/proveedor.js';
import Estado from '../entities/estado.js';
import Prenda from '../entities/prenda.js';

const seedFardos = async () => {
  const fardoRepository = AppDataSource.getRepository(Fardo);
  const categoriaRepository = AppDataSource.getRepository(Categoria);
  const proveedorRepository = AppDataSource.getRepository(Proveedor);
  const estadoRepository = AppDataSource.getRepository(Estado);
  const prendaRepository = AppDataSource.getRepository(Prenda);

  // Obtener o crear el estado 'bodega'
  let estadoBodega = await estadoRepository.findOne({ where: { nombre_estado: 'bodega' } });
  if (!estadoBodega) {
    estadoBodega = await estadoRepository.save({ nombre_estado: 'bodega' });
  }

  // Obtener o crear proveedores
  let proveedor1 = await proveedorRepository.findOne({ where: { nombre_proveedor: 'Benjamin' } });
  if (!proveedor1) {
    proveedor1 = await proveedorRepository.save({ nombre_proveedor: 'Benjamin' });
  }

  let proveedor2 = await proveedorRepository.findOne({ where: { nombre_proveedor: 'Profesor' } });
  if (!proveedor2) {
    proveedor2 = await proveedorRepository.save({ nombre_proveedor: 'Profesor' });
  }

  // Obtener o crear categorías
  let categoriaBlusas = await categoriaRepository.findOne({ where: { nombre_categoria: 'Blusas' } });
  if (!categoriaBlusas) {
    categoriaBlusas = await categoriaRepository.save({ nombre_categoria: 'Blusas' });
  }

  let categoriaPantalones = await categoriaRepository.findOne({ where: { nombre_categoria: 'Pantalones' } });
  if (!categoriaPantalones) {
    categoriaPantalones = await categoriaRepository.save({ nombre_categoria: 'Pantalones' });
  }

  // Datos iniciales de fardos
  const fardosIniciales = [
    {
      fecha_adquisicion: new Date(),
      costo_fardo: 150000,
      cantidad_prendas: 100,
      categoria: categoriaBlusas,
      proveedor: proveedor1,
    },
    {
      fecha_adquisicion: new Date(),
      costo_fardo: 200000,
      cantidad_prendas: 120,
      categoria: categoriaPantalones,
      proveedor: proveedor2,
    },
  ];

  for (let fardo of fardosIniciales) {
    const codigoFardo = await GeneradorCodigo.generateCodigoFardo();
    const codigoBarra = await GeneradorCodigo.generateUniqueBarcode();

    // Crear y guardar el fardo
    const nuevoFardo = fardoRepository.create({
      ...fardo,
      codigo_fardo: codigoFardo,
      codigo_barra_fardo: codigoBarra,
      costo_unitario_por_prenda: fardo.costo_fardo / fardo.cantidad_prendas,
    });

    const fardoGuardado = await fardoRepository.save(nuevoFardo);
    console.log(
      `Fardo con código '${codigoFardo}', proveedor '${fardo.proveedor.nombre_proveedor}' y categoría '${fardo.categoria.nombre_categoria}' creado exitosamente.`
    );

    // Crear y guardar las prendas asociadas al fardo
    for (let i = 0; i < fardo.cantidad_prendas; i++) {
      const nuevaPrenda = prendaRepository.create({
        fardo: fardoGuardado,
        estado: estadoBodega,
        cantidad: 1, // Cada prenda es una unidad individual
        codigo_barra_prenda: null,
        precio: null,
      });

      await prendaRepository.save(nuevaPrenda);
    }
    console.log(`Se crearon ${fardo.cantidad_prendas} prendas en estado 'bodega' para el fardo '${codigoFardo}'.`);
  }
};

export default seedFardos;
