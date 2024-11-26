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

  let codigoAleatorio;
  let existe;
  do {
    codigoAleatorio = `Z${Math.floor(1000 + Math.random() * 9000)}`; 
    existe = await fardoRepository.findOne({ where: { codigo_fardo: codigoAleatorio } });
  } while (existe);

  return codigoAleatorio;
};

const generateUniqueBarcode = async () => {
  const prendaRepository = AppDataSource.getRepository('prenda');
  const fardoRepository = AppDataSource.getRepository('fardo'); 
  let barcode;
  let existeEnPrenda;
  let existeEnFardo;

  do {
    const texto = Math.floor(1000000000 + Math.random() * 9000000000).toString(); 
    barcode = texto;


    existeEnPrenda = await prendaRepository.findOne({ where: { codigo_barra_prenda: barcode } });

    
    existeEnFardo = await fardoRepository.findOne({ where: { codigo_barra_fardo: barcode } });

  } while (existeEnPrenda || existeEnFardo); 

  return barcode;
};

export default {
  generateCodigoFardo,
  generateUniqueBarcode,
};
