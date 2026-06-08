import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { api } from '@/lib/api/apiClient';
import { pagosApi, MetodoPago } from '@/lib/api/pagos.api';

interface Victoria {
  id: number;
  titulo: string;
  importe: number;
  fechavictoria: string;
  horasRestantes: number;
  categoria: string;
}

function formatDate(iso: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-AR'); } catch { return iso; }
}

export default function VictoriesScreen() {
  const router = useRouter();
  const [victorias, setVictorias] = useState<Victoria[]>([]);
  const [pagos, setPagos] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Victoria | null>(null);
  const [selectedPagoId, setSelectedPagoId] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [vRes, pRes] = await Promise.all([
      api.get<Victoria[]>('/api/perfil/victorias'),
      pagosApi.listar(),
    ]);
    if (vRes.data) setVictorias(vRes.data);
    if (pRes.data) setPagos(pRes.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePagar = async () => {
    if (!selected || selectedPagoId === null) return;
    setPaying(true);
    const res = await api.post<{ mensaje: string }>(`/api/perfil/victorias/${selected.id}/pagar`, {
      metodoPagoId: selectedPagoId,
    });
    setPaying(false);
    if (res.error) {
      Alert.alert('Error', res.error);
      return;
    }
    setSelected(null);
    setSelectedPagoId(null);
    Alert.alert('Pago registrado', '¡Tu pago fue procesado correctamente!');
    load(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Victorias pendientes</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
        >
          {victorias.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="trophy-outline" size={52} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyTitle}>Sin victorias pendientes</Text>
              <Text style={styles.emptyText}>Cuando ganes una subasta, aparecerá aquí para que puedas pagar.</Text>
            </View>
          ) : (
            victorias.map(v => {
              const urgente = v.horasRestantes <= 12;
              return (
                <View key={v.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{v.titulo}</Text>
                      {v.categoria ? (
                        <Text style={styles.cardMeta}>Subasta {v.categoria}</Text>
                      ) : null}
                      <Text style={styles.cardDate}>Ganado el {formatDate(v.fechavictoria)}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.cardImporte}>${v.importe.toLocaleString('es-AR')}</Text>
                    </View>
                  </View>

                  <View style={[styles.timerRow, urgente && styles.timerRowUrgente]}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={urgente ? '#EF4444' : '#FFD700'}
                    />
                    <Text style={[styles.timerText, urgente && styles.timerTextUrgente]}>
                      {v.horasRestantes > 0
                        ? `${v.horasRestantes}h restantes para pagar`
                        : 'Tiempo vencido — posible multa aplicada'}
                    </Text>
                  </View>

                  {pagos.length === 0 ? (
                    <TouchableOpacity
                      style={styles.addPagoBtn}
                      onPress={() => router.push('/(profile)/payments')}
                    >
                      <Text style={styles.addPagoBtnText}>Agregá un medio de pago primero</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.pagarBtn} onPress={() => setSelected(v)}>
                      <Text style={styles.pagarBtnText}>PAGAR AHORA</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Modal selección de medio de pago */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => { setSelected(null); setSelectedPagoId(null); }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar pago</Text>
              <TouchableOpacity onPress={() => { setSelected(null); setSelectedPagoId(null); }}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {selected && (
              <>
                <View style={styles.modalAmountCard}>
                  <Text style={styles.modalAmountLabel}>MONTO A PAGAR</Text>
                  <Text style={styles.modalAmount}>${selected.importe.toLocaleString('es-AR')}</Text>
                  <Text style={styles.modalItemName}>{selected.titulo}</Text>
                </View>

                <Text style={styles.modalSectionLabel}>SELECCIONÁ UN MEDIO DE PAGO</Text>

                {pagos.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.pagoOption, selectedPagoId === p.id && styles.pagoOptionSelected]}
                    onPress={() => setSelectedPagoId(p.id)}
                  >
                    <View style={styles.pagoOptionLeft}>
                      <Ionicons
                        name={p.tipo === 'transferencia' ? 'swap-horizontal-outline' : p.tipo === 'cheque' ? 'document-text-outline' : 'cash-outline'}
                        size={20}
                        color={selectedPagoId === p.id ? Colors.dark.primary : Colors.dark.textSecondary}
                      />
                      <View>
                        <Text style={[styles.pagoTipo, selectedPagoId === p.id && { color: Colors.dark.primary }]}>
                          {p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)}
                        </Text>
                        <Text style={styles.pagoDetalle} numberOfLines={1}>{p.detalle}</Text>
                      </View>
                    </View>
                    {selectedPagoId === p.id && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.dark.primary} />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.confirmBtn, (!selectedPagoId || paying) && { opacity: 0.5 }]}
                  onPress={handlePagar}
                  disabled={!selectedPagoId || paying}
                >
                  {paying
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.confirmBtnText}>CONFIRMAR Y PAGAR</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: '#0F182F' },
  backButton: { marginRight: Spacing.three },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContent: { padding: Spacing.four, gap: Spacing.three, paddingBottom: 40 },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  emptyText: { fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 20 },

  card: { backgroundColor: Colors.dark.backgroundElement, borderRadius: 16, padding: Spacing.four, gap: Spacing.three },
  cardTop: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  cardMeta: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },
  cardDate: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 4, opacity: 0.7 },
  cardRight: { alignItems: 'flex-end' },
  cardImporte: { fontSize: 20, fontWeight: 'bold', color: '#FFD700' },

  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,215,0,0.08)', paddingHorizontal: Spacing.three, paddingVertical: 8, borderRadius: 8 },
  timerRowUrgente: { backgroundColor: 'rgba(239,68,68,0.1)' },
  timerText: { fontSize: 13, color: '#FFD700', fontWeight: '600' },
  timerTextUrgente: { color: '#EF4444' },

  pagarBtn: { height: 44, backgroundColor: Colors.dark.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pagarBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  addPagoBtn: { height: 44, backgroundColor: '#242F50', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addPagoBtnText: { color: Colors.dark.textSecondary, fontSize: 13 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.dark.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.four, gap: Spacing.three, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  modalAmountCard: { backgroundColor: Colors.dark.backgroundElement, borderRadius: 12, padding: Spacing.four, alignItems: 'center', gap: 4 },
  modalAmountLabel: { fontSize: 10, color: Colors.dark.textSecondary, fontWeight: 'bold', letterSpacing: 1 },
  modalAmount: { fontSize: 28, fontWeight: 'bold', color: '#FFD700' },
  modalItemName: { fontSize: 13, color: Colors.dark.textSecondary, textAlign: 'center' },
  modalSectionLabel: { fontSize: 11, fontWeight: 'bold', color: Colors.dark.textSecondary, letterSpacing: 1 },
  pagoOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.dark.backgroundElement, borderRadius: 10, padding: Spacing.three, borderWidth: 1, borderColor: 'transparent' },
  pagoOptionSelected: { borderColor: Colors.dark.primary },
  pagoOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pagoTipo: { fontSize: 14, fontWeight: '600', color: '#fff' },
  pagoDetalle: { fontSize: 12, color: Colors.dark.textSecondary, maxWidth: 220 },
  confirmBtn: { height: 52, backgroundColor: Colors.dark.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
});
