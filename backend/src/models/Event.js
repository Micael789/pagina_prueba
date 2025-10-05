/**
 * Modelo para gestionar eventos de unidades
 * Maneja el registro de acciones y estados
 */

const { getDatabase } = require('../utils/initDatabase');
const { v4: uuidv4 } = require('uuid');

class Event {
  constructor() {
    this.db = getDatabase();
  }

  /**
   * Crea un nuevo evento
   */
  async create(eventData) {
    return new Promise((resolve, reject) => {
      const eventId = uuidv4();
      
      const sql = `
        INSERT INTO events (
          event_id, unit_id, event_type, user_id, user_role,
          status_before, status_after, signature_data, photo_path,
          geo_lat, geo_lng, notes, idempotency_key
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        eventId,
        eventData.unit_id,
        eventData.event_type,
        eventData.user_id,
        eventData.user_role,
        eventData.status_before,
        eventData.status_after,
        eventData.signature_data || null,
        eventData.photo_path || null,
        eventData.geo_lat || null,
        eventData.geo_lng || null,
        eventData.notes || null,
        eventData.idempotency_key
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          // Si es error de clave duplicada (idempotency)
          if (err.message.includes('UNIQUE constraint failed: events.idempotency_key')) {
            reject(new Error('DUPLICATE_EVENT'));
          } else {
            reject(err);
          }
        } else {
          resolve({ 
            event_id: eventId, 
            changes: this.changes,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  }

  /**
   * Obtiene eventos por unidad
   */
  async getByUnit(unitId, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          e.*,
          u.name as user_name
        FROM events e
        LEFT JOIN users u ON e.user_id = u.user_id
        WHERE e.unit_id = ?
        ORDER BY e.timestamp DESC
        LIMIT ?
      `;

      this.db.all(sql, [unitId, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Obtiene evento por clave de idempotencia
   */
  async getByIdempotencyKey(key) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM events 
        WHERE idempotency_key = ?
      `;

      this.db.get(sql, [key], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Obtiene eventos pendientes de sincronización
   */
  async getPendingSync() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM events 
        WHERE synced = 0
        ORDER BY timestamp ASC
      `;

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Marca eventos como sincronizados
   */
  async markAsSynced(eventIds) {
    return new Promise((resolve, reject) => {
      const placeholders = eventIds.map(() => '?').join(',');
      const sql = `
        UPDATE events 
        SET synced = 1
        WHERE event_id IN (${placeholders})
      `;

      this.db.run(sql, eventIds, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  /**
   * Obtiene estadísticas de eventos
   */
  async getStats(unitId = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          event_type,
          COUNT(*) as count,
          DATE(timestamp) as date
        FROM events
      `;
      const params = [];

      if (unitId) {
        sql += ' WHERE unit_id = ?';
        params.push(unitId);
      }

      sql += ' GROUP BY event_type, DATE(timestamp) ORDER BY timestamp DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Cierra la conexión a la base de datos
   */
  close() {
    this.db.close();
  }
}

module.exports = Event;
