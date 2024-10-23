import AppDataSource from '../config/ConfigDB.js';
import bcrypt from 'bcryptjs';
import usuario from '../entities/usuario.js';


/**
 * Crea el rol 'admin' y el usuario 'admin' por defecto en la base de datos.
 * @async
 * @function createAdminUser
 * @returns {Promise<void>}
 */
export const createAdminUser = async () => {
  try {
    // Inicializa el repositorio de usuarios a través de TypeORM
    const usuarioRepository = AppDataSource.getRepository(usuario);

    // Verifica si ya existe un usuario 'admin'
    const adminUser = await usuarioRepository.findOne({ where: { email: 'felipepd14@gmail.com' } });

    if (!adminUser) {
      // Si el usuario 'admin' no existe, crea uno con un email y contraseña cifrada
      const hashedPassword = await bcrypt.hash('admin123', 10);  // Cifra la contraseña

      // Crea un nuevo usuario 'admin'
      const nuevoAdmin = usuarioRepository.create({
        nombre: 'Felipe',
        email: 'felipepd14@gmail.com',
        contraseña: hashedPassword,
        rol: 'admin',
      });

      // Guarda el usuario en la base de datos
      await usuarioRepository.save(nuevoAdmin);

      console.log("Usuario 'admin' creado exitosamente.");
    } else {
      console.log("El usuario 'admin' ya existe.");
    }
  } catch (error) {
    console.error("Error creando usuario 'admin':", error);
  }
};
