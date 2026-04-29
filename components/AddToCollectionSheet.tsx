import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TextInput,
  ScrollView, Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import type { CollectionSet, CollectionStatus, SetCondition } from '../lib/api/types';
import type { RebrickableSet } from '../lib/api/types';

interface Props {
  visible: boolean;
  set: RebrickableSet | null;
  themeName?: string;
  onClose: () => void;
  onAdd: (set: Omit<CollectionSet, 'id' | 'date_added'>) => void;
}

const STATUS_OPTIONS: { value: CollectionStatus; label: string }[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'wanted', label: 'Wanted' },
  { value: 'for_sale', label: 'For Sale' },
];

const CONDITION_OPTIONS: { value: SetCondition; label: string }[] = [
  { value: 'sealed', label: 'Sealed' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
];

export function AddToCollectionSheet({ visible, set, themeName, onClose, onAdd }: Props) {
  const [status, setStatus] = useState<CollectionStatus>('owned');
  const [condition, setCondition] = useState<SetCondition>('new');
  const [quantity, setQuantity] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [notes, setNotes] = useState('');

  if (!set) return null;

  function handleAdd() {
    onAdd({
      set_num: set!.set_num,
      name: set!.name,
      year: set!.year,
      theme: themeName,
      num_parts: set!.num_parts,
      image_url: set!.set_img_url,
      status,
      quantity: parseInt(quantity) || 1,
      condition,
      notes: notes.trim() || undefined,
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
    });
    setStatus('owned');
    setCondition('new');
    setQuantity('1');
    setPurchasePrice('');
    setNotes('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <ScrollView style={styles.sheet} bounces={false}>
        <View style={styles.header}>
          <Image
            source={{ uri: set.set_img_url }}
            style={styles.image}
            contentFit="contain"
          />
          <View style={styles.headerInfo}>
            <Text style={styles.setName} numberOfLines={2}>{set.name}</Text>
            <Text style={styles.setMeta}>{set.set_num} · {set.year} · {set.num_parts} pieces</Text>
            {themeName && <Text style={styles.theme}>{themeName}</Text>}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.optionRow}>
          {STATUS_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              style={[styles.optionBtn, status === opt.value && styles.optionBtnActive]}
              onPress={() => setStatus(opt.value)}
            >
              <Text style={[styles.optionText, status === opt.value && styles.optionTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Condition</Text>
        <View style={styles.optionRow}>
          {CONDITION_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              style={[styles.optionBtn, condition === opt.value && styles.optionBtnActive]}
              onPress={() => setCondition(opt.value)}
            >
              <Text style={[styles.optionText, condition === opt.value && styles.optionTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Quantity</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.sectionLabel}>Purchase Price (optional)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
        />

        <Text style={styles.sectionLabel}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          placeholder="Any notes about this set..."
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add to Collection</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 20,
  },
  header: { flexDirection: 'row', marginBottom: 20 },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: Colors.surfaceAlt },
  headerInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  setName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  setMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  theme: { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, marginTop: 16 },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { fontSize: 13, color: Colors.textSecondary },
  optionTextActive: { color: Colors.textInverse, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  multiline: { height: 80, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 12 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: { fontWeight: '600', color: Colors.textPrimary },
  addBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  addBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: 15 },
});
