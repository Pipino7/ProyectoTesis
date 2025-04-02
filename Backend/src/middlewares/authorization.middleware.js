import { respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

// Middleware para permitir múltiples roles
function allowRoles(...rolesPermitidos) {
  return (req, res, next) => {
    try {
      if (!req.roles || !Array.isArray(req.roles)) {
        return respondError(req, res, 403, "No autorizado. Roles no definidos.");
      }

      const tieneAcceso = req.roles.some((rol) => rolesPermitidos.includes(rol));
      if (!tieneAcceso) {
        return respondError(
          req,
          res,
          403,
          `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}.`
        );
      }

      next(); // Todo bien, continúa
    } catch (error) {
      handleError(error, `authorization.middleware -> allowRoles [${rolesPermitidos.join(", ")}]`);
      return respondError(req, res, 500, "Error en la verificación de roles.");
    }
  };
}

// Middleware para un solo rol: admin (para compatibilidad)
function isAdmin(req, res, next) {
  allowRoles("admin")(req, res, next);
}

export { isAdmin, allowRoles };
