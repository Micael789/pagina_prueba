/**
 * Máquina de estados para unidades
 * Define transiciones válidas y permisos por rol
 */

// Estados válidos del sistema
const STATES = {
  ALMACEN: 'almacen',
  UBICACION: 'ubicacion', 
  EN_USO: 'en_uso',
  RECOLECCION: 'recoleccion',
  ALMACEN_LIMPIEZA: 'almacen_limpieza',
  REPARACION: 'reparacion'
};

// Roles válidos del sistema
const ROLES = {
  WAREHOUSE: 'warehouse',
  DELIVERY: 'delivery',
  CLEANER: 'cleaner',
  COLLECTION: 'collection',
  REPAIR: 'repair',
  ADMIN: 'admin'
};

// Tipos de eventos disponibles
const EVENT_TYPES = {
  // Transiciones principales
  SALIDA_A_UBICACION: 'salida_a_ubicacion',
  CONFIRMAR_ENTREGA: 'confirmar_entrega',
  MARCAR_RECOLECCION: 'marcar_recoleccion',
  CONFIRMAR_RECOLECTADO: 'confirmar_recolectado',
  DISPONIBLE: 'disponible',
  
  // Limpieza
  INICIAR_LIMPIEZA: 'iniciar_limpieza',
  LIMPIEZA_REALIZADA: 'limpieza_realizada',
  
  // Reparación
  ENTRADA_REPARACION: 'entrada_reparacion',
  REPARACION_FINALIZADA: 'reparacion_finalizada'
};

// Mapa de transiciones válidas
// formato: [estado_actual]: { evento: estado_destino }
const STATE_TRANSITIONS = {
  [STATES.ALMACEN]: {
    [EVENT_TYPES.SALIDA_A_UBICACION]: STATES.UBICACION,
    [EVENT_TYPES.ENTRADA_REPARACION]: STATES.REPARACION
  },
  [STATES.UBICACION]: {
    [EVENT_TYPES.CONFIRMAR_ENTREGA]: STATES.EN_USO,
    [EVENT_TYPES.ENTRADA_REPARACION]: STATES.REPARACION
  },
  [STATES.EN_USO]: {
    [EVENT_TYPES.MARCAR_RECOLECCION]: STATES.RECOLECCION,
    [EVENT_TYPES.INICIAR_LIMPIEZA]: STATES.EN_USO, // Permanece en uso durante limpieza
    [EVENT_TYPES.LIMPIEZA_REALIZADA]: STATES.EN_USO, // Vuelve a en_uso después de limpieza
    [EVENT_TYPES.ENTRADA_REPARACION]: STATES.REPARACION
  },
  [STATES.RECOLECCION]: {
    [EVENT_TYPES.CONFIRMAR_RECOLECTADO]: STATES.ALMACEN_LIMPIEZA,
    [EVENT_TYPES.ENTRADA_REPARACION]: STATES.REPARACION
  },
  [STATES.ALMACEN_LIMPIEZA]: {
    [EVENT_TYPES.LIMPIEZA_REALIZADA]: STATES.ALMACEN,
    [EVENT_TYPES.DISPONIBLE]: STATES.ALMACEN,
    [EVENT_TYPES.ENTRADA_REPARACION]: STATES.REPARACION
  },
  [STATES.REPARACION]: {
    [EVENT_TYPES.REPARACION_FINALIZADA]: STATES.ALMACEN
  }
};

// Permisos por rol - qué eventos puede ejecutar cada rol
const ROLE_PERMISSIONS = {
  [ROLES.WAREHOUSE]: [
    EVENT_TYPES.DISPONIBLE,
    EVENT_TYPES.ENTRADA_REPARACION,
    EVENT_TYPES.CONFIRMAR_RECOLECTADO
  ],
  [ROLES.DELIVERY]: [
    EVENT_TYPES.SALIDA_A_UBICACION,
    EVENT_TYPES.CONFIRMAR_ENTREGA
  ],
  [ROLES.CLEANER]: [
    EVENT_TYPES.INICIAR_LIMPIEZA,
    EVENT_TYPES.LIMPIEZA_REALIZADA
  ],
  [ROLES.COLLECTION]: [
    EVENT_TYPES.MARCAR_RECOLECCION,
    EVENT_TYPES.CONFIRMAR_RECOLECTADO
  ],
  [ROLES.REPAIR]: [
    EVENT_TYPES.ENTRADA_REPARACION,
    EVENT_TYPES.REPARACION_FINALIZADA
  ],
  [ROLES.ADMIN]: Object.values(EVENT_TYPES) // Admin puede todo
};

