import { userLoginSchema } from '../schema/usuario.schema.js';  // Validación para el login
import { passwordResetRequestSchema, passwordResetSchema } from '../schema/auth.schema.js';  // Validación para el reset de contraseña
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import AppDataSource from '../config/configDB.js';  
import usuario from '../entities/usuario.js';  
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { MoreThan } from 'typeorm';

// Cargar variables de entorno
dotenv.config();

// Configuración de nodemailer para enviar correos
const transporter = nodemailer.createTransport({
  service: 'Gmail',  // Configura el servicio de correo (puede ser otro proveedor)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
/**
 * Autenticar al usuario (login)
 * @param {Object} datosLogin - Email y contraseña ingresados por el usuario
 * @returns {Object} token y datos del usuario
 */
export const autenticarUsuario = async (datosLogin) => {
  try {
    // Validar los datos con Joi
    const { error, value } = userLoginSchema.validate(datosLogin);
    if (error) {
      throw new Error(`Error en la validación: ${error.details[0].message}`);
    }

    const { email, password } = value;

    // Obtener el repositorio de usuarios
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    // Buscar el usuario en la base de datos
    const userFound = await usuarioRepository.findOneBy({ email });

    // Mensaje genérico para evitar enumeración de usuarios
    const mensajeError = 'Credenciales inválidas';

    if (!userFound) {
      throw new Error(mensajeError);
    }

    // Verificar la contraseña
    const matchPassword = await bcrypt.compare(password, userFound.contraseña);
    if (!matchPassword) {
      throw new Error(mensajeError);
    }

    // Asegura de que roles sea un array, incluso si tiene solo un rol
    const rolesArray = Array.isArray(userFound.rol_usuario)
      ? userFound.rol_usuario
      : [userFound.rol_usuario];

    // Generar el token JWT 
    const token = jwt.sign(
      { id: userFound.id, roles: rolesArray },  // roles como array
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Excluir información sensible
    const { contraseña, ...userWithoutPassword } = userFound;

    return { token, usuario: userWithoutPassword };  // Devuelve el token y los datos del usuario sin la contraseña
  } catch (error) {
    console.error('Error en autenticarUsuario:', error.message);
    throw error;
  }
};

/**
 * Generar un token para restablecer la contraseña
 * @param {String} email - El correo electrónico del usuario
 * @returns {String} resetToken - Token generado
 */
export const generarTokenReset = async (email) => {
  try {
    // Validar el email con Joi
    const { error, value } = passwordResetRequestSchema.validate({ email });
    if (error) {
      throw new Error(`Error en la validación: ${error.details[0].message}`);
    }

    // Obtener el repositorio de usuarios
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    // Buscar el usuario en la base de datos
    const usuario = await usuarioRepository.findOneBy({ email: value.email });

    if (!usuario) {
      // Mensaje genérico para evitar enumeración de usuarios
      throw new Error('Si el email está registrado, recibirá un correo para restablecer la contraseña.');
    }

    // Generar un token único (UUID) para restablecer la contraseña
    const resetToken = uuidv4();

    // Guardar el token y su fecha de expiración en la base de datos
    usuario.reset_token = resetToken;
    usuario.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000);  // 1 hora desde ahora

    await usuarioRepository.save(usuario);

    // Construir la URL de restablecimiento (usar variable de entorno para la base URL)
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
    const resetUrl = `${BASE_URL}/reset-password/${resetToken}`;

    // Configurar el correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecer Contraseña',
      html: `<p>Haga clic en el siguiente enlace para restablecer su contraseña:</p><a href="${resetUrl}">${resetUrl}</a><p>Si no solicitó este correo, puede ignorarlo.</p>`
    };

    // Enviar el correo electrónico
    await transporter.sendMail(mailOptions);

    return 'Se ha enviado un correo para restablecer su contraseña.';  // Mensaje genérico
  } catch (error) {
    console.error('Error en generarTokenReset:', error.message);
    throw error;
  }
};

/**
 * Restablecer la contraseña usando el token
 * @param {String} token - Token recibido por el usuario
 * @param {String} nuevaPassword - La nueva contraseña que se desea establecer
 * @returns {Promise<void>} 
 */
export const resetPassword = async (token, nuevaPassword) => {
  try {
    // Validar el token y la nueva contraseña con Joi
    const { error, value } = passwordResetSchema.validate({ token, nuevaPassword });
    if (error) {
      throw new Error(`Error en la validación: ${error.details[0].message}`);
    }

    // Obtener el repositorio de usuarios
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    // Buscar el usuario con el token y verificar que no haya expirado
    const usuario = await usuarioRepository.findOne({
      where: { reset_token: token, reset_token_expires: MoreThan(new Date()) }
    });

    if (!usuario) {
      throw new Error('Token inválido o expirado');
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.contraseña = await bcrypt.hash(value.nuevaPassword, salt);

    // Eliminar el token de restablecimiento
    usuario.reset_token = null;
    usuario.reset_token_expires = null;

    // Guardar los cambios en la base de datos
    await usuarioRepository.save(usuario);

    // Enviar un correo electrónico notificando que la contraseña ha sido cambiada
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: usuario.email,
      subject: 'Contraseña Restablecida',
      html: `<p>Su contraseña ha sido restablecida exitosamente. Si no realizó este cambio, póngase en contacto con soporte inmediatamente.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar el correo de confirmación:', error);
      // No es necesario lanzar un error aquí, ya que la contraseña ya fue cambiada
    }
  } catch (error) {
    console.error('Error en resetPassword:', error.message);
    throw error;
  }
};
