import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import type { StoredPart } from '../lib/api/types';
import { QuantityStepper } from './QuantityStepper';

interface Props {
  part: StoredPart;
  onChangeHave: (qty: number) => void;
}

export function PartRow({ part, onChangeHave }: Props) {
  const complete = part.quantity_have >= part.quantity_in_set;
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: part.image_url ?? undefined }}
        style={styles.image}
        contentFit="contain"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{part.part_name ?? part.part_num}</Text>
        <Text style={styles.sub}>{part.part_num}</Text>
        {part.color && <Text style={styles.sub}>{part.color}</Text>}
      </View>
      <View style={styles.right}>
        <Text style={[styles.fraction, complete && styles.complete]}>
          {part.quantity_have}/{part.quantity_in_set}
        </Text>
        <QuantityStepper
          value={part.quantity_have}
          max={part.quantity_in_set}
          onChange={onChangeHave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  image: { width: 48, height: 48, borderRadius: 4, backgroundColor: Colors.surfaceAlt },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  sub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  right: { alignItems: 'center', gap: 4 },
  fraction: { fontSize: 12, color: Colors.textSecondary },
  complete: { color: Colors.owned, fontWeight: '600' },
});
