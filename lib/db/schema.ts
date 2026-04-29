import type { SQLiteDatabase } from 'expo-sqlite';

export async function createTables(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS collection_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_num TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      year INTEGER,
      theme TEXT,
      num_parts INTEGER,
      image_url TEXT,
      status TEXT DEFAULT 'owned',
      quantity INTEGER DEFAULT 1,
      condition TEXT DEFAULT 'new',
      notes TEXT,
      purchase_price REAL,
      current_value REAL,
      date_added TEXT DEFAULT (datetime('now')),
      date_acquired TEXT
    );

    CREATE TABLE IF NOT EXISTS minifigures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fig_num TEXT NOT NULL,
      name TEXT NOT NULL,
      num_parts INTEGER,
      image_url TEXT,
      set_num TEXT NOT NULL,
      quantity_in_set INTEGER DEFAULT 1,
      quantity_owned INTEGER DEFAULT 0,
      FOREIGN KEY (set_num) REFERENCES collection_sets(set_num) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS parts_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_num TEXT NOT NULL,
      part_num TEXT NOT NULL,
      part_name TEXT,
      color TEXT,
      quantity_in_set INTEGER DEFAULT 1,
      quantity_have INTEGER DEFAULT 0,
      image_url TEXT,
      FOREIGN KEY (set_num) REFERENCES collection_sets(set_num) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_num TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      price_type TEXT,
      date TEXT DEFAULT (datetime('now')),
      notes TEXT,
      FOREIGN KEY (set_num) REFERENCES collection_sets(set_num) ON DELETE CASCADE
    );
  `);
}
