import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { SetStatusBadge } from './SetStatusBadge';
import type { CollectionSet } from '../lib/api/types';

interface Props {
  set: CollectionSet;
  onLongPress?: () => void;
}

export function SetCard({ set, onLongPress }: Props) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/set/${encodeURIComponent(set.set_num)}`)}
      onLongPress={onLongPress}
    >
      <Image
        source={{ uri: set.image_url ?? undefined }}
        style={styles.image}
        contentFit="contain"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{set.name}</Text>
        <Text style={styles.meta}>{set.set_num} · {set.year ?? '–'}</Text>
        {set.num_parts != null && (
          <Text style={styles.parts}>{set.num_parts.toLocaleString()} pieces</Text>
        )}
        <View style={styles.footer}>
          <SetStatusBadge status={set.status} />
          {set.quantity > 1 && (
            <Text style={styles.qty}>×{set.quantity}</Text>
          )}
          {set.current_value != null && (
            <Text style={styles.value}>${set.current_value.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  pressed: { opacity: 0.85 },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: Colors.surfaceAlt },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  parts: { fontSize: 12, color: Colors.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  qty: { fontSize: 12, color: Colors.textSecondary },
  value: { fontSize: 12, fontWeight: '600', color: Colors.primary, marginLeft: 'auto' },
});
