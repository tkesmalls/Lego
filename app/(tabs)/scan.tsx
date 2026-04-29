import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert,
  TextInput, Modal, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { lookupBarcode, fetchSet } from '../../lib/api/rebrickable';
import { AddToCollectionSheet } from '../../components/AddToCollectionSheet';
import { useAddSet } from '../../hooks/useCollection';
import type { RebrickableSet } from '../../lib/api/types';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [foundSet, setFoundSet] = useState<RebrickableSet | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const cooldownRef = useRef(false);
  const addSet = useAddSet();

  async function handleBarcode(result: BarcodeScanningResult) {
    if (!scanning || loading || cooldownRef.current) return;
    cooldownRef.current = true;
    setScanning(false);
    setLoading(true);

    try {
      const set = await lookupBarcode(result.data);
      if (set) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFoundSet(set);
        setSheetVisible(true);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Set Not Found',
          `Barcode "${result.data}" didn't match a known Lego set. Enter the set number manually?`,
          [
            { text: 'Try Again', onPress: resetScan },
            { text: 'Manual Entry', onPress: () => setManualModal(true) },
          ]
        );
      }
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes('API key not set')) {
        Alert.alert('API Key Required', 'Add your Rebrickable API key in Settings first.', [
          { text: 'OK', onPress: resetScan },
        ]);
      } else {
        Alert.alert('Error', 'Failed to look up set. Check your connection.', [
          { text: 'Try Again', onPress: resetScan },
        ]);
      }
    } finally {
      setLoading(false);
      setTimeout(() => { cooldownRef.current = false; }, 2000);
    }
  }

  async function handleManualLookup() {
    const num = manualInput.trim();
    if (!num) return;
    setLoading(true);
    try {
      const set = await fetchSet(num);
      setFoundSet(set);
      setManualModal(false);
      setManualInput('');
      setSheetVisible(true);
    } catch {
      Alert.alert('Not Found', `Set "${num}" was not found. Check the number and try again.`);
    } finally {
      setLoading(false);
    }
  }

  function resetScan() {
    setScanning(true);
    setFoundSet(null);
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Allow camera access to scan Lego box barcodes.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanning ? handleBarcode : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
      />

      {/* Scan frame overlay */}
      <View style={styles.overlay}>
        <View style={styles.topDim} />
        <View style={styles.middleRow}>
          <View style={styles.sideDim} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideDim} />
        </View>
        <View style={styles.bottomDim}>
          {loading ? (
            <ActivityIndicator color={Colors.accent} size="large" />
          ) : (
            <>
              <Text style={styles.scanHint}>Point at the barcode on the Lego box</Text>
              <Pressable style={styles.manualBtn} onPress={() => setManualModal(true)}>
                <Text style={styles.manualBtnText}>Enter Set Number Manually</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <AddToCollectionSheet
        visible={sheetVisible}
        set={foundSet}
        onClose={() => { setSheetVisible(false); resetScan(); }}
        onAdd={set => { addSet.mutate(set); resetScan(); }}
      />

      <Modal visible={manualModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setManualModal(false)} />
        <View style={styles.manualSheet}>
          <Text style={styles.manualTitle}>Enter Set Number</Text>
          <Text style={styles.manualHint}>e.g. 75192 or 75192-1</Text>
          <TextInput
            style={styles.manualInput}
            placeholder="Set number..."
            value={manualInput}
            onChangeText={setManualInput}
            keyboardType="default"
            autoCapitalize="none"
            autoFocus
            onSubmitEditing={handleManualLookup}
          />
          <View style={styles.manualActions}>
            <Pressable style={styles.cancelBtn} onPress={() => { setManualModal(false); resetScan(); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.lookupBtn} onPress={handleManualLookup}>
              {loading
                ? <ActivityIndicator color={Colors.textInverse} />
                : <Text style={styles.lookupText}>Look Up</Text>
              }
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const DIM = 'rgba(0,0,0,0.65)';
const FRAME = 260;
const CORNER = 24;
const BORDER = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, backgroundColor: Colors.surfaceAlt,
  },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  permissionText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  permissionBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14,
  },
  permissionBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1 },
  topDim: { flex: 1, backgroundColor: DIM },
  middleRow: { flexDirection: 'row', height: FRAME },
  sideDim: { flex: 1, backgroundColor: DIM },
  scanFrame: { width: FRAME, height: FRAME },
  bottomDim: {
    flex: 1, backgroundColor: DIM,
    alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 32,
  },
  corner: {
    position: 'absolute', width: CORNER, height: CORNER,
    borderColor: Colors.accent, borderWidth: BORDER,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanHint: { color: '#fff', fontSize: 14, textAlign: 'center' },
  manualBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.accent,
  },
  manualBtnText: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  manualSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  manualTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  manualHint: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  manualInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    padding: 12, fontSize: 16, color: Colors.textPrimary, marginBottom: 16,
  },
  manualActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontWeight: '600', color: Colors.textPrimary },
  lookupBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  lookupText: { color: Colors.textInverse, fontWeight: '700' },
});
