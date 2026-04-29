import { getDatabase } from './index';
import type { CollectionSet, CollectionStatus, SetCondition } from '../api/types';

export async function getAllSets(status?: CollectionStatus): Promise<CollectionSet[]> {
  const db = await getDatabase();
  if (status) {
    return db.getAllAsync<CollectionSet>(
      'SELECT * FROM collection_sets WHERE status = ? ORDER BY date_added DESC',
      [status]
    );
  }
  return db.getAllAsync<CollectionSet>(
    'SELECT * FROM collection_sets ORDER BY date_added DESC'
  );
}

export async function getSetByNum(setNum: string): Promise<CollectionSet | null> {
  const db = await getDatabase();
  return db.getFirstAsync<CollectionSet>(
    'SELECT * FROM collection_sets WHERE set_num = ?',
    [setNum]
  );
}

export async function insertSet(set: Omit<CollectionSet, 'id' | 'date_added'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO collection_sets
      (set_num, name, year, theme, num_parts, image_url, status, quantity, condition, notes, purchase_price, current_value, date_acquired)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      set.set_num, set.name, set.year ?? null, set.theme ?? null,
      set.num_parts ?? null, set.image_url ?? null, set.status ?? 'owned',
      set.quantity ?? 1, set.condition ?? 'new', set.notes ?? null,
      set.purchase_price ?? null, set.current_value ?? null, set.date_acquired ?? null,
    ]
  );
}

export async function updateSet(setNum: string, updates: Partial<CollectionSet>): Promise<void> {
  const db = await getDatabase();
  const fields = Object.keys(updates).filter(k => k !== 'set_num' && k !== 'id');
  if (fields.length === 0) return;
  const sql = `UPDATE collection_sets SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE set_num = ?`;
  const values: (string | number | null)[] = [
    ...fields.map(f => {
      const v = (updates as Record<string, unknown>)[f];
      return v == null ? null : (typeof v === 'number' ? v : String(v));
    }),
    setNum,
  ];
  await db.runAsync(sql, values);
}

export async function deleteSet(setNum: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM collection_sets WHERE set_num = ?', [setNum]);
}

export async function getCollectionStats(): Promise<{
  total: number;
  owned: number;
  wanted: number;
  for_sale: number;
  totalParts: number;
  totalValue: number;
}> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    total: number;
    owned: number;
    wanted: number;
    for_sale: number;
    totalParts: number;
    totalValue: number;
  }>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'owned' THEN 1 ELSE 0 END) as owned,
      SUM(CASE WHEN status = 'wanted' THEN 1 ELSE 0 END) as wanted,
      SUM(CASE WHEN status = 'for_sale' THEN 1 ELSE 0 END) as for_sale,
      SUM(COALESCE(num_parts, 0) * COALESCE(quantity, 1)) as totalParts,
      SUM(COALESCE(current_value, 0)) as totalValue
    FROM collection_sets
  `);
  return row ?? { total: 0, owned: 0, wanted: 0, for_sale: 0, totalParts: 0, totalValue: 0 };
}

export async function getRecentSets(limit = 10): Promise<CollectionSet[]> {
  const db = await getDatabase();
  return db.getAllAsync<CollectionSet>(
    'SELECT * FROM collection_sets ORDER BY date_added DESC LIMIT ?',
    [limit]
  );
}
