import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '../config/configEnv.js';
import { respondError } from '../utils/resHandler.js';

const authenticationMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return respondError(req, res, 401, "No tienes permisos para acceder a esta funcionalidad. Por favor, inicia sesión.");
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, ACCESS_JWT_SECRET, (err, decoded) => {
      if (err) {
        return respondError(
          req, 
          res, 
          403, 
          "No tienes permisos para esta funcionalidad. El token proporcionado es inválido o ha expirado."
        );
      }

      req.userId = decoded.id;
      req.email = decoded.email;
      req.roles = decoded.roles; 


      next();
    });
  } catch (error) {
    return respondError(req, res, 500, "Ocurrió un error inesperado en la autenticación. Por favor, intenta nuevamente.");
  }
};

export default authenticationMiddleware;
