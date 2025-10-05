# 📱 Mobilet - Sistema de Registro de Estatus

Sistema web para el control y registro de estatus de unidades móviles.

## ✨ Características

- **🎨 Diseño Moderno**: Interfaz responsive con Tailwind CSS
- **✅ Checkboxes Personalizados**: Forma "D" con animaciones suaves
- **📱 Completamente Responsive**: Adaptado para todos los dispositivos
- **🔄 Estados Dinámicos**: 4 opciones principales de estatus con lógica específica
- **✨ Animaciones**: Transiciones y efectos visuales elegantes
- **🚀 Listo para Deploy**: Archivo HTML independiente

## 🚀 Funcionalidades

### Estados de Unidades:
1. **Colocado con cliente** - Registro directo
2. **Limpieza con cliente** - Con modal de confirmación
3. **Recolección con cliente** - Registro directo
4. **Limpieza en almacén** - Con pregunta adicional de reparación

### Características Técnicas:
- ✅ Detección automática de unidad por URL (`?unit=ID`)
- ✅ Validación de formularios
- ✅ Datos estructurados en JSON
- ✅ Preparado para webhooks/APIs
- ✅ Sin dependencias locales

## 📦 Instalación y Uso

### Opción 1: Servidor Local Simple
```bash
# Usar Python (si tienes instalado)
python -m http.server 8000

# O con PHP
php -S localhost:8000

# O con Node (si tienes instalado)
npx serve .
```

### Opción 2: GitHub Pages
1. Sube este repositorio a GitHub
2. Ve a Settings > Pages
3. Selecciona "Deploy from branch: main"
4. ¡Listo! Tu app estará disponible en línea

## 🔗 URLs de Ejemplo

- Página principal: `https://tudominio.com/`
- Con unidad específica: `https://tudominio.com/?unit=001`

## 📊 Estructura de Datos

Los datos se capturan en el siguiente formato JSON:

```json
{
  "selectedStatuses": ["Limpieza con cliente"],
  "requiresRepair": null,
  "cleaningConfirmed": true,
  "unitId": "001",
  "location": "Automático",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎯 Próximos Pasos

- [ ] Integración con N8N (webhooks)
- [ ] Base de datos Vercel
- [ ] Panel de administración
- [ ] Reportes y analytics

## 🛠️ Stack Tecnológico

- **HTML5** + **CSS3** + **JavaScript vanilla**
- **Tailwind CSS** (CDN)
- **Google Fonts** (Inter)
- Sin frameworks pesados = **Ultra liviano**

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Chrome Mobile
- ✅ Responsive para móviles y tablets

---

**© 2024 Mobilet - Sistema de Control de Unidades**
