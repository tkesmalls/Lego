import { getDatabase } from './index';
import type { PriceEntry } from '../api/types';

export async function getPriceHistory(setNum: string): Promise<PriceEntry[]> {
  const db = await getDatabase();
  return db.getAllAsync<PriceEntry>(
    'SELECT * FROM price_history WHERE set_num = ? ORDER BY date DESC',
    [setNum]
  );
}

export async function insertPriceEntry(entry: Omit<PriceEntry, 'id'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO price_history (set_num, price, currency, price_type, date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [entry.set_num, entry.price, entry.currency ?? 'USD', entry.price_type ?? null, entry.date ?? new Date().toISOString(), entry.notes ?? null]
  );
}

export async function deletePriceEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM price_history WHERE id = ?', [id]);
}
