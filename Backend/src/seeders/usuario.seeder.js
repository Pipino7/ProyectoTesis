import AppDataSource from '../config/ConfigDB.js';
import bcrypt from 'bcryptjs';
import Usuario from '../entities/usuario.js';

const createAdminUser = async () => {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const adminUser = await usuarioRepository.findOne({ where: { email: 'felipepd14@gmail.com' } });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const nuevoAdmin = usuarioRepository.create({
        nombre: 'Felipe',
        email: 'felipepd14@gmail.com',
        contraseña: hashedPassword,
        rol: 'admin',
      });

      await usuarioRepository.save(nuevoAdmin);
      console.log("Usuario 'admin' creado exitosamente.");
    } else {
      console.log("El usuario 'admin' ya existe.");
    }
  } catch (error) {
    console.error("Error creando usuario 'admin':", error);
  }
};

export default createAdminUser;
