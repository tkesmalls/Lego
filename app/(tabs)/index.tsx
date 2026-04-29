import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { StatCard } from '../../components/StatCard';
import { SetCard } from '../../components/SetCard';
import { useCollectionStats, useRecentSets } from '../../hooks/useCollection';

export default function DashboardScreen() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useCollectionStats();
  const { data: recent, isLoading: recentLoading } = useRecentSets(10);

  const totalValue = stats?.totalValue ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>My Lego Collection</Text>
        <Pressable style={styles.scanFAB} onPress={() => router.push('/(tabs)/scan')}>
          <Text style={styles.scanFABText}>Scan Box</Text>
        </Pressable>
      </View>

      {statsLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard label="Total Sets" value={stats?.total ?? 0} />
            <StatCard label="Total Parts" value={(stats?.totalParts ?? 0).toLocaleString()} />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Collection Value"
              value={`$${totalValue.toFixed(0)}`}
              color={Colors.primary}
            />
            <StatCard
              label="Wanted"
              value={stats?.wanted ?? 0}
              color={Colors.wanted}
            />
          </View>
          <View style={styles.statusRow}>
            <StatusPill label="Owned" value={stats?.owned ?? 0} color={Colors.owned} />
            <StatusPill label="Wanted" value={stats?.wanted ?? 0} color={Colors.wanted} />
            <StatusPill label="For Sale" value={stats?.for_sale ?? 0} color={Colors.for_sale} />
          </View>
        </>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Added</Text>
        <Pressable onPress={() => router.push('/(tabs)/collection')}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      {recentLoading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : !recent?.length ? (
        <View style={styles.emptyRecent}>
          <Text style={styles.emptyTitle}>No sets yet</Text>
          <Text style={styles.emptyHint}>Scan a barcode or search to add your first set.</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.qaBtn} onPress={() => router.push('/(tabs)/scan')}>
              <Text style={styles.qaBtnText}>Scan Barcode</Text>
            </Pressable>
            <Pressable style={[styles.qaBtn, styles.qaBtnSecondary]} onPress={() => router.push('/(tabs)/search')}>
              <Text style={[styles.qaBtnText, styles.qaBtnTextSecondary]}>Search Sets</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        recent.map(set => <SetCard key={set.set_num} set={set} />)
      )}
    </ScrollView>
  );
}

function StatusPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  content: { paddingBottom: 32 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  scanFAB: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanFABText: { color: Colors.textInverse, fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 12 },
  statusRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 8 },
  pill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
  },
  pillValue: { fontSize: 20, fontWeight: '700' },
  pillLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  emptyRecent: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  quickActions: { flexDirection: 'row', gap: 12 },
  qaBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.primary },
  qaBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  qaBtnText: { color: Colors.textInverse, fontWeight: '600', fontSize: 14 },
  qaBtnTextSecondary: { color: Colors.primary },
});
