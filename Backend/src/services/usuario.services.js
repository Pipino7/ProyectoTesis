import bcrypt from 'bcryptjs';
import AppDataSource from '../config/ConfigDB.js';  
import  Usuario  from '../entities/usuario.js';  
import { userRegisterSchema } from '../schema/usuario.schema.js';  
import { v4 as uuidv4 } from 'uuid';  


export const crearUsuario = async (datosUsuario, rolActual) => {
  
  const { error } = userRegisterSchema.validate(datosUsuario);
  if (error) {
    throw new Error(`Error en la validación: ${error.details[0].message}`);
  }

  const { email, password, rol_usuario, nombre } = datosUsuario;

  if (rol_usuario === 'admin' && rolActual !== 'admin') {
    throw new Error('Solo un administrador puede crear otro administrador.');
  }

  const validRoles = ['admin', 'user', 'ventas'];  
  if (!validRoles.includes(rol_usuario)) {
    throw new Error('Rol de usuario inválido');
  }


  const usuarioRepository = AppDataSource.getRepository(Usuario);


  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);


  const nuevoUsuario = usuarioRepository.create({
    nombre,
    email,
    contraseña: hashedPassword,
    rol_usuario: rol_usuario || 'admin',
  });
  

  const usuarioCreado = await usuarioRepository.save(nuevoUsuario);

  return usuarioCreado;  
};


export const eliminarUsuario = async (id) => {
  const usuarioRepository = AppDataSource.getRepository(Usuario);
  const usuario = await usuarioRepository.findOneBy({ id });
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  await usuarioRepository.remove(usuario);

  return usuario;  
};
