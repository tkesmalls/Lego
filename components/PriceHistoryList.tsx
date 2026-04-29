import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TextInput, Pressable,
  ScrollView, Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import type { PriceEntry, PriceType } from '../lib/api/types';

interface Props {
  entries: PriceEntry[];
  currency: string;
  onAdd: (entry: Omit<PriceEntry, 'id'>) => void;
  onDelete: (id: number) => void;
  setNum: string;
}

const TYPE_LABELS: Record<PriceType, string> = {
  purchased: 'Purchased',
  sold: 'Sold',
  estimated: 'Estimated',
};

export function PriceHistoryList({ entries, currency, onAdd, onDelete, setNum }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [type, setType] = useState<PriceType>('purchased');
  const [notes, setNotes] = useState('');

  function handleAdd() {
    const val = parseFloat(price);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }
    onAdd({ set_num: setNum, price: val, currency, price_type: type, notes: notes.trim() || undefined });
    setPrice('');
    setNotes('');
    setType('purchased');
    setModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnText}>+ Add Price Entry</Text>
      </Pressable>

      {entries.length === 0 ? (
        <Text style={styles.empty}>No price entries yet.</Text>
      ) : (
        entries.map(entry => (
          <View key={entry.id} style={styles.entry}>
            <View style={styles.entryLeft}>
              <Text style={styles.entryPrice}>
                {currency} {entry.price.toFixed(2)}
              </Text>
              <Text style={styles.entryMeta}>
                {entry.price_type ? TYPE_LABELS[entry.price_type as PriceType] : '–'} · {entry.date ? new Date(entry.date).toLocaleDateString() : '–'}
              </Text>
              {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
            </View>
            <Pressable
              onPress={() => {
                Alert.alert('Delete Entry', 'Remove this price entry?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id!) },
                ]);
              }}
              hitSlop={8}
            >
              <Text style={styles.deleteBtn}>✕</Text>
            </Pressable>
          </View>
        ))
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Add Price Entry</Text>

          <View style={styles.typeRow}>
            {(['purchased', 'sold', 'estimated'] as PriceType[]).map(t => (
              <Pressable
                key={t}
                style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                  {TYPE_LABELS[t]}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder={`Price (${currency})`}
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            style={styles.input}
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
          />

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={handleAdd}>
              <Text style={styles.confirmText}>Add</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    margin: 16,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  addBtnText: { color: Colors.textInverse, fontWeight: '600', fontSize: 15 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 32, fontSize: 14 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  entryLeft: { flex: 1 },
  entryPrice: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  entryMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  entryNotes: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  deleteBtn: { fontSize: 16, color: Colors.danger, padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { fontSize: 13, color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.textInverse, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: Colors.textPrimary,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: { color: Colors.textPrimary, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmText: { color: Colors.textInverse, fontWeight: '600' },
});
