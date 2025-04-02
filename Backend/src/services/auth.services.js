import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import AppDataSource from '../config/ConfigDB.js';
import usuario from '../entities/usuario.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { MoreThan } from 'typeorm';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const AuthService = {
  /**
   * Autenticar al usuario (login)
   */
  autenticarUsuario: async (datosLogin) => {
    try {
      const { email, password } = datosLogin;
      const usuarioRepository = AppDataSource.getRepository(usuario);

      const userFound = await usuarioRepository.findOneBy({ email });
      const mensajeError = 'Credenciales inválidas';

      if (!userFound) {
        throw new Error(mensajeError);
      }

      const matchPassword = await bcrypt.compare(password, userFound.contraseña);
      if (!matchPassword) {
        throw new Error(mensajeError);
      }

      const token = jwt.sign(
        {
          id: userFound.id,
          email: userFound.email,
          roles: [userFound.rol_usuario], 
        },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: '5d' }
      );
      
      

      const { contraseña, ...userWithoutPassword } = userFound;
      return { token, usuario: userWithoutPassword };
    } catch (error) {
      console.error('Error en autenticarUsuario:', error.message);
      throw error;
    }
  },

  /**
   * Generar un token para restablecer la contraseña
   */
  generarTokenReset: async (email) => {
    try {
      const usuarioRepository = AppDataSource.getRepository(usuario);
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
  },

  /**
   * Restablecer la contraseña usando el token
   */
  resetPassword: async (token, nuevaPassword) => {
    try {
      const usuarioRepository = AppDataSource.getRepository(usuario);
      const user = await usuarioRepository.findOne({
        where: {
          reset_token: token,
          reset_token_expires: MoreThan(new Date())
        }
      });

      if (!user) {
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
  }
};

export default AuthService;
