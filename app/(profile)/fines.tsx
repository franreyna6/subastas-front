import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { api } from '@/lib/api/apiClient';
import { pagosApi, MetodoPago, TipoPago } from '@/lib/api/pagos.api';

interface Fine {
  id: number;
  motivo: string;
  titulo: string;
  importe: number;
  fechamulta: string;
  pagada: 'si' | 'no';
}

type AddMethodTab = 'transferencia' | 'cheque' | 'efectivo';

const TIPO_ICON: Record<TipoPago, React.ComponentProps<typeof Ionicons>['name']> = {
  transferencia: 'business-outline',
  cheque:        'document-text-outline',
  efectivo:      'cash-outline',
};

const TIPO_LABEL: Record<TipoPago, string> = {
  transferencia: 'Transferencia',
  cheque:        'Cheque',
  efectivo:      'Efectivo',
};

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

  // Pay modal state
  const [payModal, setPayModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<MetodoPago[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  // Add method modal state
  const [addMethodModal, setAddMethodModal] = useState(false);
  const [addTab, setAddTab] = useState<AddMethodTab>('transferencia');
  const [savingMethod, setSavingMethod] = useState(false);
  const [cbu, setCbu] = useState('');
  const [alias, setAlias] = useState('');
  const [titular, setTitular] = useState('');
  const [banco, setBanco] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState<'Ahorro' | 'Corriente'>('Ahorro');
  const [nroCheque, setNroCheque] = useState('');
  const [bancoCheque, setBancoCheque] = useState('');
  const [monto, setMonto] = useState('');
  const [notaEfectivo, setNotaEfectivo] = useState('');

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

  const handleOpenPayModal = async (fine: Fine) => {
    setSelectedFine(fine);
    setSelectedMethodId(null);
    setPayModal(true);
    setLoadingMethods(true);
    const { data } = await pagosApi.listar();
    if (data) setPaymentMethods(data);
    setLoadingMethods(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFine || !selectedMethodId) {
      Alert.alert('Error', 'Seleccioná un método de pago.');
      return;
    }
    setPaying(true);
    const { error } = await pagosApi.pagarMulta(selectedFine.id, selectedMethodId);
    setPaying(false);
    if (error) { Alert.alert('Error al pagar', error); return; }
    setPayModal(false);
    Alert.alert('Pago registrado', 'La multa fue marcada como pagada correctamente.');
    load(true);
  };

  const resetAddForm = () => {
    setCbu(''); setAlias(''); setTitular(''); setBanco(''); setTipoCuenta('Ahorro');
    setNroCheque(''); setBancoCheque(''); setMonto(''); setNotaEfectivo('');
    setAddTab('transferencia');
  };

  const buildDetalle = (): string => {
    if (addTab === 'transferencia') {
      const id = cbu.trim() ? `CBU: ${cbu.trim()}` : `Alias: ${alias.trim()}`;
      return `${banco.trim()} (${tipoCuenta}) — ${id} — Titular: ${titular.trim()}`;
    }
    if (addTab === 'cheque') {
      return `Cheque Nro. ${nroCheque.trim()} — ${bancoCheque.trim()} — Monto: $${monto.trim()}`;
    }
    return notaEfectivo.trim() || 'Pago en efectivo';
  };

  const handleSaveMethod = async () => {
    if (addTab === 'transferencia') {
      if (!cbu.trim() && !alias.trim()) { Alert.alert('Error', 'Ingresá CBU o Alias.'); return; }
      if (cbu.trim() && cbu.length !== 22) { Alert.alert('Error', 'El CBU debe tener 22 dígitos.'); return; }
      if (!titular.trim()) { Alert.alert('Error', 'Ingresá el titular.'); return; }
      if (!banco.trim()) { Alert.alert('Error', 'Ingresá el banco.'); return; }
    } else if (addTab === 'cheque') {
      if (!nroCheque.trim()) { Alert.alert('Error', 'Ingresá el número de cheque.'); return; }
      if (!bancoCheque.trim()) { Alert.alert('Error', 'Ingresá el banco emisor.'); return; }
      if (!monto.trim() || isNaN(parseFloat(monto))) { Alert.alert('Error', 'Ingresá un monto válido.'); return; }
    }

    setSavingMethod(true);
    const { data, error } = await pagosApi.agregar(addTab, buildDetalle());
    setSavingMethod(false);
    if (error) { Alert.alert('Error', error); return; }
    if (data) {
      setPaymentMethods(prev => [...prev, data]);
      setSelectedMethodId(data.id);
    }
    setAddMethodModal(false);
    resetAddForm();
  };

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
                          {isPending && (
                            <TouchableOpacity style={styles.payButton} onPress={() => handleOpenPayModal(fine)}>
                              <Ionicons name="card-outline" size={13} color="#FFF" style={{ marginRight: 4 }} />
                              <Text style={styles.payButtonText}>PAGAR</Text>
                            </TouchableOpacity>
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

      {/* Modal: Seleccionar método de pago */}
      <Modal visible={payModal} animationType="slide" transparent onRequestClose={() => setPayModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Pagar Multa</Text>
                {selectedFine && (
                  <Text style={styles.modalSubtitle}>
                    {selectedFine.motivo} — ${selectedFine.importe.toLocaleString('es-AR')}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setPayModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>SELECCIONÁ UN MÉTODO DE PAGO</Text>

            {loadingMethods ? (
              <ActivityIndicator color={Colors.dark.primary} style={{ marginVertical: 24 }} />
            ) : (
              <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                {paymentMethods.length === 0 ? (
                  <Text style={styles.noMethodsText}>No tenés métodos de pago guardados.</Text>
                ) : (
                  paymentMethods.map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.methodRow, selectedMethodId === m.id && styles.methodRowSelected]}
                      onPress={() => setSelectedMethodId(m.id)}
                    >
                      <Ionicons name={TIPO_ICON[m.tipo]} size={22} color={selectedMethodId === m.id ? Colors.dark.primary : Colors.dark.textSecondary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.methodLabel}>{TIPO_LABEL[m.tipo]}</Text>
                        <Text style={styles.methodDetail} numberOfLines={1}>{m.detalle}</Text>
                      </View>
                      <View style={[styles.radioOuter, selectedMethodId === m.id && styles.radioOuterSelected]}>
                        {selectedMethodId === m.id && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.addMethodBtn}
              onPress={() => { resetAddForm(); setAddMethodModal(true); }}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.dark.primary} style={{ marginRight: 6 }} />
              <Text style={styles.addMethodBtnText}>Añadir método de pago</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, (!selectedMethodId || paying) && styles.confirmBtnDisabled]}
              onPress={handleConfirmPayment}
              disabled={!selectedMethodId || paying}
            >
              {paying
                ? <ActivityIndicator color="#FFF" />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmBtnText}>CONFIRMAR PAGO</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Agregar método de pago */}
      <Modal visible={addMethodModal} animationType="slide" transparent onRequestClose={() => setAddMethodModal(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Método de Pago</Text>
                <TouchableOpacity onPress={() => setAddMethodModal(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                {(['transferencia', 'cheque', 'efectivo'] as AddMethodTab[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tabButton, addTab === t && styles.tabActive]}
                    onPress={() => setAddTab(t)}
                  >
                    <Ionicons name={TIPO_ICON[t]} size={15} color={addTab === t ? '#FFF' : Colors.dark.textSecondary} />
                    <Text style={[styles.tabText, addTab === t && { color: '#FFF' }]}>
                      {TIPO_LABEL[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingBottom: Spacing.five }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {addTab === 'transferencia' && (
                  <>
                    <View>
                      <Text style={styles.inputLabel}>CBU (22 DÍGITOS)</Text>
                      <TextInput style={styles.input} placeholder="0070123456789012345678" placeholderTextColor={Colors.dark.textSecondary} keyboardType="numeric" maxLength={22} value={cbu} onChangeText={setCbu} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>O ALIAS</Text>
                      <TextInput style={styles.input} placeholder="mi.alias.banco" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="none" value={alias} onChangeText={setAlias} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>TITULAR</Text>
                      <TextInput style={styles.input} placeholder="JUAN PÉREZ" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="characters" value={titular} onChangeText={setTitular} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>BANCO</Text>
                      <TextInput style={styles.input} placeholder="BANCO GALICIA" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="characters" value={banco} onChangeText={setBanco} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>TIPO DE CUENTA</Text>
                      <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                        {(['Ahorro', 'Corriente'] as const).map(t => (
                          <TouchableOpacity key={t} style={[styles.selectBtn, tipoCuenta === t && styles.selectBtnActive]} onPress={() => setTipoCuenta(t)}>
                            <Text style={[styles.selectBtnText, tipoCuenta === t && { color: Colors.dark.primary }]}>{t === 'Ahorro' ? 'Caja de Ahorro' : 'Cta. Corriente'}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                {addTab === 'cheque' && (
                  <>
                    <View>
                      <Text style={styles.inputLabel}>NÚMERO DE CHEQUE</Text>
                      <TextInput style={styles.input} placeholder="12345678" placeholderTextColor={Colors.dark.textSecondary} keyboardType="numeric" value={nroCheque} onChangeText={setNroCheque} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>BANCO EMISOR</Text>
                      <TextInput style={styles.input} placeholder="BANCO NACIÓN" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="characters" value={bancoCheque} onChangeText={setBancoCheque} />
                    </View>
                    <View>
                      <Text style={styles.inputLabel}>MONTO EN GARANTÍA ($)</Text>
                      <TextInput style={styles.input} placeholder="150000" placeholderTextColor={Colors.dark.textSecondary} keyboardType="numeric" value={monto} onChangeText={setMonto} />
                    </View>
                  </>
                )}

                {addTab === 'efectivo' && (
                  <View>
                    <Text style={styles.inputLabel}>NOTA (OPCIONAL)</Text>
                    <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} placeholder="Ej: Entregado antes del inicio de la subasta" placeholderTextColor={Colors.dark.textSecondary} multiline value={notaEfectivo} onChangeText={setNotaEfectivo} />
                  </View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveMethod} disabled={savingMethod}>
                  {savingMethod ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>GUARDAR MÉTODO DE PAGO</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
  payButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.primary, paddingHorizontal: Spacing.three, paddingVertical: 6, borderRadius: 6 },
  payButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },

  // Modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.dark.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.four, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.four },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  modalSubtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.dark.textSecondary, letterSpacing: 1, marginBottom: Spacing.three },
  noMethodsText: { fontSize: 13, color: Colors.dark.textSecondary, textAlign: 'center', paddingVertical: Spacing.four },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: 12, marginBottom: Spacing.two, backgroundColor: Colors.dark.backgroundElement, borderWidth: 1.5, borderColor: 'transparent' },
  methodRowSelected: { borderColor: Colors.dark.primary },
  methodLabel: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  methodDetail: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.dark.textSecondary, justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: Colors.dark.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.dark.primary },
  addMethodBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.three, marginTop: Spacing.three, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.dark.primary },
  addMethodBtnText: { color: Colors.dark.primary, fontSize: 14, fontWeight: 'bold' },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 10, marginTop: Spacing.three },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

  // Add method form
  tabContainer: { flexDirection: 'row', backgroundColor: Colors.dark.backgroundElement, borderRadius: 12, padding: 4, marginBottom: Spacing.four, gap: 4 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.two + 2, borderRadius: 8, gap: 6 },
  tabActive: { backgroundColor: Colors.dark.backgroundSelected },
  tabText: { fontSize: 12, fontWeight: 'bold', color: Colors.dark.textSecondary },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.dark.textSecondary, letterSpacing: 1, marginBottom: 4 },
  input: { height: 48, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: '#FFFFFF', fontSize: 14 },
  selectBtn: { flex: 1, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  selectBtnActive: { borderColor: Colors.dark.primary },
  selectBtnText: { fontSize: 12, fontWeight: 'bold', color: Colors.dark.textSecondary },
  saveButton: { height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two },
  saveButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
});
