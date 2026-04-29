import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import type { StoredMinifigure } from '../lib/api/types';
import { QuantityStepper } from './QuantityStepper';

interface Props {
  fig: StoredMinifigure;
  onChangeOwned: (qty: number) => void;
}

export function MinifigureRow({ fig, onChangeOwned }: Props) {
  return (
    <View style={styles.row}>
      <Image
        source={{ uri: fig.image_url ?? undefined }}
        style={styles.image}
        contentFit="contain"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{fig.name}</Text>
        <Text style={styles.num}>{fig.fig_num}</Text>
        <Text style={styles.meta}>{fig.num_parts ?? '–'} parts · {fig.quantity_in_set} in set</Text>
      </View>
      <View style={styles.stepper}>
        <Text style={styles.stepperLabel}>Owned</Text>
        <QuantityStepper
          value={fig.quantity_owned}
          max={fig.quantity_in_set * 10}
          onChange={onChangeOwned}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  image: { width: 56, height: 56, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  num: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  meta: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  stepper: { alignItems: 'center', gap: 4 },
  stepperLabel: { fontSize: 10, color: Colors.textSecondary },
});
