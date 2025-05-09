import express from 'express';
import authRoutes from './auth.routes.js';  
import userRoutes from './users.routes.js';  
import fardoRoutes from './fardo.routes.js';
import clasificacionRoutes from './clasificacion.routes.js';
import categoriaRoutes from './Categoria.routes.js';
import ventaRoutes from './venta.routes.js';
import movimientoRoutes from './movimiento.routes.js';
import cambiosRoutes from './cambio.routes.js';
import devolucionRoutes from './devolucion.routes.js'; 
import cuponRoutes from './cupon.routes.js';
import GastoRouters from './gasto.routes.js';
import cajaRouters from './caja.routes.js'; 
import MetodoDePagoRouters from './metodoPago.routes.js'; 
import cobroRoutes from './cobro.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clasificacion', clasificacionRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/fardos', fardoRoutes);
router.use('/ventas', ventaRoutes); 
router.use('/movimientos', movimientoRoutes);
router.use('/cambios', cambiosRoutes);	
router.use('/devoluciones', devolucionRoutes); 
router.use('/cupones', cuponRoutes); 
router.use('/gastos', GastoRouters); 
router.use('/caja', cajaRouters); 
router.use('/metodos-pago', MetodoDePagoRouters); 
router.use('/cobros', cobroRoutes);
router.get('/', (_, res) => {
  res.send('API funcionando');
});

export default router;
