import { getDatabase } from './index';
import type { StoredMinifigure } from '../api/types';

export async function getMinifiguresForSet(setNum: string): Promise<StoredMinifigure[]> {
  const db = await getDatabase();
  return db.getAllAsync<StoredMinifigure>(
    'SELECT * FROM minifigures WHERE set_num = ? ORDER BY name',
    [setNum]
  );
}

export async function insertMinifigures(setNum: string, figs: Omit<StoredMinifigure, 'id'>[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const fig of figs) {
      await db.runAsync(
        `INSERT OR IGNORE INTO minifigures (fig_num, name, num_parts, image_url, set_num, quantity_in_set, quantity_owned)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [fig.fig_num, fig.name, fig.num_parts ?? null, fig.image_url ?? null, setNum, fig.quantity_in_set, 0]
      );
    }
  });
}

export async function updateMinifigureOwned(id: number, quantityOwned: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE minifigures SET quantity_owned = ? WHERE id = ?', [quantityOwned, id]);
}

export async function deleteMinifiguresForSet(setNum: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM minifigures WHERE set_num = ?', [setNum]);
}
