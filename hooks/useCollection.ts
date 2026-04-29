import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllSets, insertSet, updateSet, deleteSet,
  getCollectionStats, getRecentSets,
} from '../lib/db/sets';
import type { CollectionSet, CollectionStatus } from '../lib/api/types';

export function useCollection(status?: CollectionStatus) {
  return useQuery({
    queryKey: ['collection', status],
    queryFn: () => getAllSets(status),
  });
}

export function useCollectionStats() {
  return useQuery({
    queryKey: ['collection-stats'],
    queryFn: getCollectionStats,
  });
}

export function useRecentSets(limit = 10) {
  return useQuery({
    queryKey: ['recent-sets', limit],
    queryFn: () => getRecentSets(limit),
  });
}

export function useAddSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (set: Omit<CollectionSet, 'id' | 'date_added'>) => insertSet(set),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection'] });
      qc.invalidateQueries({ queryKey: ['collection-stats'] });
      qc.invalidateQueries({ queryKey: ['recent-sets'] });
    },
  });
}

export function useUpdateSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ setNum, updates }: { setNum: string; updates: Partial<CollectionSet> }) =>
      updateSet(setNum, updates),
    onSuccess: (_data, { setNum }) => {
      qc.invalidateQueries({ queryKey: ['collection'] });
      qc.invalidateQueries({ queryKey: ['collection-stats'] });
      qc.invalidateQueries({ queryKey: ['set-detail', setNum] });
    },
  });
}

export function useDeleteSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (setNum: string) => deleteSet(setNum),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection'] });
      qc.invalidateQueries({ queryKey: ['collection-stats'] });
      qc.invalidateQueries({ queryKey: ['recent-sets'] });
    },
  });
}
