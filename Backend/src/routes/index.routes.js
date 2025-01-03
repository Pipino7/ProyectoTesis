import express from 'express';
import authRoutes from './auth.routes.js';  
import userRoutes from './users.routes.js';  
import fardoRoutes from './fardo.routes.js';
import clasificacionRoutes from './clasificacion.routes.js';
import categoriaRoutes from './Categoria.routes.js';
import ventaRoutes from './venta.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clasificacion', clasificacionRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/fardos', fardoRoutes);
router.use('/ventas', ventaRoutes); 

// Ruta base para probar el estado de la API
router.get('/', (_, res) => {
  res.send('API funcionando');
});

export default router;
