/**
 * Servidor Express para API Mock de gestión de unidades con QR
 * Versión simplificada para resolver errores de inicio
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (fotos, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas básicas sin autenticación por ahora

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta para generar token de prueba (solo para desarrollo)
app.post('/api/v1/auth/mock-token', (req, res) => {
  const { user_id, role } = req.body;
  
  if (!user_id || !role) {
    return res.status(400).json({ error: 'user_id y role son requeridos' });
  }

  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { user_id, role },
    'mock-secret-key',
    { expiresIn: '24h' }
  );

  res.json({ token, user_id, role });
});

// Manejo de errores
app.use(errorHandler);

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api/v1`);
  
  // Inicializar base de datos
  const initDB = require('./src/utils/initDatabase');
  initDB();
});

module.exports = app;
