import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { api } from '@/lib/api/apiClient';

interface Fine {
  id: number;
  motivo: string;
  titulo: string;
  importe: number;
  fechamulta: string;
  pagada: 'si' | 'no';
}

function formatDate(iso: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR');
  } catch { return iso; }
}

export default function FinesScreen() {
  const router = useRouter();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await api.get<Fine[]>('/api/perfil/multas');
    if (res.data) setFines(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingTotal = fines
    .filter(f => f.pagada === 'no')
    .reduce((sum, f) => sum + f.importe, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Multas y Bloqueos</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {/* Resumen del Estado */}
          <View style={styles.statusBox}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusLabel}>ESTADO DE LA CUENTA</Text>
                <Text style={styles.statusValue}>
                  {pendingTotal > 0 ? 'Con Advertencia' : 'Habilitada / Limpia'}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: pendingTotal > 0 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(16, 185, 129, 0.15)' }
              ]}>
                <Ionicons
                  name={pendingTotal > 0 ? "warning-outline" : "checkmark-circle-outline"}
                  size={24}
                  color={pendingTotal > 0 ? '#FFD700' : Colors.dark.success}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total en multas pendientes:</Text>
              <Text style={[styles.totalAmount, pendingTotal > 0 ? styles.hasFines : styles.noFines]}>
                ${pendingTotal.toLocaleString('es-AR')}
              </Text>
            </View>
          </View>

          {/* Sección Multas */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>HISTORIAL DE MULTAS</Text>

            {fines.length === 0 ? (
              <Text style={styles.emptyText}>No registras multas en el sistema.</Text>
            ) : (
              <View style={styles.listContainer}>
                {fines.map((fine) => {
                  const isPending = fine.pagada === 'no';
                  return (
                    <View key={fine.id} style={styles.listItem}>
                      <View style={styles.itemMain}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{fine.motivo}</Text>
                          <Text style={styles.itemSubtitle}>{fine.titulo}</Text>
                          <Text style={styles.itemDate}>{formatDate(fine.fechamulta)}</Text>
                        </View>
                        <View style={styles.itemRight}>
                          <Text style={[styles.itemAmount, isPending ? styles.pendingText : styles.paidText]}>
                            ${fine.importe.toLocaleString('es-AR')}
                          </Text>
                          {isPending ? (
                            <View style={styles.pendingBadge}>
                              <Text style={styles.pendingBadgeText}>PENDIENTE</Text>
                            </View>
                          ) : (
                            <View style={styles.paidBadge}>
                              <Text style={styles.paidBadgeText}>PAGADA</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Sección Bloqueos */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>HISTORIAL DE BLOQUEOS</Text>
            <Text style={styles.emptyText}>No registras bloqueos ni suspensiones en tu historial.</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: '#0F182F' },
  backButton: { marginRight: Spacing.three },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContent: { padding: Spacing.four, gap: Spacing.four, paddingBottom: 40 },
  statusBox: { backgroundColor: '#0F182F', padding: Spacing.four, borderRadius: 16, gap: Spacing.three },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 10, color: Colors.dark.textSecondary, fontWeight: 'bold', letterSpacing: 1 },
  statusValue: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  statusBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#242F50' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  totalAmount: { fontSize: 18, fontWeight: 'bold' },
  hasFines: { color: '#FFD700' },
  noFines: { color: Colors.dark.success },
  sectionCard: { backgroundColor: Colors.dark.backgroundElement, borderRadius: 16, padding: Spacing.four, gap: Spacing.three },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1, marginBottom: Spacing.two },
  emptyText: { fontSize: 13, color: Colors.dark.textSecondary, textAlign: 'center', paddingVertical: Spacing.three },
  listContainer: { gap: Spacing.three },
  listItem: { borderBottomWidth: 1, borderBottomColor: '#242F50', paddingBottom: Spacing.three },
  itemMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  itemSubtitle: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },
  itemDate: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 4, opacity: 0.7 },
  itemRight: { alignItems: 'flex-end', gap: Spacing.two },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  pendingText: { color: '#FFD700' },
  paidText: { color: Colors.dark.success },
  pendingBadge: { backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: Spacing.three, paddingVertical: 4, borderRadius: 6 },
  pendingBadgeText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold' },
  paidBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: Spacing.three, paddingVertical: 4, borderRadius: 6 },
  paidBadgeText: { color: Colors.dark.success, fontSize: 10, fontWeight: 'bold' },
});
