import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '../config/configEnv.js';
import { respondError } from '../utils/resHandler.js';
import AppDataSource from '../config/ConfigDB.js';
import Usuario from '../entities/usuario.js';

const authenticationMiddleware = async (req, res, next) => {
  try {

    
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.log('❌ No se encontró Bearer token en la solicitud');
      return respondError(req, res, 401, "No tienes permisos para acceder a esta funcionalidad. Por favor, inicia sesión.");
    }

    const token = authHeader.split(" ")[1];
    console.log('🔑 Token recibido:', token.substring(0, 15) + '...');

    jwt.verify(token, ACCESS_JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log('❌ Error al verificar token JWT:', err.message);
        return respondError(
          req, 
          res, 
          401, 
          "Token inválido o expirado. Por favor, inicia sesión nuevamente."
        );
      }
      
      console.log('🔐 Decoded JWT:', decoded);
      
      try {
        console.log(`🔍 Buscando usuario con ID ${decoded.id} en la base de datos...`);
        const usuarioRepository = AppDataSource.getRepository(Usuario);
        const userExists = await usuarioRepository.findOneBy({ id: decoded.id });
        
        if (!userExists) {
          console.log(`⚠️ Usuario con ID ${decoded.id} no existe en la base de datos`);
          
          res.setHeader('X-Auth-Debug', 'user-not-found-in-db');
          
          return respondError(
            req, 
            res, 
            401, 
            "Usuario no encontrado. Por favor, inicia sesión nuevamente."
          );
        }
        
        console.log(`✅ Usuario con ID ${decoded.id} encontrado en la base de datos`);
        
        req.user = {
          id: decoded.id,
          email: decoded.email,
          roles: decoded.roles,
        };

        next();
      } catch (dbError) {
        console.error('❌ Error al verificar usuario en la base de datos:', dbError);
        return respondError(req, res, 500, "Error al verificar la identidad del usuario.");
      }
    });
  } catch (error) {
    console.error('❌ Error inesperado en autenticación:', error);
    return respondError(req, res, 500, "Error inesperado en la autenticación.");
  }
};

export default authenticationMiddleware;
