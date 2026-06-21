import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { pagosApi, MetodoPago, TipoPago } from '@/lib/api/pagos.api';
import { authStore } from '@/lib/store/authStore';
import { MOCK_PAGOS } from '@/lib/mock/mockData';

type TabType = 'transferencia' | 'cheque' | 'efectivo';

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

export default function PaymentsScreen() {
  const router = useRouter();
  const [pagos, setPagos]       = useState<MetodoPago[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState<TabType>('transferencia');

  // Campos transferencia
  const [cbu, setCbu]           = useState('');
  const [alias, setAlias]       = useState('');
  const [titular, setTitular]   = useState('');
  const [banco, setBanco]       = useState('');
  const [tipoCuenta, setTipoCuenta] = useState<'Ahorro' | 'Corriente'>('Ahorro');

  // Campos cheque
  const [nroCheque, setNroCheque]   = useState('');
  const [bancoCheque, setBancoCheque] = useState('');
  const [monto, setMonto]           = useState('');

  // Campos efectivo
  const [notaEfectivo, setNotaEfectivo] = useState('');

  const [isPrueba, setIsPrueba] = useState(false);

  const load = useCallback(async () => {
    const sesion = await authStore.get();
    if (authStore.isPrueba(sesion)) {
      setIsPrueba(true);
      setPagos(MOCK_PAGOS);
    } else {
      const { data, error } = await pagosApi.listar();
      if (error) {
        Alert.alert('Error al cargar pagos', error);
      } else if (data) {
        setPagos(data);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setCbu(''); setAlias(''); setTitular(''); setBanco(''); setTipoCuenta('Ahorro');
    setNroCheque(''); setBancoCheque(''); setMonto('');
    setNotaEfectivo('');
    setTab('transferencia');
  };

  const buildDetalle = (): string => {
    if (tab === 'transferencia') {
      const id = cbu.trim() ? `CBU: ${cbu.trim()}` : `Alias: ${alias.trim()}`;
      return `${banco.trim()} (${tipoCuenta}) — ${id} — Titular: ${titular.trim()}`;
    }
    if (tab === 'cheque') {
      return `Cheque Nro. ${nroCheque.trim()} — ${bancoCheque.trim()} — Monto: $${monto.trim()}`;
    }
    return notaEfectivo.trim() || 'Pago en efectivo';
  };

  const handleSave = async () => {
    if (tab === 'transferencia') {
      if (!cbu.trim() && !alias.trim()) { Alert.alert('Error', 'Ingresá CBU o Alias.'); return; }
      if (cbu.trim() && cbu.length !== 22) { Alert.alert('Error', 'El CBU debe tener 22 dígitos.'); return; }
      if (!titular.trim()) { Alert.alert('Error', 'Ingresá el titular.'); return; }
      if (!banco.trim())   { Alert.alert('Error', 'Ingresá el banco.'); return; }
    } else if (tab === 'cheque') {
      if (!nroCheque.trim()) { Alert.alert('Error', 'Ingresá el número de cheque.'); return; }
      if (!bancoCheque.trim()) { Alert.alert('Error', 'Ingresá el banco emisor.'); return; }
      if (!monto.trim() || isNaN(parseFloat(monto))) { Alert.alert('Error', 'Ingresá un monto válido.'); return; }
    }

    setSaving(true);
    const { data, error } = await pagosApi.agregar(tab, buildDetalle());
    setSaving(false);

    if (error) { Alert.alert('Error', error); return; }
    if (data) setPagos(prev => [...prev, data]);
    setModalOpen(false);
    resetForm();
  };

  const handleEliminar = (id: number) => {
    if (isPrueba) { Alert.alert('Modo demo', 'En modo prueba no se pueden eliminar medios de pago.'); return; }
    Alert.alert('Eliminar medio de pago', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await pagosApi.eliminar(id);
          setPagos(prev => prev.filter(p => p.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medios de Pago</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {pagos.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={48} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyText}>Sin medios de pago registrados</Text>
            </View>
          )}

          {pagos.map(p => (
            <View key={p.id} style={styles.card}>
              <Ionicons name={TIPO_ICON[p.tipo]} size={28} color={Colors.dark.primary} />
              <View style={styles.cardDetails}>
                <Text style={styles.cardTitle}>{TIPO_LABEL[p.tipo]}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>{p.detalle}</Text>
              </View>
              <TouchableOpacity onPress={() => handleEliminar(p.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={Colors.dark.primary} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalOpen(true); }}>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>AGREGAR MEDIO DE PAGO</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Medio de Pago</Text>
                <TouchableOpacity onPress={() => setModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                {(['transferencia', 'cheque', 'efectivo'] as TabType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tabButton, tab === t && styles.tabActive]}
                    onPress={() => setTab(t)}
                  >
                    <Ionicons name={TIPO_ICON[t]} size={15} color={tab === t ? '#FFF' : Colors.dark.textSecondary} />
                    <Text style={[styles.tabText, tab === t && { color: '#FFF' }]}>
                      {TIPO_LABEL[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingBottom: Spacing.five }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {tab === 'transferencia' && (
                  <>
                    <View><Text style={styles.inputLabel}>CBU (22 DÍGITOS)</Text>
                      <TextInput style={styles.input} placeholder="0070123456789012345678" placeholderTextColor={Colors.dark.textSecondary} keyboardType="numeric" maxLength={22} value={cbu} onChangeText={setCbu} /></View>
                    <View><Text style={styles.inputLabel}>O ALIAS</Text>
                      <TextInput style={styles.input} placeholder="mi.alias.banco" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="none" value={alias} onChangeText={setAlias} /></View>
                    <View><Text style={styles.inputLabel}>TITULAR</Text>
                      <TextInput style={styles.input} placeholder="JUAN PÉREZ" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="characters" value={titular} onChangeText={setTitular} /></View>
                    <View><Text style={styles.inputLabel}>BANCO</Text>
                      <TextInput style={styles.input} placeholder="BANCO GALICIA" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="characters" value={banco} onChangeText={setBanco} /></View>
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

                {tab === 'cheque' && (
                  <>
                    <View><Text style={styles.inputLabel}>NÚMERO DE CHEQUE</Text>
                      <TextInput style={styles.input} placeholder="12345678" placeholderTextColor={Colors.dark.textSecondary} keyboardType="numeric" value={nroCheque} onChangeText={setNroCheque} /></View>
                    <View><Text style={styles.inputLabel}>BANCO EMISOR</Text>
                      <TextInput style={styles.input} placeholder="BANCO NACIÓN" placeholderTextColor={Colors.dark.textSecondary} autoCapitalize="characters" value={bancoCheque} onChangeText={setBancoCheque} /></View>
                    <View><Text style={styles.inputLabel}>MONTO EN GARANTÍA ($)</Text>
                      <TextInput style={styles.input} placeholder="150000" placeholderTextColor={Colors.dark.textSecondary} keyboardType="numeric" value={monto} onChangeText={setMonto} /></View>
                  </>
                )}

                {tab === 'efectivo' && (
                  <View><Text style={styles.inputLabel}>NOTA (OPCIONAL)</Text>
                    <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} placeholder="Ej: Entregado antes del inicio de la subasta" placeholderTextColor={Colors.dark.textSecondary} multiline value={notaEfectivo} onChangeText={setNotaEfectivo} /></View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>GUARDAR MEDIO DE PAGO</Text>}
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
  scrollContent: { padding: Spacing.four, gap: Spacing.three },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.two },
  emptyText: { fontSize: 15, color: Colors.dark.textSecondary },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.backgroundElement, padding: Spacing.four, borderRadius: 12, gap: Spacing.three },
  cardDetails: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  cardSubtitle: { fontSize: 12, color: Colors.dark.textSecondary },
  deleteBtn: { padding: 4 },
  addButton: { height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.two },
  addButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.dark.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.four, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
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
