import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Alert, Modal, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { solicitudesApi, SolicitudItem } from '@/lib/api/subastas.api';

const ESTADO_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
  pendiente:          { label: 'PENDIENTE',       color: '#4B5563',   textColor: '#fff' },
  inspeccion:         { label: 'EN INSPECCIÓN',   color: '#F59E0B',   textColor: '#000' },
  tasado:             { label: 'TASADO',           color: '#3B82F6',   textColor: '#fff' },
  aceptado_empresa:   { label: 'ACEPTADO',         color: '#16A34A',   textColor: '#fff' },
  rechazado_empresa:  { label: 'RECHAZADO',        color: '#DC2626',   textColor: '#fff' },
  aceptado_usuario:   { label: 'CONFIRMADO',       color: '#16A34A',   textColor: '#fff' },
  rechazado_usuario:  { label: 'DEVOLUCION',       color: '#6B7280',   textColor: '#fff' },
};

export default function MyItemsScreen() {
  const router = useRouter();
  const [items, setItems]         = useState<SolicitudItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [titulo, setTitulo]               = useState('');
  const [categoria, setCategoria]         = useState<string>('Arte');
  const [precioSugerido, setPrecioSugerido] = useState('');
  const [descripcion, setDescripcion]     = useState('');
  const [declaracion, setDeclaracion]     = useState(false);

  const cargar = useCallback(async () => {
    const res = await solicitudesApi.listar();
    if (res.data) setItems(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const resetForm = () => {
    setTitulo('');
    setCategoria('Arte');
    setPrecioSugerido('');
    setDescripcion('');
    setDeclaracion(false);
  };

  const handleEnviar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El nombre del artículo es obligatorio.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria.');
      return;
    }
    if (!declaracion) {
      Alert.alert('Error', 'Debés confirmar que el bien te pertenece y no tiene impedimentos legales.');
      return;
    }

    setSubmitting(true);
    const res = await solicitudesApi.crear({
      titulo: titulo.trim(),
      categoria,
      descripcion: descripcion.trim(),
      precioBaseSugerido: precioSugerido ? parseFloat(precioSugerido) : null,
      archivoComprobante: null,
      declaracionJurada: true,
    });
    setSubmitting(false);

    if (res.error) {
      Alert.alert('Error', res.error);
      return;
    }

    setIsModalOpen(false);
    resetForm();
    Alert.alert('Solicitud enviada', 'Tu solicitud fue recibida. Te avisaremos cuando la evaluemos.');
    cargar();
  };

  const handleAceptar = (item: SolicitudItem) => {
    Alert.alert(
      'Aceptar condiciones',
      `¿Aceptás el precio base de $${item.precioBaseOficial?.toLocaleString()} y comisión del ${item.comision}%?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            const res = await solicitudesApi.aceptarCondiciones(item.id);
            if (res.error) { Alert.alert('Error', res.error); return; }
            Alert.alert('Éxito', 'Condiciones aceptadas. El bien será incluido en una subasta.');
            cargar();
          },
        },
      ]
    );
  };

  const handleRechazar = (item: SolicitudItem) => {
    Alert.alert(
      'Rechazar condiciones',
      '¿Rechazás las condiciones? El bien será devuelto con los gastos a tu cargo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            const res = await solicitudesApi.rechazarCondiciones(item.id);
            if (res.error) { Alert.alert('Error', res.error); return; }
            Alert.alert('Condiciones rechazadas', 'El bien será devuelto a tu domicilio.');
            cargar();
          },
        },
      ]
    );
  };

  const renderItem = (item: SolicitudItem) => {
    const cfg = ESTADO_CONFIG[item.estado] ?? { label: item.estado.toUpperCase(), color: '#4B5563', textColor: '#fff' };
    const esTasado = item.estado === 'tasado';
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.titulo}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.color }]}>
            <Text style={[styles.badgeText, { color: cfg.textColor }]}>{cfg.label}</Text>
          </View>
        </View>

        {item.descripcion ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
        ) : null}

        {item.fechaSolicitud ? (
          <Text style={styles.cardDate}>
            Solicitud: {item.fechaSolicitud.slice(0, 10)}
          </Text>
        ) : null}

        {/* Tasación disponible → mostrar precio y comisión */}
        {esTasado && item.precioBaseOficial !== null && (
          <View style={styles.pricingBox}>
            <View>
              <Text style={styles.pricingLabel}>PRECIO BASE</Text>
              <Text style={styles.pricingValue}>$ {item.precioBaseOficial?.toLocaleString()}</Text>
            </View>
            <View>
              <Text style={styles.pricingLabel}>COMISIÓN</Text>
              <Text style={styles.pricingValue}>{item.comision}%</Text>
            </View>
          </View>
        )}

        {/* Motivo de rechazo */}
        {item.estado === 'rechazado_empresa' && item.motivoRechazo ? (
          <View style={styles.motivoBox}>
            <Ionicons name="information-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.motivoText}>{item.motivoRechazo}</Text>
          </View>
        ) : null}

        {/* Acciones para tasado */}
        {esTasado && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleRechazar(item)}>
              <Text style={styles.actionBtnText}>RECHAZAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAceptar(item)}>
              <Text style={styles.actionBtnText}>ACEPTAR</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Artículos a Subastar</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={Colors.dark.primary} />
          }
        >
          {items.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="cube-outline" size={48} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyText}>No tenés artículos enviados todavía</Text>
            </View>
          ) : items.map(renderItem)}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setIsModalOpen(true); }}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>NUEVA SOLICITUD</Text>
      </TouchableOpacity>

      {/* Modal formulario */}
      <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Solicitud</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
                <Text style={styles.inputLabel}>NOMBRE DEL ARTÍCULO *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Reloj de pared antiguo"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={titulo}
                  onChangeText={setTitulo}
                />

                <Text style={styles.inputLabel}>CATEGORÍA</Text>
                <View style={styles.catRow}>
                  {(['Arte', 'Relojes', 'Vehículos', 'Otros'] as const).map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catBtn, categoria === c && styles.catBtnActive]}
                      onPress={() => setCategoria(c)}
                    >
                      <Text style={[styles.catBtnText, categoria === c && styles.catBtnTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>PRECIO BASE SUGERIDO (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 120000"
                  placeholderTextColor={Colors.dark.textSecondary}
                  keyboardType="numeric"
                  value={precioSugerido}
                  onChangeText={setPrecioSugerido}
                />

                <Text style={styles.inputLabel}>DESCRIPCIÓN *</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top', paddingVertical: 8 }]}
                  placeholder="Estado físico, origen, antigüedad, historia..."
                  placeholderTextColor={Colors.dark.textSecondary}
                  multiline
                  value={descripcion}
                  onChangeText={setDescripcion}
                />

                {/* Declaración jurada */}
                <TouchableOpacity style={styles.checkRow} onPress={() => setDeclaracion(!declaracion)}>
                  <View style={[styles.checkbox, declaracion && styles.checkboxActive]}>
                    {declaracion && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkLabel}>
                    Declaro que el bien me pertenece y no posee ningún impedimento para ser subastado.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleEnviar}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitBtnText}>ENVIAR SOLICITUD</Text>}
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
  container:      { flex: 1, backgroundColor: Colors.dark.background },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: '#0F182F' },
  backButton:     { marginRight: Spacing.three },
  headerTitle:    { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContent:  { padding: Spacing.four, gap: Spacing.four, paddingBottom: 110 },
  emptyBox:       { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:      { fontSize: 15, color: Colors.dark.textSecondary },
  card:           { backgroundColor: Colors.dark.backgroundElement, padding: Spacing.four, borderRadius: 12, gap: Spacing.two },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle:      { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  badge:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  badgeText:      { fontSize: 10, fontWeight: 'bold' },
  cardDesc:       { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 18 },
  cardDate:       { fontSize: 11, color: Colors.dark.textSecondary },
  pricingBox:     { flexDirection: 'row', gap: Spacing.five, backgroundColor: '#121625', padding: Spacing.three, borderRadius: 8 },
  pricingLabel:   { fontSize: 10, color: Colors.dark.textSecondary, fontWeight: '600' },
  pricingValue:   { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2 },
  motivoBox:      { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: 'rgba(220,38,38,0.08)', padding: Spacing.three, borderRadius: 8 },
  motivoText:     { fontSize: 12, color: '#DC2626', flex: 1, lineHeight: 18 },
  buttonRow:      { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two },
  actionBtn:      { flex: 1, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  rejectBtn:      { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.dark.primary },
  acceptBtn:      { backgroundColor: Colors.dark.primary },
  actionBtnText:  { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  fab: {
    position: 'absolute', bottom: Spacing.five, left: Spacing.four, right: Spacing.four,
    height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.two,
    elevation: 6,
  },
  fabText:        { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  backdrop:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent:   { backgroundColor: Colors.dark.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: Spacing.four, paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, maxHeight: '90%' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  modalTitle:     { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  formScroll:     { paddingBottom: Spacing.five },
  inputLabel:     { fontSize: 10, fontWeight: 'bold', color: Colors.dark.textSecondary, letterSpacing: 1, marginTop: Spacing.three, marginBottom: Spacing.two },
  input:          { height: 48, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: '#FFFFFF', fontSize: 14 },
  catRow:         { flexDirection: 'row', gap: Spacing.two },
  catBtn:         { flex: 1, height: 38, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  catBtnActive:   { borderColor: Colors.dark.primary, backgroundColor: 'rgba(233,78,101,0.1)' },
  catBtnText:     { fontSize: 11, fontWeight: 'bold', color: Colors.dark.textSecondary },
  catBtnTextActive: { color: Colors.dark.primary },
  checkRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three, marginTop: Spacing.four },
  checkbox:       { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: Colors.dark.textSecondary, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: Colors.dark.primary, borderColor: Colors.dark.primary },
  checkLabel:     { flex: 1, fontSize: 12, color: Colors.dark.textSecondary, lineHeight: 18 },
  submitBtn:      { height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.five },
  submitBtnText:  { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
});
