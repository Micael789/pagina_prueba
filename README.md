# Sistema de Gestión de Unidades con QR

Sistema funcional para gestionar unidades físicas (baños portátiles) usando códigos QR únicos.

## Estructura del Proyecto

```
proyecto-vinculacion-acciones-QR/
├── backend/                 # API Mock con Express + SQLite
│   ├── src/
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas de la API
│   │   ├── middleware/     # Middlewares
│   │   └── utils/          # Utilidades
│   ├── database/           # Base de datos SQLite
│   ├── package.json
│   └── server.js
├── frontend/               # React App para móvil
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Servicios API
│   │   ├── utils/          # Utilidades
│   │   └── styles/         # Estilos
│   ├── public/
│   └── package.json
└── docs/                   # Documentación
```

## Estados de Unidades

- `almacen`: Unidad disponible en almacén
- `ubicacion`: Unidad enviada a ubicación
- `en_uso`: Unidad en uso (con sub-flujo de limpiezas)
- `recoleccion`: Unidad marcada para recolección
- `almacen_limpieza`: Unidad en almacén para limpieza
- `reparacion`: Unidad en reparación

## Roles de Usuario

- `warehouse`: Gestión de almacén
- `delivery`: Entregas
- `cleaner`: Limpieza
- `collection`: Recolección
- `repair`: Reparaciones
- `admin`: Todos los permisos

## Instalación y Uso

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

El sistema completo estará disponible en:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

## Funcionalidades Implementadas

### ✅ Backend (API Mock)
- **Express + SQLite**: API REST completa con persistencia
- **Autenticación JWT**: Tokens mock para desarrollo
- **Máquina de Estados**: Validación completa de transiciones
- **Subida de Archivos**: Soporte para fotos con multer
- **Idempotencia**: Prevención de eventos duplicados
- **Validación**: Joi para validación de datos
- **CORS**: Configurado para desarrollo

### ✅ Frontend (React App)
- **Interfaz Móvil**: Diseño responsive mobile-first
- **Escaneo QR**: Simulado con opciones de prueba
- **Captura de Firma**: Canvas interactivo para firmas
- **Captura de Foto**: Integración con cámara del dispositivo  
- **Funcionalidad Offline**: LocalForage + Service Worker
- **Sincronización**: Auto-sync de eventos pendientes
- **Estado Global**: Context API para auth y sync
- **Notificaciones**: Sistema de notificaciones temporales

### ✅ Gestión de Estados
- **6 Estados**: almacen → ubicacion → en_uso → recoleccion → almacen_limpieza → reparacion
- **Transiciones Válidas**: Máquina de estados estricta
- **Permisos por Rol**: 6 roles con acciones específicas
- **Validación**: Verificación de permisos y transiciones

### ✅ Funcionalidad Offline
- **Service Worker**: Cacheo inteligente de recursos
- **Almacenamiento Local**: LocalForage para eventos offline
- **Sincronización**: Auto-sync al recuperar conexión
- **Indicadores**: UI clara de estado offline/sync

## API Endpoints

### Autenticación
- `POST /api/v1/auth/mock-token` - Generar token de desarrollo

### Unidades  
- `GET /api/v1/units/{unit_id}` - Info de unidad
- `POST /api/v1/units/{unit_id}/events` - Registrar evento
- `GET /api/v1/units/{unit_id}/events` - Historial de eventos
- `GET /api/v1/units` - Listar unidades
- `GET /api/v1/units/{unit_id}/sync-status` - Estado de sincronización

### Sistema
- `GET /health` - Health check del servidor

## Estructura de la Base de Datos

### Tabla `users`
```sql
- user_id (TEXT, PK)
- name (TEXT)  
- role (TEXT): warehouse|delivery|cleaner|collection|repair|admin
- email (TEXT)
- active (INTEGER)
- created_at (DATETIME)
```

### Tabla `units`
```sql
- unit_id (TEXT, PK)
- name (TEXT)
- current_status (TEXT): almacen|ubicacion|en_uso|recoleccion|almacen_limpieza|reparacion
- location (TEXT)
- assigned_to (TEXT, FK)
- created_at (DATETIME) 
- updated_at (DATETIME)
```

### Tabla `events`
```sql
- event_id (TEXT, PK)
- unit_id (TEXT, FK)
- event_type (TEXT)
- user_id (TEXT, FK)
- user_role (TEXT)
- status_before (TEXT)
- status_after (TEXT) 
- signature_data (TEXT) - Base64 de la firma
- photo_path (TEXT) - Ruta del archivo de foto
- geo_lat (REAL) - Latitud GPS
- geo_lng (REAL) - Longitud GPS
- notes (TEXT) - Notas adicionales
- idempotency_key (TEXT, UNIQUE) - Para evitar duplicados
- synced (INTEGER) - Estado de sincronización
- timestamp (DATETIME)
```

## Datos de Prueba Incluidos

### Usuarios Demo
- `admin001` (admin) - Administrador con todos los permisos
- `warehouse001` (warehouse) - Juan Almacén  
- `delivery001` (delivery) - María Entrega
- `cleaner001` (cleaner) - Pedro Limpieza
- `collection001` (collection) - Ana Recolección
- `repair001` (repair) - Luis Reparación

### Unidades Demo
- `UN001` - Baño Portátil #001 (almacen)
- `UN002` - Baño Portátil #002 (ubicacion) 
- `UN003` - Baño Portátil #003 (en_uso)
- `UN004` - Baño Portátil #004 (recoleccion)
- `UN005` - Baño Portátil #005 (almacen_limpieza)
- `UN006` - Baño Portátil #006 (reparacion)

## Cómo Usar el Sistema

1. **Iniciar aplicación**: Accede a `http://localhost:3000`
2. **Seleccionar usuario**: Elige cualquier usuario de prueba 
3. **Escanear QR**: Usa "QRs de prueba" o simula escaneo
4. **Ver información**: Revisa estado actual y acciones disponibles
5. **Ejecutar acción**: Selecciona acción, completa datos requeridos
6. **Confirmar**: Firma electrónica si es necesaria, agrega foto/notas
7. **Verificar cambio**: El estado de la unidad se actualiza automáticamente

## Documentación Adicional

- [📋 Guía de Instalación Detallada](./docs/Installation.md)
- [🔧 Ejemplos de API y Requests](./docs/API-Examples.md)
