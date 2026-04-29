import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, min = 0, max = 999, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, value <= min && styles.disabled]}
        onPress={() => value > min && onChange(value - 1)}
        hitSlop={6}
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={[styles.btn, value >= max && styles.disabled]}
        onPress={() => value < max && onChange(value + 1)}
        hitSlop={6}
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { backgroundColor: Colors.border },
  btnText: { color: Colors.textInverse, fontSize: 16, fontWeight: '600', lineHeight: 20 },
  value: { minWidth: 24, textAlign: 'center', fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
});
