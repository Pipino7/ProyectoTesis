import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import AppDataSource from '../config/ConfigDB.js';
import usuario from '../entities/usuario.js';  // Asegúrate de que el nombre sea consistente
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { MoreThan } from 'typeorm';

// Cargar variables de entorno
dotenv.config();

// Configuración de nodemailer para enviar correos
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Autenticar al usuario (login)
 * @param {Object} datosLogin - Email y contraseña ingresados por el usuario
 * @returns {Object} token y datos del usuario
 */
const autenticarUsuario = async (datosLogin) => {
  try {
    const { email, password } = datosLogin;

    // Obtener el repositorio de usuarios
    const usuarioRepository = AppDataSource.getRepository(usuario);

    // Buscar el usuario en la base de datos
    const userFound = await usuarioRepository.findOneBy({ email });

    const mensajeError = 'Credenciales inválidas';

    if (!userFound) {
      console.log(`Usuario con email ${email} no encontrado`);
      throw new Error(mensajeError);
    }

    // Verificar la contraseña
    const matchPassword = await bcrypt.compare(password, userFound.contraseña);
    if (!matchPassword) {
      console.log(`Contraseña incorrecta para el usuario con email ${email}`);
      throw new Error(mensajeError);
    }

    const rolesArray = Array.isArray(userFound.rol_usuario)
      ? userFound.rol_usuario
      : [userFound.rol_usuario];

    // Generar el token JWT 
    const token = jwt.sign(
      { id: userFound.id, roles: rolesArray },
      process.env.ACCESS_JWT_SECRET,
      { expiresIn: '1h' }
    );

    const { contraseña, ...userWithoutPassword } = userFound;

    return { token, usuario: userWithoutPassword };
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
const generarTokenReset = async (email) => {
  try {
    const usuarioRepository = AppDataSource.getRepository(usuario);  // Usa `usuario`
    const user = await usuarioRepository.findOneBy({ email });

    if (!user) {
      throw new Error('Si el email está registrado, recibirá un correo para restablecer la contraseña.');
    }

    const resetToken = uuidv4();
    user.reset_token = resetToken;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000);

    await usuarioRepository.save(user);

    const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
    const resetUrl = `${BASE_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecer Contraseña',
      html: `<p>Haga clic en el siguiente enlace para restablecer su contraseña:</p><a href="${resetUrl}">${resetUrl}</a><p>Si no solicitó este correo, puede ignorarlo.</p>`
    };

    await transporter.sendMail(mailOptions);

    return 'Se ha enviado un correo para restablecer su contraseña.';
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
const resetPassword = async (token, nuevaPassword) => {
  try {
    const usuarioRepository = AppDataSource.getRepository(usuario);

    const user = await usuarioRepository.findOne({
      where: { reset_token: token, reset_token_expires: MoreThan(new Date()) }
    });

    if (!user) {
      console.log('Token inválido o expirado');
      throw new Error('Token inválido o expirado');
    }

    const salt = await bcrypt.genSalt(10);
    user.contraseña = await bcrypt.hash(nuevaPassword, salt);

    user.reset_token = null;
    user.reset_token_expires = null;

    await usuarioRepository.save(user);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Contraseña Restablecida',
      html: `<p>Su contraseña ha sido restablecida exitosamente. Si no realizó este cambio, póngase en contacto con soporte inmediatamente.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar el correo de confirmación:', error);
    }
  } catch (error) {
    console.error('Error en resetPassword:', error.message);
    throw error;
  }
};

// Exportar los servicios como un objeto por defecto
export default {
  autenticarUsuario,
  generarTokenReset,
  resetPassword,
};
