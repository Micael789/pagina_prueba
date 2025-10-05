/**
 * Middleware global para manejo de errores
 * Centraliza el manejo de errores y respuestas consistentes
 */

/**
 * Middleware para manejo centralizado de errores
 */
function errorHandler(err, req, res, next) {
  console.error('🚨 Error:', err);

  // Error de validación de Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Error de SQLite
  if (err.code && err.code.startsWith('SQLITE_')) {
    let message = 'Error de base de datos';
    let code = 'DATABASE_ERROR';
    
    switch (err.code) {
      case 'SQLITE_CONSTRAINT':
        message = 'Violación de restricción de base de datos';
        code = 'CONSTRAINT_VIOLATION';
        break;
      case 'SQLITE_NOTFOUND':
        message = 'Registro no encontrado';
        code = 'NOT_FOUND';
        break;
    }

    return res.status(400).json({
      error: message,
      code: code,
      details: err.message
    });
  }

  // Errores personalizados del negocio
  if (err.message === 'DUPLICATE_EVENT') {
    return res.status(409).json({
      error: 'Evento duplicado',
      code: 'DUPLICATE_EVENT',
      message: 'Este evento ya fue procesado anteriormente'
    });
  }

  if (err.message === 'INVALID_TRANSITION') {
    return res.status(400).json({
      error: 'Transición de estado inválida',
      code: 'INVALID_TRANSITION',
      message: 'La acción solicitada no es válida para el estado actual de la unidad'
    });
  }

  if (err.message === 'INSUFFICIENT_PERMISSIONS') {
    return res.status(403).json({
      error: 'Permisos insuficientes',
      code: 'INSUFFICIENT_PERMISSIONS',
      message: 'No tienes permisos para realizar esta acción'
    });
  }

  if (err.message === 'UNIT_NOT_FOUND') {
    return res.status(404).json({
      error: 'Unidad no encontrada',
      code: 'UNIT_NOT_FOUND',
      message: 'La unidad especificada no existe'
    });
  }

  if (err.message === 'SIGNATURE_REQUIRED') {
    return res.status(400).json({
      error: 'Firma requerida',
      code: 'SIGNATURE_REQUIRED',
      message: 'Esta acción requiere firma electrónica'
    });
  }

  // Error de archivo muy grande (multer)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Archivo muy grande',
      code: 'FILE_TOO_LARGE',
      message: 'El archivo excede el tamaño máximo permitido'
    });
  }

  // Error de tipo de archivo no permitido
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      error: 'Tipo de archivo no válido',
      code: 'INVALID_FILE_TYPE',
      message: 'Solo se permiten archivos de imagen'
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON malformado',
      code: 'INVALID_JSON',
      message: 'El cuerpo de la petición contiene JSON inválido'
    });
  }

  // Error 404 - Ruta no encontrada
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Recurso no encontrado',
      code: 'NOT_FOUND',
      message: 'La ruta solicitada no existe'
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Middleware para capturar rutas no encontradas
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.path}`);
  error.status = 404;
  next(error);
}

/**
 * Función helper para crear errores personalizados
 */
function createError(message, code = 'CUSTOM_ERROR', status = 400) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

module.exports = {
  errorHandler,
  notFoundHandler,
  createError
};
