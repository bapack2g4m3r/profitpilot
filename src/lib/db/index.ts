import Database from 'better-sqlite3';
import path from 'path';
import { DB_SCHEMA } from './schema';

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'profitpilot.db');
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize schema
    db.exec(DB_SCHEMA);
    
    // Seed default account if none exists
    const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number };
    if (accountCount.count === 0) {
      db.prepare('INSERT INTO accounts (name, platform, username) VALUES (?, ?, ?)').run(
        'Akun Utama', 'shopee', 'default'
      );
    }
  }
  return db;
}

export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}
