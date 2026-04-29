import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, Alert, Switch,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useApiKey } from '../../hooks/useApiKey';
import { useDeleteSet } from '../../hooks/useCollection';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

export default function SettingsScreen() {
  const { apiKey, currency, updateApiKey, updateCurrency } = useApiKey();
  const [keyInput, setKeyInput] = useState('');
  const [keyVisible, setKeyVisible] = useState(false);
  const deleteSet = useDeleteSet();

  async function handleSaveKey() {
    const key = keyInput.trim();
    if (!key) {
      Alert.alert('Error', 'Please enter a valid API key.');
      return;
    }
    await updateApiKey(key);
    setKeyInput('');
    Alert.alert('Saved', 'API key saved successfully.');
  }

  function handleClearCollection() {
    Alert.alert(
      'Clear Collection',
      'This will permanently delete all sets, minifigures, parts, and price history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            const { getDatabase } = await import('../../lib/db/index');
            const db = await getDatabase();
            await db.execAsync(
              'DELETE FROM price_history; DELETE FROM parts_inventory; DELETE FROM minifigures; DELETE FROM collection_sets;'
            );
            Alert.alert('Done', 'Collection cleared.');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Rebrickable API Key</Text>
      <Text style={styles.hint}>
        Get your free API key at rebrickable.com/api
      </Text>
      {apiKey ? (
        <View style={styles.keyRow}>
          <Text style={styles.keySet}>
            {keyVisible ? apiKey : `••••••••••••${apiKey.slice(-4)}`}
          </Text>
          <Pressable onPress={() => setKeyVisible(v => !v)}>
            <Text style={styles.toggleText}>{keyVisible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.noKey}>No API key set</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder={apiKey ? 'Enter new key to replace...' : 'Paste your API key here...'}
        value={keyInput}
        onChangeText={setKeyInput}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={!keyVisible}
      />
      <Pressable style={styles.primaryBtn} onPress={handleSaveKey}>
        <Text style={styles.primaryBtnText}>{apiKey ? 'Update API Key' : 'Save API Key'}</Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Currency</Text>
      <View style={styles.currencyGrid}>
        {CURRENCIES.map(cur => (
          <Pressable
            key={cur}
            style={[styles.currencyBtn, currency === cur && styles.currencyBtnActive]}
            onPress={() => updateCurrency(cur)}
          >
            <Text style={[styles.currencyText, currency === cur && styles.currencyTextActive]}>
              {cur}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Danger Zone</Text>
      <Pressable style={styles.dangerBtn} onPress={handleClearCollection}>
        <Text style={styles.dangerBtnText}>Clear Entire Collection</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  hint: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  noKey: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12, fontStyle: 'italic' },
  keyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  keySet: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontFamily: 'monospace' },
  toggleText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: 15 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currencyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  currencyBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  currencyText: { fontSize: 14, color: Colors.textSecondary },
  currencyTextActive: { color: Colors.textInverse, fontWeight: '600' },
  dangerBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  dangerBtnText: { color: Colors.danger, fontWeight: '600', fontSize: 15 },
});