// Eventos que requieren firma obligatoria
const SIGNATURE_REQUIRED = [
  EVENT_TYPES.CONFIRMAR_ENTREGA,
  EVENT_TYPES.CONFIRMAR_RECOLECTADO,
  EVENT_TYPES.SALIDA_A_UBICACION
];

/**
 * Valida si una transición de estado es válida
 */
function isValidTransition(currentState, eventType) {
  const validTransitions = STATE_TRANSITIONS[currentState];
  return validTransitions && validTransitions.hasOwnProperty(eventType);
}

/**
 * Obtiene el estado destino para una transición
 */
function getNextState(currentState, eventType) {
  if (!isValidTransition(currentState, eventType)) {
    return null;
  }
  return STATE_TRANSITIONS[currentState][eventType];
}

/**
 * Valida si un usuario tiene permisos para ejecutar un evento
 */
function hasPermission(userRole, eventType) {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions && permissions.includes(eventType);
}

/**
 * Obtiene los eventos permitidos para un usuario en un estado específico
 */
function getAllowedEvents(currentState, userRole) {
  const stateTransitions = STATE_TRANSITIONS[currentState] || {};
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  
  return Object.keys(stateTransitions).filter(eventType => 
    userPermissions.includes(eventType)
  );
}

/**
 * Verifica si un evento requiere firma
 */
function requiresSignature(eventType) {
  return SIGNATURE_REQUIRED.includes(eventType);
}

/**
 * Obtiene información descriptiva de un estado
 */
function getStateInfo(state) {
  const stateInfo = {
    [STATES.ALMACEN]: {
      name: 'En Almacén',
      description: 'Unidad disponible en almacén central',
      color: '#22c55e'
    },
    [STATES.UBICACION]: {
      name: 'En Tránsito',
      description: 'Unidad enviada hacia ubicación de destino',
      color: '#3b82f6'
    },
    [STATES.EN_USO]: {
      name: 'En Uso',
      description: 'Unidad instalada y en uso por el cliente',
      color: '#f59e0b'
    },
    [STATES.RECOLECCION]: {
      name: 'Para Recolección',
      description: 'Unidad marcada para ser recolectada',
      color: '#ef4444'
    },
    [STATES.ALMACEN_LIMPIEZA]: {
      name: 'Pendiente Limpieza',
      description: 'Unidad en almacén esperando limpieza',
      color: '#8b5cf6'
    },
    [STATES.REPARACION]: {
      name: 'En Reparación',
      description: 'Unidad en taller de reparaciones',
      color: '#6b7280'
    }
  };

  return stateInfo[state] || { name: state, description: '', color: '#6b7280' };
}

/**
 * Obtiene información descriptiva de un evento
 */
function getEventInfo(eventType) {
  const eventInfo = {
    [EVENT_TYPES.SALIDA_A_UBICACION]: 'Salida hacia ubicación',
    [EVENT_TYPES.CONFIRMAR_ENTREGA]: 'Confirmar entrega',
    [EVENT_TYPES.MARCAR_RECOLECCION]: 'Marcar para recolección',
    [EVENT_TYPES.CONFIRMAR_RECOLECTADO]: 'Confirmar recolectado',
    [EVENT_TYPES.DISPONIBLE]: 'Marcar como disponible',
    [EVENT_TYPES.INICIAR_LIMPIEZA]: 'Iniciar limpieza',
    [EVENT_TYPES.LIMPIEZA_REALIZADA]: 'Limpieza completada',
    [EVENT_TYPES.ENTRADA_REPARACION]: 'Enviar a reparación',
    [EVENT_TYPES.REPARACION_FINALIZADA]: 'Reparación finalizada'
  };

  return eventInfo[eventType] || eventType;
}

module.exports = {
  STATES,
  ROLES,
  EVENT_TYPES,
  STATE_TRANSITIONS,
  ROLE_PERMISSIONS,
  SIGNATURE_REQUIRED,
  isValidTransition,
  getNextState,
  hasPermission,
  getAllowedEvents,
  requiresSignature,
  getStateInfo,
  getEventInfo
};
