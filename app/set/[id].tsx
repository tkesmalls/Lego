import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  FlatList, ActivityIndicator, Alert, TextInput, Modal, Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { SetStatusBadge } from '../../components/SetStatusBadge';
import { MinifigureRow } from '../../components/MinifigureRow';
import { PartRow } from '../../components/PartRow';
import { PriceHistoryList } from '../../components/PriceHistoryList';
import { useSetDetail, useMinifigures, useParts, usePartsCompletion, usePriceHistory } from '../../hooks/useSet';
import { useUpdateSet } from '../../hooks/useCollection';
import { useApiKey } from '../../hooks/useApiKey';
import type { CollectionSet, CollectionStatus, SetCondition } from '../../lib/api/types';

type Tab = 'overview' | 'minifigures' | 'parts' | 'prices';

export default function SetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setNum = decodeURIComponent(id ?? '');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editModal, setEditModal] = useState(false);

  const { data: set, isLoading } = useSetDetail(setNum);
  const updateSet = useUpdateSet();
  const { currency } = useApiKey();

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} color={Colors.primary} />;
  }
  if (!set) {
    return <Text style={styles.notFound}>Set not found in collection.</Text>;
  }

  return (
    <View style={styles.container}>
      <SetHeader set={set} onEditPress={() => setEditModal(true)} />

      <View style={styles.tabBar}>
        {(['overview', 'minifigures', 'parts', 'prices'] as Tab[]).map(tab => (
          <Pressable
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'overview' && <OverviewTab set={set} />}
      {activeTab === 'minifigures' && <MinifiguresTab setNum={setNum} />}
      {activeTab === 'parts' && <PartsTab setNum={setNum} />}
      {activeTab === 'prices' && (
        <PricesTab setNum={setNum} currency={currency} />
      )}

      <EditSetModal
        visible={editModal}
        set={set}
        onClose={() => setEditModal(false)}
        onSave={updates => {
          updateSet.mutate({ setNum, updates });
          setEditModal(false);
        }}
      />
    </View>
  );
}

function SetHeader({ set, onEditPress }: { set: CollectionSet; onEditPress: () => void }) {
  return (
    <View style={styles.header}>
      <Image
        source={{ uri: set.image_url ?? undefined }}
        style={styles.headerImage}
        contentFit="contain"
      />
      <View style={styles.headerInfo}>
        <Text style={styles.headerName}>{set.name}</Text>
        <Text style={styles.headerMeta}>{set.set_num} · {set.year ?? '–'}</Text>
        {set.theme && <Text style={styles.headerTheme}>{set.theme}</Text>}
        {set.num_parts != null && (
          <Text style={styles.headerParts}>{set.num_parts.toLocaleString()} pieces</Text>
        )}
        <View style={styles.headerRow}>
          <SetStatusBadge status={set.status} />
          <Pressable style={styles.editBtn} onPress={onEditPress}>
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function OverviewTab({ set }: { set: CollectionSet }) {
  return (
    <ScrollView style={styles.tab}>
      <Row label="Status" value={set.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
      <Row label="Condition" value={set.condition.charAt(0).toUpperCase() + set.condition.slice(1)} />
      <Row label="Quantity" value={String(set.quantity)} />
      {set.purchase_price != null && (
        <Row label="Purchase Price" value={`$${set.purchase_price.toFixed(2)}`} />
      )}
      {set.current_value != null && (
        <Row label="Estimated Value" value={`$${set.current_value.toFixed(2)}`} />
      )}
      {set.date_acquired && (
        <Row label="Acquired" value={new Date(set.date_acquired).toLocaleDateString()} />
      )}
      <Row label="Added" value={set.date_added ? new Date(set.date_added).toLocaleDateString() : '–'} />
      {set.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>{set.notes}</Text>
        </View>
      ) : null}
      <Pressable
        style={styles.bricklinkBtn}
        onPress={() => Linking.openURL(`https://www.bricklink.com/v2/catalog/catalogitem.page?S=${set.set_num}`)}
      >
        <Text style={styles.bricklinkText}>View on BrickLink</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function MinifiguresTab({ setNum }: { setNum: string }) {
  const { data: figs, isLoading, error, updateOwned } = useMinifigures(setNum);

  if (isLoading) return <ActivityIndicator style={styles.centered} color={Colors.primary} />;
  if (error) return <Text style={styles.errorText}>Failed to load minifigures.</Text>;
  if (!figs?.length) return <Text style={styles.emptyText}>No minifigures in this set.</Text>;

  return (
    <FlatList
      data={figs}
      keyExtractor={f => String(f.id)}
      renderItem={({ item }) => (
        <MinifigureRow
          fig={item}
          onChangeOwned={qty => updateOwned.mutate({ id: item.id!, qty })}
        />
      )}
    />
  );
}

function PartsTab({ setNum }: { setNum: string }) {
  const { data: parts, isLoading, error, updateHave } = useParts(setNum);
  const { data: completion } = usePartsCompletion(setNum);

  if (isLoading) return (
    <View style={styles.centered}>
      <ActivityIndicator color={Colors.primary} />
      <Text style={styles.loadingText}>Loading parts (may take a moment)...</Text>
    </View>
  );
  if (error) return <Text style={styles.errorText}>Failed to load parts.</Text>;
  if (!parts?.length) return <Text style={styles.emptyText}>No parts data available.</Text>;

  const pct = completion && completion.total > 0
    ? Math.round((completion.have / completion.total) * 100)
    : 0;

  return (
    <View style={styles.tab}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completion?.have ?? 0} / {completion?.total ?? 0} parts ({pct}%)
        </Text>
      </View>
      <FlatList
        data={parts}
        keyExtractor={p => String(p.id)}
        renderItem={({ item }) => (
          <PartRow
            part={item}
            onChangeHave={qty => updateHave.mutate({ id: item.id!, qty })}
          />
        )}
      />
    </View>
  );
}

function PricesTab({ setNum, currency }: { setNum: string; currency: string }) {
  const { data: entries, addEntry, removeEntry } = usePriceHistory(setNum);
  return (
    <PriceHistoryList
      entries={entries ?? []}
      currency={currency}
      setNum={setNum}
      onAdd={entry => addEntry.mutate(entry)}
      onDelete={id => removeEntry.mutate(id)}
    />
  );
}

const STATUS_OPTIONS: CollectionStatus[] = ['owned', 'wanted', 'for_sale'];
const CONDITION_OPTIONS: SetCondition[] = ['sealed', 'new', 'used'];

function EditSetModal({
  visible, set, onClose, onSave,
}: {
  visible: boolean;
  set: CollectionSet;
  onClose: () => void;
  onSave: (updates: Partial<CollectionSet>) => void;
}) {
  const [status, setStatus] = useState<CollectionStatus>(set.status);
  const [condition, setCondition] = useState<SetCondition>(set.condition);
  const [quantity, setQuantity] = useState(String(set.quantity));
  const [currentValue, setCurrentValue] = useState(set.current_value != null ? String(set.current_value) : '');
  const [notes, setNotes] = useState(set.notes ?? '');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <ScrollView style={styles.editSheet} bounces={false}>
        <Text style={styles.editTitle}>Edit Set</Text>

        <Text style={styles.editLabel}>Status</Text>
        <View style={styles.optionRow}>
          {STATUS_OPTIONS.map(s => (
            <Pressable
              key={s}
              style={[styles.optionBtn, status === s && styles.optionBtnActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.optionText, status === s && styles.optionTextActive]}>
                {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.editLabel}>Condition</Text>
        <View style={styles.optionRow}>
          {CONDITION_OPTIONS.map(c => (
            <Pressable
              key={c}
              style={[styles.optionBtn, condition === c && styles.optionBtnActive]}
              onPress={() => setCondition(c)}
            >
              <Text style={[styles.optionText, condition === c && styles.optionTextActive]}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.editLabel}>Quantity</Text>
        <TextInput
          style={styles.editInput}
          keyboardType="number-pad"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.editLabel}>Current Value ($)</Text>
        <TextInput
          style={styles.editInput}
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={currentValue}
          onChangeText={setCurrentValue}
        />

        <Text style={styles.editLabel}>Notes</Text>
        <TextInput
          style={[styles.editInput, { height: 80, textAlignVertical: 'top' }]}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.editActions}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={styles.saveBtn}
            onPress={() =>
              onSave({
                status,
                condition,
                quantity: parseInt(quantity) || 1,
                current_value: currentValue ? parseFloat(currentValue) : undefined,
                notes: notes.trim() || undefined,
              })
            }
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60 },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  headerImage: { width: 100, height: 100, borderRadius: 10, backgroundColor: Colors.surfaceAlt },
  headerInfo: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  headerName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerMeta: { fontSize: 12, color: Colors.textSecondary },
  headerTheme: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  headerParts: { fontSize: 12, color: Colors.textSecondary },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  tab: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  rowLabel: { fontSize: 14, color: Colors.textSecondary },
  rowValue: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  notesBox: { margin: 16, padding: 12, backgroundColor: Colors.surface, borderRadius: 10 },
  notesLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  notesText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  bricklinkBtn: {
    margin: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  bricklinkText: { color: Colors.wanted, fontWeight: '600', fontSize: 14 },
  errorText: { textAlign: 'center', color: Colors.danger, margin: 20 },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, margin: 40, fontSize: 14 },
  loadingText: { color: Colors.textSecondary, fontSize: 13, marginTop: 8 },
  progressContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.owned, borderRadius: 4 },
  progressText: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, textAlign: 'right' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  editSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  editTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  editLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, marginTop: 12 },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
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
  optionText: { fontSize: 12, color: Colors.textSecondary },
  optionTextActive: { color: Colors.textInverse, fontWeight: '600' },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 24, paddingBottom: 40 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: { fontWeight: '600', color: Colors.textPrimary },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  saveBtnText: { color: Colors.textInverse, fontWeight: '700' },
});
