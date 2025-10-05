/**
 * Inicialización de la base de datos SQLite
 * Crea las tablas necesarias y datos de prueba
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Crear directorio de base de datos si no existe
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'units.db');

/**
 * Inicializa la base de datos con esquemas y datos de prueba
 */
function initDatabase() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error conectando a SQLite:', err.message);
      return;
    }
    console.log('✅ Conectado a base de datos SQLite');
  });

  // Crear tablas
  db.serialize(() => {
    // Tabla de usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('warehouse', 'delivery', 'cleaner', 'collection', 'repair', 'admin')),
        email TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de unidades
    db.run(`
      CREATE TABLE IF NOT EXISTS units (
        unit_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        current_status TEXT NOT NULL CHECK (current_status IN ('almacen', 'ubicacion', 'en_uso', 'recoleccion', 'almacen_limpieza', 'reparacion')),
        location TEXT,
        assigned_to TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users (user_id)
      )
    `);

    // Tabla de eventos
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        unit_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_role TEXT NOT NULL,
        status_before TEXT NOT NULL,
        status_after TEXT NOT NULL,
        signature_data TEXT,
        photo_path TEXT,
        geo_lat REAL,
        geo_lng REAL,
        notes TEXT,
        idempotency_key TEXT UNIQUE,
        synced INTEGER DEFAULT 1,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (unit_id) REFERENCES units (unit_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
      )
    `);

    // Insertar usuarios de prueba
    const users = [
      ['admin001', 'Administrador', 'admin', 'admin@empresa.com'],
      ['warehouse001', 'Juan Almacén', 'warehouse', 'juan@empresa.com'],
      ['delivery001', 'María Entrega', 'delivery', 'maria@empresa.com'],
      ['cleaner001', 'Pedro Limpieza', 'cleaner', 'pedro@empresa.com'],
      ['collection001', 'Ana Recolección', 'collection', 'ana@empresa.com'],
      ['repair001', 'Luis Reparación', 'repair', 'luis@empresa.com']
    ];

    const userStmt = db.prepare(`
      INSERT OR REPLACE INTO users (user_id, name, role, email) 
      VALUES (?, ?, ?, ?)
    `);

    users.forEach(user => {
      userStmt.run(user);
    });
    userStmt.finalize();

    // Insertar unidades de prueba
    const units = [
      ['UN001', 'Baño Portátil #001', 'almacen', 'Almacén Central'],
      ['UN002', 'Baño Portátil #002', 'ubicacion', 'Obra Norte - Sector A'],
      ['UN003', 'Baño Portátil #003', 'en_uso', 'Obra Sur - Sector B'],
      ['UN004', 'Baño Portátil #004', 'recoleccion', 'Evento Plaza Mayor'],
      ['UN005', 'Baño Portátil #005', 'almacen_limpieza', 'Almacén Central'],
      ['UN006', 'Baño Portátil #006', 'reparacion', 'Taller de Reparaciones']
    ];

    const unitStmt = db.prepare(`
      INSERT OR REPLACE INTO units (unit_id, name, current_status, location) 
      VALUES (?, ?, ?, ?)
    `);

    units.forEach(unit => {
      unitStmt.run(unit);
    });
    unitStmt.finalize();

    console.log('📦 Base de datos inicializada con datos de prueba');
  });

  db.close((err) => {
    if (err) {
      console.error('❌ Error cerrando base de datos:', err.message);
    }
  });
}

// Función para obtener conexión a la DB
function getDatabase() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error conectando a SQLite:', err.message);
    }
  });
}

module.exports = { initDatabase, getDatabase, dbPath };
