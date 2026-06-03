import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { subastasApi, HistorialItem } from '@/lib/api/subastas.api';
import { authStore } from '@/lib/store/authStore';

const PAGE_SIZE = 6;
type Filter = 'TODAS' | 'GANADA' | 'MAYORES';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Todas',    value: 'TODAS'   },
  { label: 'Ganadas',  value: 'GANADA'  },
  { label: '+$200.000', value: 'MAYORES' },
];

const STATUS_COLOR: Record<string, string> = {
  GANADA:    Colors.dark.success,
  'PARTICIPÓ': Colors.dark.textSecondary,
};

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function formatFecha(fecha: string) {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export default function MetricsScreen() {
  const router = useRouter();
  const [historial, setHistorial]       = useState<HistorialItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeFilter, setActiveFilter] = useState<Filter>('TODAS');

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    const sesion = await authStore.get();
    if (authStore.isPrueba(sesion)) {
      setHistorial([]);
    } else {
      const res = await subastasApi.historial();
      setHistorial(res.data ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (activeFilter === 'GANADA')   return historial.filter(i => i.estado === 'GANADA');
    if (activeFilter === 'MAYORES')  return historial.filter(i => i.importe > 200000);
    return historial;
  }, [activeFilter, historial]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const totalGastado = useMemo(
    () => historial.filter(i => i.estado === 'GANADA').reduce((s, i) => s + i.importe, 0),
    [historial],
  );

  const handleFilter = (f: Filter) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(buyer)/dashboard')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métricas e Historial</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.dark.primary} />
          }
        >
          {/* Resumen */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Resumen Financiero</Text>
            <Text style={styles.totalAmount}>{formatMoney(totalGastado)}</Text>
            <Text style={styles.summarySubtitle}>Monto Total Gastado (Subastas Ganadas)</Text>
          </View>

          {/* Historial */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Historial de Subastas</Text>

            <View style={styles.filtersRow}>
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
                  onPress={() => handleFilter(f.value)}
                >
                  <Text style={[styles.filterChipText, activeFilter === f.value && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {historial.length === 0 ? (
              <Text style={styles.emptyFilter}>Todavía no participaste en ninguna subasta.</Text>
            ) : visible.length === 0 ? (
              <Text style={styles.emptyFilter}>Sin subastas para este filtro.</Text>
            ) : (
              <>
                {visible.map((item, index) => (
                  <TouchableOpacity
                    key={item.subastaId}
                    style={[styles.historyItem, index === visible.length - 1 && !hasMore && { borderBottomWidth: 0 }]}
                    onPress={() => router.push({ pathname: '/(buyer)/closed-auction', params: { id: item.subastaId } })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyItemName} numberOfLines={1}>{item.descripcion}</Text>
                      <Text style={styles.historyItemDate}>{formatFecha(item.fecha)}</Text>
                      {item.importe > 0 && (
                        <Text style={styles.historyItemBid}>
                          {'Importe: '}
                          <Text style={styles.historyItemBidValue}>{formatMoney(item.importe)}</Text>
                        </Text>
                      )}
                    </View>
                    <View style={styles.historyRight}>
                      <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[item.estado] ?? Colors.dark.textSecondary) + '22' }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLOR[item.estado] ?? Colors.dark.textSecondary }]}>
                          {item.estado}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.dark.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))}

                {hasMore && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setVisibleCount(c => c + PAGE_SIZE)}
                  >
                    <Text style={styles.showMoreText}>Mostrar más</Text>
                    <Ionicons name="chevron-down" size={16} color={Colors.dark.primary} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/dashboard')}>
          <Ionicons name="home-outline" size={24} color={Colors.dark.textSecondary} />
          <Text style={styles.navText}>INICIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(profile)/metrics')}>
          <Ionicons name="time" size={24} color={Colors.dark.primary} />
          <Text style={[styles.navText, { color: Colors.dark.primary }]}>HISTORIAL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(profile)')}>
          <Ionicons name="person-outline" size={24} color={Colors.dark.textSecondary} />
          <Text style={styles.navText}>PERFIL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.dark.background },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: '#0F182F' },
  backButton:   { marginRight: Spacing.three },
  headerTitle:  { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four, paddingBottom: 100 },
  summaryBox:   { backgroundColor: '#0F182F', padding: Spacing.five, borderRadius: 16, alignItems: 'center', gap: 4 },
  summaryTitle: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1 },
  totalAmount:  { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },
  summarySubtitle: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 4 },
  sectionCard:  { backgroundColor: Colors.dark.backgroundElement, borderRadius: 16, padding: Spacing.four },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: Spacing.two },
  filtersRow:   { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three, flexWrap: 'wrap' },
  filterChip:   { paddingHorizontal: Spacing.three, paddingVertical: 6, borderRadius: 20, backgroundColor: '#242F50' },
  filterChipActive: { backgroundColor: Colors.dark.primary },
  filterChipText:   { fontSize: 12, fontWeight: '600', color: Colors.dark.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
  emptyFilter:  { fontSize: 13, color: Colors.dark.textSecondary, textAlign: 'center', paddingVertical: Spacing.four },
  historyItem:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three, borderBottomWidth: 1, borderBottomColor: '#242F50' },
  historyLeft:  { flex: 1, gap: 3 },
  historyItemName:     { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  historyItemDate:     { fontSize: 12, color: Colors.dark.textSecondary },
  historyItemBid:      { fontSize: 12, color: Colors.dark.textSecondary },
  historyItemBidValue: { color: '#FFFFFF', fontWeight: '600' },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  statusBadge:  { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: 8 },
  statusText:   { fontSize: 11, fontWeight: 'bold' },
  showMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.three, gap: Spacing.one, borderTopWidth: 1, borderTopColor: '#242F50', marginTop: Spacing.one },
  showMoreText: { fontSize: 14, color: Colors.dark.primary, fontWeight: '600' },
  navBar:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: '#0C111F', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#171B30' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: 'bold', color: Colors.dark.textSecondary, marginTop: 4 },
});
