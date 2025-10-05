# 🚀 Mobilet - Sistema de Gestión de Estatus (Versión Simple)

Una aplicación web completamente funcional que **NO requiere instalación** de dependencias.

## ✨ Características Implementadas

- ✅ **Gestión de Ubicación**: Almacén (default) / Con Cliente  
- ⚡ **Control de Estatus**: En uso, Disponible, Limpieza, Reparación
- 🧽 **Confirmación Especial**: Para limpieza con checkbox obligatorio
- 📱 **Diseño Responsivo**: Optimizado para móviles y tablets
- 🎨 **Interfaz Moderna**: Con Tailwind CSS y colores de marca Mobilet
- 🔗 **URLs Específicas**: Soporte para códigos QR únicos por unidad

## 🚀 Uso Inmediato

### Opción 1: Archivo Principal
1. Abre `index.html` directamente en tu navegador
2. La página funcionará inmediatamente sin instalación

### Opción 2: URLs con ID de Unidad
1. Abre `unit-001.html` para simular unidad 001
2. Abre `unit-002.html` para simular unidad 002
3. O usa `index.html?unit=TU_ID` para cualquier ID

## 📱 Flujo de Usuario

1. **Seleccionar Ubicación**: Almacén o Con Cliente
2. **Marcar Estatus**: Entre las 4 opciones disponibles
3. **Confirmar Limpieza**: Si es necesario, marcar checkbox
4. **Guardar Cambios**: Presionar botón para registrar

## 🔧 Funcionalidades Técnicas

- **Estado Dinámico**: El botón de envío aparece automáticamente
- **Validación Especial**: Para limpieza requiere confirmación
- **Logging**: Los datos se muestran en consola del navegador
- **Responsive**: Se adapta a cualquier tamaño de pantalla

## 📋 Para Conectar Base de Datos

El código está preparado para conectar a una base de datos. Los datos se capturan en:

```javascript
{
  unitId: "001",
  location: "Almacén",
  status: "En uso", 
  cleaningConfirmed: true,
  timestamp: "2024-10-02T20:31:29.000Z"
}
```

## 🌐 Para Desplegar

1. **Servidor Local**: Cualquier servidor HTTP
2. **Hosting Web**: Subir archivos a cualquier hosting
3. **Códigos QR**: Generar QRs apuntando a las URLs específicas

## 📞 Soporte

- Abre DevTools (F12) para ver logs
- Todos los cambios se registran en console.log()
- Preparado para integración con backend
