import * as SQLite from 'expo-sqlite';
import { createTables } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('lego_collector.db');
    await createTables(db);
  }
  return db;
}
