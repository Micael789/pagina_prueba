# Guía de Instalación - QR Units

Esta guía te ayudará a configurar y ejecutar el sistema completo en tu entorno local.

## Requisitos Previos

- **Node.js** 16+ y npm
- **Git**
- Navegador web moderno con soporte para cámara (para QR)

## Instalación Paso a Paso

### 1. Clonar/Descargar el Proyecto

```bash
# Si usas Git
git clone <repository-url> qr-units-project
cd qr-units-project

# O si descargaste el ZIP
unzip proyecto-vinculacion-acciones-QR.zip
cd proyecto-vinculacion-acciones-QR
```

### 2. Configurar el Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Inicializar la base de datos (opcional, se hace automáticamente)
npm run init-db

# Iniciar el servidor de desarrollo
npm run dev
```

El backend estará disponible en: `http://localhost:3001`

**Endpoints importantes:**
- Health check: `http://localhost:3001/health`
- API base: `http://localhost:3001/api/v1`
- Mock auth: `http://localhost:3001/api/v1/auth/mock-token`

### 3. Configurar el Frontend

```bash
# En una nueva terminal, navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

El frontend estará disponible en: `http://localhost:3000`

### 4. Verificar Instalación

1. **Backend**: Visita `http://localhost:3001/health` - deberías ver:
   ```json
   {
     "status": "OK",
     "timestamp": "2023-12-01T...",
     "version": "1.0.0"
   }
   ```

2. **Frontend**: Visita `http://localhost:3000` - deberías ver la página de login

3. **Conexión**: El frontend debe conectarse automáticamente al backend

## Estructura de Archivos Importante

```
proyecto-vinculacion-acciones-QR/
├── backend/
│   ├── database/              # Base de datos SQLite (se crea automáticamente)
│   │   └── units.db
│   ├── uploads/               # Archivos subidos (fotos)
│   ├── src/
│   │   ├── models/           # Modelos de datos
│   │   ├── routes/           # Rutas de API
│   │   ├── middleware/       # Middlewares
│   │   └── utils/            # Utilidades
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── services/         # Servicios y API
│   │   └── App.js           # Componente principal
│   ├── public/
│   │   └── sw.js            # Service Worker
│   └── package.json
└── docs/                     # Documentación
```

## Configuración Avanzada

### Variables de Entorno (Opcional)

Crea archivos `.env` para configuración personalizada:

**Backend (.env):**
```env
PORT=3001
JWT_SECRET=tu-secret-super-seguro
NODE_ENV=development
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_ENV=development
```

### Base de Datos

La base de datos SQLite se crea automáticamente en `backend/database/units.db` con datos de prueba:

- **6 usuarios** con diferentes roles
- **6 unidades** en diferentes estados
- Estructura completa de tablas

### Datos de Prueba

#### Usuarios Disponibles:
- **admin001** (admin) - Todos los permisos
- **warehouse001** (warehouse) - Gestión de almacén
- **delivery001** (delivery) - Entregas
- **cleaner001** (cleaner) - Limpieza
- **collection001** (collection) - Recolección
- **repair001** (repair) - Reparaciones

#### Unidades de Prueba:
- **UN001** - En almacén
- **UN002** - En ubicación
- **UN003** - En uso
- **UN004** - Para recolección
- **UN005** - En limpieza
- **UN006** - En reparación

## Resolución de Problemas

### El backend no inicia

1. Verificar que Node.js esté instalado: `node --version`
2. Verificar dependencias: `npm install` en `/backend`
3. Verificar puerto 3001 libre: `lsof -i :3001` (Mac/Linux) o `netstat -ano | findstr :3001` (Windows)

### El frontend no se conecta al backend

1. Verificar que el backend esté corriendo en puerto 3001
2. Verificar configuración del proxy en `frontend/package.json`:
   ```json
   {
     "proxy": "http://localhost:3001"
   }
   ```

### Error de permisos de cámara

1. Asegurar que el sitio tenga permisos de cámara
2. Usar HTTPS en producción para acceso a cámara
3. En desarrollo, `http://localhost` debería funcionar

### Error de CORS

Si hay errores de CORS, verificar la configuración en `backend/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### Base de datos corrupta

Eliminar y recrear la base de datos:
```bash
cd backend
rm -f database/units.db
npm run init-db
```

## Producción

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build

# Servir archivos estáticos con un servidor web
# Ejemplo con serve:
npx serve -s build -l 3000
```

### Docker (Opcional)

**Backend Dockerfile:**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
```

## Testing

### Backend
```bash
cd backend
npm test  # Si tienes tests configurados
```

### Frontend
```bash
cd frontend
npm test
```

## Monitoreo y Logs

### Backend Logs
Los logs se muestran en consola. Para producción, considera usar:
- **winston** para logging estructurado
- **morgan** para logs de HTTP (ya incluido)

### Frontend Logs
Usa las Developer Tools del navegador:
- Console para errores JavaScript
- Network para peticiones HTTP
- Application > Storage para datos offline

## Siguiente Paso

Una vez instalado, consulta:
- [Ejemplos de API](./API-Examples.md) para integración
- [README principal](../README.md) para información general

¡El sistema debería estar funcionando completamente! 🚀
