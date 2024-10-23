// src/services/helpers.services.js
import AppDataSource from '../config/ConfigDB.js';

const generateCodigoFardo = async () => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const fardoRepository = AppDataSource.getRepository('fardo');

  for (let letra of letras) {
    for (let numero = 1; numero <= 9999; numero++) {
      const codigo = `${letra}${numero.toString().padStart(4, '0')}`;
      const existe = await fardoRepository.findOne({ where: { codigo_fardo: codigo } });
      if (!existe) {
        return codigo;
      }
    }
  }

  // Si se agotan los códigos con letra y número, generar uno aleatorio
  let codigoAleatorio;
  let existe;
  do {
    codigoAleatorio = `Z${Math.floor(1000 + Math.random() * 9000)}`; // Ejemplo: Z0001
    existe = await fardoRepository.findOne({ where: { codigo_fardo: codigoAleatorio } });
  } while (existe);

  return codigoAleatorio;
};

const generateUniqueBarcode = async () => {
  const prendaRepository = AppDataSource.getRepository('prenda');
  const fardoRepository = AppDataSource.getRepository('fardo'); // Añadido para verificar en ambas tablas
  let barcode;
  let existeEnPrenda;
  let existeEnFardo;

  do {
    const texto = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Genera 10 dígitos
    barcode = texto;

    // Verificar en la tabla de prenda
    existeEnPrenda = await prendaRepository.findOne({ where: { codigo_barra_prenda: barcode } });

    // Verificar en la tabla de fardo
    existeEnFardo = await fardoRepository.findOne({ where: { codigo_barra_fardos: barcode } });

  } while (existeEnPrenda || existeEnFardo); // Repetir si el código ya existe en alguna de las tablas

  return barcode;
};

export default {
  generateCodigoFardo,
  generateUniqueBarcode,
};
