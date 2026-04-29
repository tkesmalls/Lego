import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSetByNum } from '../lib/db/sets';
import { getMinifiguresForSet, insertMinifigures, updateMinifigureOwned } from '../lib/db/minifigures';
import { getPartsForSet, insertParts, updatePartHave, getPartsCompletion } from '../lib/db/parts';
import { getPriceHistory, insertPriceEntry, deletePriceEntry } from '../lib/db/prices';
import { fetchSetMinifigs, fetchSetParts } from '../lib/api/rebrickable';
import type { PriceEntry, StoredMinifigure } from '../lib/api/types';

export function useSetDetail(setNum: string) {
  return useQuery({
    queryKey: ['set-detail', setNum],
    queryFn: () => getSetByNum(setNum),
    enabled: !!setNum,
  });
}

export function useMinifigures(setNum: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['minifigures', setNum],
    queryFn: async () => {
      let figs = await getMinifiguresForSet(setNum);
      if (figs.length === 0) {
        const apiFigs = await fetchSetMinifigs(setNum);
        const toStore = apiFigs.map(f => ({
          fig_num: f.fig_num,
          name: f.name,
          num_parts: f.num_parts,
          image_url: f.set_img_url,
          set_num: setNum,
          quantity_in_set: f.quantity,
          quantity_owned: 0,
        }));
        await insertMinifigures(setNum, toStore);
        figs = await getMinifiguresForSet(setNum);
      }
      return figs;
    },
    enabled: !!setNum,
  });

  const updateOwned = useMutation({
    mutationFn: ({ id, qty }: { id: number; qty: number }) => updateMinifigureOwned(id, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['minifigures', setNum] }),
  });

  return { ...query, updateOwned };
}

export function useParts(setNum: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['parts', setNum],
    queryFn: async () => {
      let parts = await getPartsForSet(setNum);
      if (parts.length === 0) {
        const allParts = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
          const res = await fetchSetParts(setNum, page);
          allParts.push(...res.results);
          hasMore = !!res.next;
          page++;
        }
        const toStore = allParts
          .filter(p => !p.is_spare)
          .map(p => ({
            set_num: setNum,
            part_num: p.part.part_num,
            part_name: p.part.name,
            color: p.color.name,
            quantity_in_set: p.quantity,
            quantity_have: 0,
            image_url: p.part.part_img_url ?? undefined,
          }));
        await insertParts(setNum, toStore);
        parts = await getPartsForSet(setNum);
      }
      return parts;
    },
    enabled: !!setNum,
  });

  const updateHave = useMutation({
    mutationFn: ({ id, qty }: { id: number; qty: number }) => updatePartHave(id, qty),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parts', setNum] });
      qc.invalidateQueries({ queryKey: ['parts-completion', setNum] });
    },
  });

  return { ...query, updateHave };
}

export function usePartsCompletion(setNum: string) {
  return useQuery({
    queryKey: ['parts-completion', setNum],
    queryFn: () => getPartsCompletion(setNum),
    enabled: !!setNum,
  });
}

export function usePriceHistory(setNum: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['prices', setNum],
    queryFn: () => getPriceHistory(setNum),
    enabled: !!setNum,
  });

  const addEntry = useMutation({
    mutationFn: (entry: Omit<PriceEntry, 'id'>) => insertPriceEntry(entry),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prices', setNum] }),
  });

  const removeEntry = useMutation({
    mutationFn: (id: number) => deletePriceEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prices', setNum] }),
  });

  return { ...query, addEntry, removeEntry };
}
