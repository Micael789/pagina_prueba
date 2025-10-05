/**
 * Modelo para gestionar unidades (baños portátiles)
 * Maneja operaciones CRUD y validaciones de estado
 */

const { getDatabase } = require('../utils/initDatabase');

class Unit {
  constructor() {
    this.db = getDatabase();
  }

  /**
   * Obtiene información de una unidad por ID
   */
  async getById(unitId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          unit_id,
          name,
          current_status,
          location,
          assigned_to,
          created_at,
          updated_at
        FROM units 
        WHERE unit_id = ?
      `;
      
      this.db.get(sql, [unitId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Obtiene todas las unidades con filtros opcionales
   */
  async getAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM units WHERE 1=1';
      const params = [];

      if (filters.status) {
        sql += ' AND current_status = ?';
        params.push(filters.status);
      }

      if (filters.location) {
        sql += ' AND location LIKE ?';
        params.push(`%${filters.location}%`);
      }

      sql += ' ORDER BY updated_at DESC';

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
   * Actualiza el estado de una unidad
   */
  async updateStatus(unitId, newStatus, location = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        UPDATE units 
        SET current_status = ?, updated_at = CURRENT_TIMESTAMP
      `;
      const params = [newStatus];

      if (location) {
        sql += ', location = ?';
        params.push(location);
      }

      sql += ' WHERE unit_id = ?';
      params.push(unitId);

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  /**
   * Crea una nueva unidad
   */
  async create(unitData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO units (unit_id, name, current_status, location)
        VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        unitData.unit_id,
        unitData.name,
        unitData.current_status || 'almacen',
        unitData.location || 'Almacén Central'
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ unit_id: unitData.unit_id, changes: this.changes });
        }
      });
    });
  }

  /**
   * Obtiene el historial de eventos de una unidad
   */
  async getEvents(unitId, limit = 50) {
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
   * Cierra la conexión a la base de datos
   */
  close() {
    this.db.close();
  }
}

module.exports = Unit;
