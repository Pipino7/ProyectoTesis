import AppDataSource from '../config/ConfigDB.js';
import bcrypt from 'bcryptjs';
import Usuario from '../entities/usuario.js';
import dotenv from 'dotenv';


dotenv.config();

const generateRandomId = () => {
  return Math.floor(100000 + Math.random() * 999899999);
};

const createAdminUser = async () => {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@isamoda.com';
    const adminName = process.env.ADMIN_NAME || 'Administrador';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const adminUser = await usuarioRepository.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const randomId = generateRandomId();
      console.log(`⚠️ Creando usuario admin con ID aleatorio: ${randomId}`);

      const newAdmin = usuarioRepository.create({
        id: randomId,
        nombre: adminName,
        email: adminEmail,
        contraseña: hashedPassword,
        rol_usuario: 'admin'
      });
      
      await usuarioRepository.save(newAdmin);

      console.log(`Usuario administrador creado exitosamente con email: ${adminEmail}`);
    } else {
      console.log(`El usuario administrador ya existe con ID: ${adminUser.id}`);
    }
  } catch (error) {
    console.error("Error creando usuario administrador:", error);
  }
};

export default createAdminUser;
