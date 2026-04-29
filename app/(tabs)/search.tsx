import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  Pressable, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/Colors';
import { searchSets } from '../../lib/api/rebrickable';
import { AddToCollectionSheet } from '../../components/AddToCollectionSheet';
import { useAddSet } from '../../hooks/useCollection';
import type { RebrickableSet } from '../../lib/api/types';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [selectedSet, setSelectedSet] = useState<RebrickableSet | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const addSet = useAddSet();

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(text.trim()), 400);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchSets(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  function handleSelect(set: RebrickableSet) {
    setSelectedSet(set);
    setSheetVisible(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search by set name or number..."
          value={query}
          onChangeText={handleChange}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {isLoading && (
        <ActivityIndicator style={styles.centered} color={Colors.primary} />
      )}

      {error && (
        <Text style={styles.error}>
          {(error as Error).message === 'Rebrickable API key not set. Please add your key in Settings.'
            ? 'Add your Rebrickable API key in Settings to search.'
            : 'Search failed. Check your connection and API key.'}
        </Text>
      )}

      {!isLoading && debouncedQuery.length >= 2 && data?.results.length === 0 && (
        <Text style={styles.empty}>No sets found for "{debouncedQuery}"</Text>
      )}

      {debouncedQuery.length < 2 && !isLoading && (
        <Text style={styles.hint}>Enter at least 2 characters to search</Text>
      )}

      <FlatList
        data={data?.results ?? []}
        keyExtractor={item => item.set_num}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.result, pressed && styles.pressed]}
            onPress={() => handleSelect(item)}
          >
            <Image
              source={{ uri: item.set_img_url }}
              style={styles.thumb}
              contentFit="contain"
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.resultMeta}>{item.set_num} · {item.year}</Text>
              <Text style={styles.resultParts}>{item.num_parts} pieces</Text>
            </View>
            <Text style={styles.addHint}>+ Add</Text>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <AddToCollectionSheet
        visible={sheetVisible}
        set={selectedSet}
        onClose={() => setSheetVisible(false)}
        onAdd={set => addSet.mutate(set)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  searchBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  centered: { marginTop: 40 },
  error: { textAlign: 'center', color: Colors.danger, margin: 20, fontSize: 14 },
  empty: { textAlign: 'center', color: Colors.textSecondary, margin: 20, fontSize: 14 },
  hint: { textAlign: 'center', color: Colors.textSecondary, margin: 20, fontSize: 14 },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: { opacity: 0.85 },
  thumb: { width: 64, height: 64, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  resultInfo: { flex: 1, marginLeft: 12 },
  resultName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  resultMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  resultParts: { fontSize: 12, color: Colors.textSecondary },
  addHint: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginLeft: 8 },
});
