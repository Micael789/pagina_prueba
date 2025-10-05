/**
 * Servidor Express simplificado para testing inicial
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

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta para generar token de prueba
app.post('/api/v1/auth/mock-token', (req, res) => {
  const { user_id, role } = req.body;
  
  if (!user_id || !role) {
    return res.status(400).json({ error: 'user_id y role son requeridos' });
  }

  // Token simulado
  const token = `mock-token-${user_id}-${Date.now()}`;

  res.json({ token, user_id, role });
});

// Datos mock de unidades
const mockUnits = {
  'UN001': {
    unit_id: 'UN001',
    name: 'Baño Portátil #001',
    current_status: 'almacen',
    location: 'Almacén Central',
    state_info: {
      name: 'En Almacén',
      description: 'Unidad disponible en almacén central',
      color: '#22c55e'
    },
    available_actions: [
      {
        event_type: 'salida_a_ubicacion',
        name: 'Salida hacia ubicación',
        requires_signature: true
      }
    ]
  },
  'UN002': {
    unit_id: 'UN002',
    name: 'Baño Portátil #002',
    current_status: 'ubicacion',
    location: 'Obra Norte - Sector A',
    state_info: {
      name: 'En Tránsito',
      description: 'Unidad enviada hacia ubicación de destino',
      color: '#3b82f6'
    },
    available_actions: [
      {
        event_type: 'confirmar_entrega',
        name: 'Confirmar entrega',
        requires_signature: true
      }
    ]
  },
  'UN003': {
    unit_id: 'UN003',
    name: 'Baño Portátil #003',
    current_status: 'en_uso',
    location: 'Obra Sur - Sector B',
    state_info: {
      name: 'En Uso',
      description: 'Unidad instalada y en uso por el cliente',
      color: '#f59e0b'
    },
    available_actions: [
      {
        event_type: 'marcar_recoleccion',
        name: 'Marcar para recolección',
        requires_signature: false
      },
      {
        event_type: 'iniciar_limpieza',
        name: 'Iniciar limpieza',
        requires_signature: false
      }
    ]
  }
};

// Ruta para obtener información de unidad
app.get('/api/v1/units/:unitId', (req, res) => {
  const { unitId } = req.params;
  const unit = mockUnits[unitId];
  
  if (!unit) {
    return res.status(404).json({ 
      error: 'Unidad no encontrada',
      code: 'UNIT_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    data: {
      ...unit,
      user_role: 'admin' // Por simplicidad, todos son admin por ahora
    }
  });
});

// Ruta para registrar eventos (simulado)
app.post('/api/v1/units/:unitId/events', (req, res) => {
  const { unitId } = req.params;
  const unit = mockUnits[unitId];
  
  if (!unit) {
    return res.status(404).json({ 
      error: 'Unidad no encontrada',
      code: 'UNIT_NOT_FOUND'
    });
  }

  // Simular registro exitoso
  res.status(201).json({
    success: true,
    message: 'Evento registrado correctamente (simulado)',
    data: {
      event_id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      unit_id: unitId,
      event_type: req.body.event_type,
      offline: false
    }
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`✅ Servidor simplificado listo para pruebas`);
});

module.exports = app;
