/**
 * Rutas de la API para gestión de unidades
 * Maneja operaciones CRUD y eventos de unidades
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const Unit = require('../models/Unit');
const Event = require('../models/Event');
const { 
  isValidTransition, 
  getNextState, 
  hasPermission, 
  getAllowedEvents,
  requiresSignature,
  getStateInfo,
  getEventInfo
} = require('../utils/stateMachine');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      const error = new Error('Solo se permiten archivos de imagen');
      error.code = 'INVALID_FILE_TYPE';
      cb(error);
    }
  }
});

// Esquemas de validación con Joi
const eventSchema = Joi.object({
  event_type: Joi.string().required(),
  signature_data: Joi.string().allow('', null),
  geo_lat: Joi.number().min(-90).max(90).allow(null),
  geo_lng: Joi.number().min(-180).max(180).allow(null),
  notes: Joi.string().max(1000).allow('', null),
  idempotency_key: Joi.string().required(),
  location: Joi.string().allow('', null)
});

/**
 * GET /api/v1/units/:unitId
 * Obtiene información de una unidad específica
 */
router.get('/:unitId', async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const unit = new Unit();
    
    const unitData = await unit.getById(unitId);
    
    if (!unitData) {
      const error = new Error('UNIT_NOT_FOUND');
      return next(error);
    }

    // Obtener eventos permitidos para el usuario actual
    const allowedEvents = getAllowedEvents(unitData.current_status, req.user.role);
    
    // Mapear eventos con información descriptiva
    const availableActions = allowedEvents.map(eventType => ({
      event_type: eventType,
      name: getEventInfo(eventType),
      requires_signature: requiresSignature(eventType)
    }));

    // Información del estado actual
    const stateInfo = getStateInfo(unitData.current_status);

    res.json({
      success: true,
      data: {
        ...unitData,
        state_info: stateInfo,
        available_actions: availableActions,
        user_role: req.user.role
      }
    });

    unit.close();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/units/:unitId/events
 * Obtiene el historial de eventos de una unidad
 */
router.get('/:unitId/events', async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { limit = 50 } = req.query;
    
    const unit = new Unit();
    const event = new Event();
    
    // Verificar que la unidad existe
    const unitData = await unit.getById(unitId);
    if (!unitData) {
      const error = new Error('UNIT_NOT_FOUND');
      return next(error);
    }

    // Obtener historial de eventos
    const events = await event.getByUnit(unitId, parseInt(limit));
    
    // Enriquecer eventos con información descriptiva
    const enrichedEvents = events.map(evt => ({
      ...evt,
      event_name: getEventInfo(evt.event_type),
      state_before_info: getStateInfo(evt.status_before),
      state_after_info: getStateInfo(evt.status_after)
    }));

    res.json({
      success: true,
      data: {
        unit_id: unitId,
        events: enrichedEvents,
        total: events.length
      }
    });

    unit.close();
    event.close();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/units/:unitId/events
 * Registra un nuevo evento para una unidad
 */
router.post('/:unitId/events', upload.single('photo'), async (req, res, next) => {
  try {
    const { unitId } = req.params;
    
    // Validar datos de entrada
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const unit = new Unit();
    const event = new Event();
    
    // Verificar que la unidad existe
    const unitData = await unit.getById(unitId);
    if (!unitData) {
      const error = new Error('UNIT_NOT_FOUND');
      return next(error);
    }

    const currentState = unitData.current_status;
    const eventType = value.event_type;
    
    // Validar que el usuario tiene permisos para este evento
    if (!hasPermission(req.user.role, eventType)) {
      const error = new Error('INSUFFICIENT_PERMISSIONS');
      return next(error);
    }

    // Validar que la transición es válida
    if (!isValidTransition(currentState, eventType)) {
      const error = new Error('INVALID_TRANSITION');
      return next(error);
    }

    // Validar firma si es requerida
    if (requiresSignature(eventType) && !value.signature_data) {
      const error = new Error('SIGNATURE_REQUIRED');
      return next(error);
    }

    // Obtener el próximo estado
    const nextState = getNextState(currentState, eventType);

    // Verificar idempotencia
    const existingEvent = await event.getByIdempotencyKey(value.idempotency_key);
    if (existingEvent) {
      return res.status(200).json({
        success: true,
        message: 'Evento ya procesado anteriormente',
        data: {
          event_id: existingEvent.event_id,
          timestamp: existingEvent.timestamp,
          status: 'duplicate'
        }
      });
    }

    // Preparar datos del evento
    const eventData = {
      unit_id: unitId,
      event_type: eventType,
      user_id: req.user.user_id,
      user_role: req.user.role,
      status_before: currentState,
      status_after: nextState,
      signature_data: value.signature_data,
      photo_path: req.file ? req.file.filename : null,
      geo_lat: value.geo_lat,
      geo_lng: value.geo_lng,
      notes: value.notes,
      idempotency_key: value.idempotency_key
    };

    // Crear el evento
    const eventResult = await event.create(eventData);

    // Actualizar el estado de la unidad
    await unit.updateStatus(unitId, nextState, value.location);

    res.status(201).json({
      success: true,
      message: 'Evento registrado correctamente',
      data: {
        event_id: eventResult.event_id,
        timestamp: eventResult.timestamp,
        unit_id: unitId,
        event_type: eventType,
        status_before: currentState,
        status_after: nextState,
        photo_uploaded: !!req.file
      }
    });

    unit.close();
    event.close();
  } catch (error) {
    // Si hubo error y se subió un archivo, eliminarlo
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error eliminando archivo:', unlinkErr);
      });
    }
    next(error);
  }
});

/**
 * GET /api/v1/units
 * Obtiene lista de unidades con filtros opcionales
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, location } = req.query;
    
    const unit = new Unit();
    const units = await unit.getAll({ status, location });
    
    // Enriquecer unidades con información de estado
    const enrichedUnits = units.map(unitData => ({
      ...unitData,
      state_info: getStateInfo(unitData.current_status),
      available_actions: getAllowedEvents(unitData.current_status, req.user.role)
    }));

    res.json({
      success: true,
      data: {
        units: enrichedUnits,
        total: units.length,
        filters: { status, location }
      }
    });

    unit.close();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/units/:unitId/sync-status
 * Obtiene estado de sincronización de eventos pendientes
 */
router.get('/:unitId/sync-status', async (req, res, next) => {
  try {
    const event = new Event();
    const pendingEvents = await event.getPendingSync();
    
    // Filtrar eventos de la unidad específica
    const unitPendingEvents = pendingEvents.filter(evt => evt.unit_id === req.params.unitId);

    res.json({
      success: true,
      data: {
        unit_id: req.params.unitId,
        pending_events: unitPendingEvents.length,
        events: unitPendingEvents.map(evt => ({
          event_id: evt.event_id,
          event_type: evt.event_type,
          timestamp: evt.timestamp
        }))
      }
    });

    event.close();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
