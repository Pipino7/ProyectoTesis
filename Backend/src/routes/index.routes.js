import express from 'express';
import authRoutes from './auth.routes.js';  
import userRoutes from './users.routes.js';  
import fardoRoutes from './fardo.routes.js';
import clasificacionRoutes from './clasificacion.routes.js';
import categoriaRoutes from './Categoria.routes.js';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clasificacion', clasificacionRoutes);
router.use('/categorias', categoriaRoutes);
router.get('/', (req, res) => {
  res.send('API funcionando');
});

router.use('/fardos', fardoRoutes); 
export default router;
