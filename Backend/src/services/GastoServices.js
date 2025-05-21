import CajaHelpers from '../helpers/caja.helpers.js';
import { Gasto, Fardo, Usuario } from '../entities/index.js';
import MovimientoService from './movimiento.services.js'; 

const GastoService = {
  async crearGasto(manager, usuario_id, data) {
    const { monto, motivo, tipo, codigo_fardo, codigo_barra_fardo } = data;

    let fardoEncontrado = null;
    let cajaSesion = null;
    if (tipo === 'fardo') {
      if (codigo_fardo) {
        fardoEncontrado = await manager.findOne(Fardo, { where: { codigo_fardo } });
      } else {
        fardoEncontrado = await manager.findOne(Fardo, { where: { codigo_barra_fardo } });
      }
      if (!fardoEncontrado) {
        throw new Error('❌ El código de fardo ingresado no corresponde a ningún fardo registrado.');
      }
    }

    if (tipo === 'caja') {
      cajaSesion = await CajaHelpers.obtenerCajaActiva(manager, usuario_id);
      if (!cajaSesion) {
        throw new Error('❌ No se puede registrar un gasto de caja sin tener una sesión de caja abierta.');
      }
    }
    const gasto = {
      monto,
      motivo,
      tipo,
      usuario: null,
      fardo: null,
      caja_sesion: null
    };
    gasto.fuera_de_caja = tipo !== 'caja';

    if (usuario_id) {
      const usuario = await manager.findOne(Usuario, { where: { id: usuario_id } });
      if (usuario) gasto.usuario = usuario;
    }
    if (fardoEncontrado)    gasto.fardo = fardoEncontrado;
    if (cajaSesion)         gasto.caja_sesion = cajaSesion;

    const gastoGuardado = await manager.save(Gasto, gasto);

    await MovimientoService.registrarMovimiento({
      accion: 'gasto',
      cantidad: 1,
      fardo_id: fardoEncontrado?.id || null,
      usuario_id,
      descripcion: motivo,
      gasto_id: gastoGuardado.id 
    });

    return gastoGuardado;
  },

  async eliminarGasto(manager, usuario_id, gasto_id) {
    const gasto = await manager.findOne(Gasto, {
      where: { id: gasto_id },
      relations: ['caja_sesion', 'fardo'],
    });
    if (!gasto) throw new Error('❌ Gasto no encontrado.');

    const observacion = `Eliminación de gasto: ${gasto.motivo}`;

    await manager.remove(Gasto, gasto);


    await MovimientoService.registrarMovimiento({
      accion: 'eliminacion_gasto',
      cantidad: 1,
      fardo_id:   gasto.fardo?.id || null,
      usuario_id,
      descripcion: observacion
    });

    return { mensaje: 'Gasto eliminado correctamente.' };
  },

  async listarGastosPorUsuario(manager, usuario_id) {
    return manager.find(Gasto, {
      where: { usuario: { id: usuario_id } },
      relations: ['fardo', 'caja_sesion'],
      order: { fecha: 'DESC' },
    });
  },
};

export default GastoService;
