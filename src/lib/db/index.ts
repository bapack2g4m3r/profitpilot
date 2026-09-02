import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { DB_SCHEMA } from './schema';

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
    
    let dbPath: string;
    if (isVercel) {
      dbPath = '/tmp/profitpilot.db';
    } else {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        try {
          fs.mkdirSync(dataDir, { recursive: true });
        } catch (e) {
          console.warn('Could not create data dir, falling back to /tmp:', e);
        }
      }
      dbPath = fs.existsSync(dataDir) ? path.join(dataDir, 'profitpilot.db') : '/tmp/profitpilot.db';
    }
    
    try {
      db = new Database(dbPath);
      if (!isVercel) {
        db.pragma('journal_mode = WAL');
      }
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
    } catch (err) {
      console.error('Failed to initialize SQLite DB at ' + dbPath + ', trying in-memory DB:', err);
      db = new Database(':memory:');
      db.exec(DB_SCHEMA);
    }
  }
  return db;
}

export function closeDB() {
  if (db) {
    try {
      db.close();
    } catch (e) {
      // ignore
    }
    db = null;
  }
}
