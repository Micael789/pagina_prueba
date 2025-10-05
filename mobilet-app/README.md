# Mobilet - Sistema de Gestión de Estatus

Una aplicación web Next.js para gestionar el estatus y ubicación de unidades móviles.

## Características

- ✅ Gestión de ubicación (Almacén/Con Cliente)
- ⚡ Control de estatus (En uso, Disponible, Limpieza, Reparación)
- 🧽 Confirmación especial para limpieza
- 📱 Diseño responsivo optimizado para móviles
- 🎨 Interfaz moderna con Tailwind CSS

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## Uso

1. Accede a la aplicación mediante código QR
2. Selecciona la ubicación actual de la unidad
3. Marca el estatus correspondiente
4. Para "Limpieza", confirma la acción marcando la casilla
5. Presiona "Guardar Cambios" para registrar

## Estructura del Proyecto

```
mobilet-app/
├── src/
│   ├── pages/
│   │   ├── _app.js          # Configuración de la app
│   │   └── index.js         # Página principal
│   └── styles/
│       └── globals.css      # Estilos globales
├── public/                  # Archivos estáticos
├── package.json            # Dependencias
├── tailwind.config.js      # Configuración de Tailwind
└── next.config.js          # Configuración de Next.js
```

## Próximas Funcionalidades

- 🔌 Conexión a base de datos
- 📊 Dashboard de administración
- 🔔 Notificaciones automáticas
- 📈 Reportes de estatus
