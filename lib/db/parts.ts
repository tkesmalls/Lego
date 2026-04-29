import { getDatabase } from './index';
import type { StoredPart } from '../api/types';

export async function getPartsForSet(setNum: string): Promise<StoredPart[]> {
  const db = await getDatabase();
  return db.getAllAsync<StoredPart>(
    'SELECT * FROM parts_inventory WHERE set_num = ? ORDER BY part_name',
    [setNum]
  );
}

export async function insertParts(setNum: string, parts: Omit<StoredPart, 'id'>[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const part of parts) {
      await db.runAsync(
        `INSERT OR IGNORE INTO parts_inventory (set_num, part_num, part_name, color, quantity_in_set, quantity_have, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [setNum, part.part_num, part.part_name ?? null, part.color ?? null, part.quantity_in_set, 0, part.image_url ?? null]
      );
    }
  });
}

export async function updatePartHave(id: number, quantityHave: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE parts_inventory SET quantity_have = ? WHERE id = ?', [quantityHave, id]);
}

export async function getPartsCompletion(setNum: string): Promise<{ have: number; total: number }> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ have: number; total: number }>(
    `SELECT SUM(quantity_have) as have, SUM(quantity_in_set) as total FROM parts_inventory WHERE set_num = ?`,
    [setNum]
  );
  return row ?? { have: 0, total: 0 };
}
