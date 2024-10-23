import express from 'express';
import authRoutes from './auth.routes.js';  
import userRoutes from './users.routes.js';  
import fardoRoutes from './fardo.routes.js';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

router.get('/', (req, res) => {
  res.send('API funcionando');
});

router.use('/fardo', (req, res, next) => {
  console.log('Ruta /fardos llamada');
  next();
}, fardoRoutes);  // Log para cuando se llame a cualquier ruta bajo /fardos

export default router;
