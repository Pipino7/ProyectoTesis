import bcrypt from 'bcrypt';
import AppDataSource from '../config/configDB.js';  // Asegúrate de tener AppDataSource exportado
import  Usuario  from '../entities/usuario.js';  
import { userRegisterSchema } from '../schema/usuario.schema.js';  // Importa los esquemas de validación Joi
import { v4 as uuidv4 } from 'uuid';  // Importa uuidv4 para generar identificadores únicos

// Crear un nuevo usuario (solo admin puede hacer esto)
export const crearUsuario = async (datosUsuario, rolActual) => {
  // Validar los datos antes de crear el usuario
  const { error } = userRegisterSchema.validate(datosUsuario);
  if (error) {
    throw new Error(`Error en la validación: ${error.details[0].message}`);
  }

  const { email, password, rol_usuario } = datosUsuario;

  // Verificar que solo un administrador puede crear otro administrador
  if (rol_usuario === 'admin' && rolActual !== 'admin') {
    throw new Error('Solo un administrador puede crear otro administrador.');
  }

  // Validar que el rol proporcionado es válido
  const validRoles = ['admin', 'user'];  // Define los roles permitidos
  if (!validRoles.includes(rol_usuario)) {
    throw new Error('Rol de usuario inválido');
  }

  // Obtener el repositorio del usuario
  const usuarioRepository = AppDataSource.getRepository(Usuario);

  // Encriptar la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crear un nuevo usuario con un identificador único (UUID)
  const nuevoUsuario = usuarioRepository.create({
    id: uuidv4(),  // Generar UUID
    email,
    contraseña: hashedPassword,
    rol_usuario: rol_usuario || 'admin',  // Rol predeterminado si no se proporciona
  });

  // Guardar el nuevo usuario en la base de datos
  const usuarioCreado = await usuarioRepository.save(nuevoUsuario);

  return usuarioCreado;  // Devuelve el usuario creado
};

// Servicio para eliminar un usuario por su ID
export const eliminarUsuario = async (id) => {
  // Obtener el repositorio del usuario
  const usuarioRepository = AppDataSource.getRepository(Usuario);

  // Buscar el usuario en la base de datos
  const usuario = await usuarioRepository.findOneBy({ id });
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Eliminar el usuario
  await usuarioRepository.remove(usuario);

  return usuario;  // Devuelve el usuario eliminado
};
