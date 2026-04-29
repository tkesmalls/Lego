import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import type { CollectionStatus } from '../lib/api/types';

const LABELS: Record<CollectionStatus, string> = {
  owned: 'Owned',
  wanted: 'Wanted',
  for_sale: 'For Sale',
};

const BG: Record<CollectionStatus, string> = {
  owned: Colors.owned,
  wanted: Colors.wanted,
  for_sale: Colors.for_sale,
};

export function SetStatusBadge({ status }: { status: CollectionStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: BG[status] }]}>
      <Text style={styles.label}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  label: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '600',
  },
});
