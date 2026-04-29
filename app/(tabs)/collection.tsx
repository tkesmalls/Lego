import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, Alert, ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { SetCard } from '../../components/SetCard';
import { useCollection, useDeleteSet } from '../../hooks/useCollection';
import type { CollectionSet, CollectionStatus } from '../../lib/api/types';

type SortKey = 'date' | 'name' | 'year' | 'value';

const FILTER_OPTIONS: { value: CollectionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'owned', label: 'Owned' },
  { value: 'wanted', label: 'Wanted' },
  { value: 'for_sale', label: 'For Sale' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'year', label: 'Year' },
  { value: 'value', label: 'Value' },
];

export default function CollectionScreen() {
  const [filter, setFilter] = useState<CollectionStatus | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('date');
  const [search, setSearch] = useState('');
  const [showSort, setShowSort] = useState(false);
  const deleteSet = useDeleteSet();

  const { data: sets, isLoading, refetch } = useCollection(
    filter === 'all' ? undefined : filter
  );

  const filtered = useMemo(() => {
    if (!sets) return [];
    let result = sets;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(q) || s.set_num.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      switch (sort) {
        case 'name': return a.name.localeCompare(b.name);
        case 'year': return (b.year ?? 0) - (a.year ?? 0);
        case 'value': return (b.current_value ?? 0) - (a.current_value ?? 0);
        default: return (b.date_added ?? '').localeCompare(a.date_added ?? '');
      }
    });
  }, [sets, search, sort]);

  function handleDelete(set: CollectionSet) {
    Alert.alert(
      'Remove Set',
      `Remove "${set.name}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteSet.mutate(set.set_num),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search collection..."
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        <Pressable style={styles.sortBtn} onPress={() => setShowSort(v => !v)}>
          <Text style={styles.sortBtnText}>Sort ▾</Text>
        </Pressable>
      </View>

      {showSort && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              style={[styles.sortOpt, sort === opt.value && styles.sortOptActive]}
              onPress={() => { setSort(opt.value); setShowSort(false); }}
            >
              <Text style={[styles.sortOptText, sort === opt.value && styles.sortOptTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.filterBar}>
        {FILTER_OPTIONS.map(opt => (
          <Pressable
            key={opt.value}
            style={[styles.filterBtn, filter === opt.value && styles.filterBtnActive]}
            onPress={() => setFilter(opt.value)}
          >
            <Text style={[styles.filterText, filter === opt.value && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.centered} color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {sets?.length === 0 ? 'No sets yet' : 'No results'}
          </Text>
          <Text style={styles.emptyHint}>
            {sets?.length === 0
              ? 'Scan a barcode or search to add your first set.'
              : 'Try a different search or filter.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.set_num}
          renderItem={({ item }) => (
            <SetCard set={item} onLongPress={() => handleDelete(item)} />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
          onRefresh={refetch}
          refreshing={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnText: { fontSize: 13, color: Colors.textSecondary },
  sortMenu: {
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 6,
  },
  sortOpt: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortOptActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortOptText: { fontSize: 13, color: Colors.textSecondary },
  sortOptTextActive: { color: Colors.textInverse, fontWeight: '600' },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, color: Colors.textSecondary },
  filterTextActive: { color: Colors.textInverse, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
