import { respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Comprueba el rol del usuario
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 * @param {String} roleName - Nombre del rol a comprobar
 */
async function checkRole(req, res, next, roleName) {
  try {
    // Verificamos si req.roles está definido y contiene un array de roles
    if (!req.roles || !Array.isArray(req.roles)) {
      return respondError(req, res, 403, "No autorizado. Roles no definidos.");
    }

    // Comprobar si el usuario tiene el rol necesario
    if (!req.roles.includes(roleName)) {
      return respondError(
        req,
        res,
        403,  // Error de acceso denegado
        `Acceso denegado. Se requiere el rol de ${roleName} para realizar esta acción.`
      );
    }

    next();  // Si el rol es válido, pasa al siguiente middleware/controlador
  } catch (error) {
    handleError(error, `authorization.middleware -> checkRole -> ${roleName}`);
    return respondError(req, res, 500, "Error en la verificación de roles.");
  }
}

/**
 * Middleware para comprobar si el usuario es administrador
 */
export function isAdmin(req, res, next) {
  checkRole(req, res, next, "admin");
}
