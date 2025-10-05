/**
 * Middleware de autenticación JWT
 * Valida tokens y extrae información de usuario
 */

const jwt = require('jsonwebtoken');

// Secret para firmar tokens (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'mock-secret-key';

/**
 * Middleware de autenticación
 * Valida el token JWT y agrega información del usuario al request
 */
function authenticateToken(req, res, next) {
  // Obtener token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Si no hay token, rechazar
  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      code: 'MISSING_TOKEN'
    });
  }

  // Verificar token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      let errorMessage = 'Token inválido';
      let code = 'INVALID_TOKEN';

      if (err.name === 'TokenExpiredError') {
        errorMessage = 'Token expirado';
        code = 'EXPIRED_TOKEN';
      } else if (err.name === 'JsonWebTokenError') {
        errorMessage = 'Token malformado';
        code = 'MALFORMED_TOKEN';
      }

      return res.status(403).json({ 
        error: errorMessage,
        code: code
      });
    }

    // Validar que el token contiene la información necesaria
    if (!decoded.user_id || !decoded.role) {
      return res.status(403).json({ 
        error: 'Token inválido: falta información de usuario',
        code: 'INCOMPLETE_TOKEN'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role
    };

    next();
  });
}

/**
 * Middleware para verificar roles específicos
 * @param {string|string[]} allowedRoles - Roles permitidos
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Admin siempre tiene acceso
    if (userRole === 'admin' || rolesArray.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ 
      error: `Acceso denegado. Rol requerido: ${rolesArray.join(' o ')}`,
      code: 'INSUFFICIENT_PERMISSIONS',
      required_roles: rolesArray,
      user_role: userRole
    });
  };
}

/**
 * Generar token para usuario (usado en desarrollo/testing)
 * @param {string} userId - ID del usuario
 * @param {string} role - Rol del usuario
 * @param {string} expiresIn - Tiempo de expiración
 */
function generateToken(userId, role, expiresIn = '24h') {
  return jwt.sign(
    { 
      user_id: userId, 
      role: role,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Decodificar token sin verificar (para debug)
 * @param {string} token - Token a decodificar
 */
function decodeToken(token) {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  generateToken,
  decodeToken,
  JWT_SECRET
};
