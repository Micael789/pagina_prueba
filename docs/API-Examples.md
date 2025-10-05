# Ejemplos de API - QR Units

Esta documentación proporciona ejemplos completos de cómo usar la API del sistema de gestión de unidades.

## Autenticación

### Generar Token de Desarrollo
```bash
curl -X POST http://localhost:3001/api/v1/auth/mock-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "admin001",
    "role": "admin"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "admin001", 
  "role": "admin"
}
```

## Endpoints de Unidades

### Obtener Información de Unidad

```bash
curl -X GET http://localhost:3001/api/v1/units/UN001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "unit_id": "UN001",
    "name": "Baño Portátil #001",
    "current_status": "almacen",
    "location": "Almacén Central",
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T15:30:00.000Z",
    "state_info": {
      "name": "En Almacén",
      "description": "Unidad disponible en almacén central",
      "color": "#22c55e"
    },
    "available_actions": [
      {
        "event_type": "salida_a_ubicacion",
        "name": "Salida hacia ubicación",
        "requires_signature": true
      }
    ],
    "user_role": "admin"
  }
}
```

### Registrar Evento

```bash
curl -X POST http://localhost:3001/api/v1/units/UN001/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "salida_a_ubicacion",
    "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "location": "Obra Norte - Sector A",
    "notes": "Entrega programada para las 14:00",
    "geo_lat": -34.6118,
    "geo_lng": -58.3960,
    "idempotency_key": "event_123456789"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Evento registrado correctamente",
  "data": {
    "event_id": "evt_987654321",
    "timestamp": "2023-12-01T16:00:00.000Z",
    "unit_id": "UN001",
    "event_type": "salida_a_ubicacion",
    "status_before": "almacen",
    "status_after": "ubicacion",
    "photo_uploaded": false
  }
}
```

### Registrar Evento con Foto

```bash
curl -X POST http://localhost:3001/api/v1/units/UN001/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "event_type=confirmar_entrega" \
  -F "signature_data=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." \
  -F "notes=Entrega completada sin problemas" \
  -F "idempotency_key=event_123456790" \
  -F "photo=@/path/to/photo.jpg"
```

### Obtener Historial de Eventos

```bash
curl -X GET "http://localhost:3001/api/v1/units/UN001/events?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "unit_id": "UN001",
    "events": [
      {
        "event_id": "evt_987654321",
        "unit_id": "UN001",
        "event_type": "salida_a_ubicacion",
        "event_name": "Salida hacia ubicación",
        "user_id": "delivery001",
        "user_name": "María Entrega",
        "user_role": "delivery",
        "status_before": "almacen",
        "status_after": "ubicacion", 
        "signature_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "photo_path": "1701446400000-abc123.jpg",
        "geo_lat": -34.6118,
        "geo_lng": -58.3960,
        "notes": "Entrega programada para las 14:00",
        "timestamp": "2023-12-01T16:00:00.000Z",
        "state_before_info": {
          "name": "En Almacén",
          "description": "Unidad disponible en almacén central",
          "color": "#22c55e"
        },
        "state_after_info": {
          "name": "En Tránsito", 
          "description": "Unidad enviada hacia ubicación de destino",
          "color": "#3b82f6"
        }
      }
    ],
    "total": 1
  }
}
```

### Listar Unidades

```bash
curl -X GET "http://localhost:3001/api/v1/units?status=almacen&location=Almacén" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verificar Estado de Sincronización

```bash
curl -X GET http://localhost:3001/api/v1/units/UN001/sync-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "unit_id": "UN001",
    "pending_events": 0,
    "events": []
  }
}
```

## Códigos de Error

### 400 - Bad Request
```json
{
  "error": "Error de validación",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "event_type",
      "message": "event_type es requerido"
    }
  ]
}
```

### 401 - No autorizado
```json
{
  "error": "Token de acceso requerido",
  "code": "MISSING_TOKEN"
}
```

### 403 - Permisos insuficientes
```json
{
  "error": "Permisos insuficientes",
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "No tienes permisos para realizar esta acción"
}
```

### 404 - Unidad no encontrada
```json
{
  "error": "Unidad no encontrada", 
  "code": "UNIT_NOT_FOUND",
  "message": "La unidad especificada no existe"
}
```

### 409 - Evento duplicado
```json
{
  "error": "Evento duplicado",
  "code": "DUPLICATE_EVENT", 
  "message": "Este evento ya fue procesado anteriormente"
}
```

## Transiciones de Estado Válidas

| Estado Actual | Evento | Estado Destino | Roles Permitidos |
|---------------|---------|----------------|------------------|
| almacen | salida_a_ubicacion | ubicacion | delivery, admin |
| almacen | entrada_reparacion | reparacion | warehouse, repair, admin |
| ubicacion | confirmar_entrega | en_uso | delivery, admin |
| ubicacion | entrada_reparacion | reparacion | repair, admin |
| en_uso | marcar_recoleccion | recoleccion | collection, admin |
| en_uso | iniciar_limpieza | en_uso | cleaner, admin |
| en_uso | limpieza_realizada | en_uso | cleaner, admin |
| en_uso | entrada_reparacion | reparacion | repair, admin |
| recoleccion | confirmar_recolectado | almacen_limpieza | collection, warehouse, admin |
| almacen_limpieza | limpieza_realizada | almacen | cleaner, admin |
| almacen_limpieza | disponible | almacen | warehouse, admin |
| reparacion | reparacion_finalizada | almacen | repair, admin |

## Ejemplos con JavaScript/Fetch

### Configuración Base
```javascript
const API_BASE = 'http://localhost:3001/api/v1';
const TOKEN = 'your-jwt-token-here';

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la petición');
  }
  
  return await response.json();
};
```

### Obtener unidad
```javascript
const getUnit = async (unitId) => {
  try {
    const data = await apiRequest(`/units/${unitId}`);
    console.log('Unidad:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Registrar evento
```javascript
const registerEvent = async (unitId, eventData) => {
  try {
    const data = await apiRequest(`/units/${unitId}/events`, {
      method: 'POST',
      body: JSON.stringify({
        ...eventData,
        idempotency_key: `event_${Date.now()}`
      })
    });
    
    console.log('Evento registrado:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error registrando evento:', error.message);
  }
};
```

## Health Check

```bash
curl -X GET http://localhost:3001/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-01T16:00:00.000Z",
  "version": "1.0.0"
}
```
