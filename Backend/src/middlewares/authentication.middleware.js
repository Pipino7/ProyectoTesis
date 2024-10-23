import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '../config/configEnv.js';
import { respondError } from '../utils/resHandler.js';

const authenticationMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return respondError(req, res, 401, "No autorizado. No hay token válido.");
    }

    const token = authHeader.split(" ")[1];

    // Verificamos el token JWT
    jwt.verify(token, ACCESS_JWT_SECRET, (err, decoded) => {
      if (err) return respondError(req, res, 403, "Token inválido o expirado.");

      req.userId = decoded.id;  // Guardamos el ID del usuario en la solicitud
      req.email = decoded.email;  // Guardamos el email del usuario en la solicitud
      
      // Asegurarnos de que los roles estén en formato de array
      req.roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];  // Convertir a array si es string

      next();  // Continuamos con la siguiente función
    });
  } catch (error) {
    return respondError(req, res, 500, "Error en la autenticación.");
  }
};

export default authenticationMiddleware;
