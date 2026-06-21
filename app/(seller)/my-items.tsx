import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Alert, Modal, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform, RefreshControl, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [fotosBase64, setFotosBase64]       = useState<string[]>([]);

  // Seguro Modal
  const [isSeguroModalOpen, setIsSeguroModalOpen] = useState(false);
  const [selectedItemIdForSeguro, setSelectedItemIdForSeguro] = useState<number | null>(null);
  const [nuevoImporteSeguro, setNuevoImporteSeguro] = useState('');

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
    setSelectedImages([]);
    setFotosBase64([]);
  };

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6 - selectedImages.length,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      const newBase64s = result.assets.map(asset => asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : '');
      
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 6));
      setFotosBase64(prev => [...prev, ...newBase64s].slice(0, 6));
    }
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para sacar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newImage = asset.uri;
      const newBase64 = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : '';
      
      setSelectedImages(prev => [...prev, newImage].slice(0, 6));
      setFotosBase64(prev => [...prev, newBase64].slice(0, 6));
    }
  };

  const handleAddPhoto = () => {
    if (selectedImages.length >= 6) {
      Alert.alert('Límite alcanzado', 'Podés subir un máximo de 6 fotos.');
      return;
    }

    Alert.alert(
      'Agregar foto',
      '¿De dónde querés obtener la foto del artículo?',
      [
        { text: 'Sacar foto (Cámara)', onPress: takePhotoWithCamera },
        { text: 'Elegir de Galería', onPress: pickImages },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
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
    if (selectedImages.length < 5 || selectedImages.length > 6) {
      Alert.alert('Error', 'Debés subir entre 5 y 6 fotos del artículo exactamente.');
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
      fotosBase64,
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

  const handleAumentarSeguro = async () => {
    if (selectedItemIdForSeguro === null) return;
    const value = parseFloat(nuevoImporteSeguro.replace(/[^0-9.]/g, ''));
    if (isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Ingresá un monto de póliza válido.');
      return;
    }

    setSubmitting(true);
    const res = await solicitudesApi.aumentarSeguro(selectedItemIdForSeguro, value);
    setSubmitting(false);

    if (res.error) {
      Alert.alert('Error', res.error);
      return;
    }

    setIsSeguroModalOpen(false);
    setNuevoImporteSeguro('');
    setSelectedItemIdForSeguro(null);
    Alert.alert('Póliza actualizada', 'El valor asegurado del bien fue aumentado correctamente.');
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

        {/* Ubicación del artículo (Logística) */}
        {item.estado !== 'pendiente' && item.estado !== 'rechazado_empresa' && item.ubicacion ? (
          <View style={styles.logisticaBox}>
            <Ionicons name="location-outline" size={16} color={Colors.dark.primary} />
            <Text style={styles.logisticaText} numberOfLines={2}>
              <Text style={{ fontWeight: 'bold', color: '#fff' }}>Ubicación: </Text>
              {item.ubicacion}
            </Text>
          </View>
        ) : null}

        {/* Seguro Contratado */}
        {item.seguro ? (
          <View style={styles.seguroBox}>
            <View style={styles.seguroHeader}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.dark.success} />
              <Text style={styles.seguroTitle}>SEGURO CONTRATADO</Text>
            </View>
            <Text style={styles.seguroText}>Póliza: {item.seguro.nropoliza} ({item.seguro.compania})</Text>
            <Text style={styles.seguroText}>Valor Asegurado: ${item.seguro.importe.toLocaleString('es-AR')}</Text>

            <TouchableOpacity
              style={styles.aumentarSeguroBtn}
              onPress={() => {
                setSelectedItemIdForSeguro(item.id);
                setNuevoImporteSeguro(item.seguro!.importe.toString());
                setIsSeguroModalOpen(true);
              }}
            >
              <Text style={styles.aumentarSeguroBtnText}>AUMENTAR VALOR DE LA PÓLIZA</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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

                <Text style={styles.inputLabel}>FOTOS DEL ARTÍCULO ({selectedImages.length} de 5 o 6 requeridas) *</Text>
                <View style={styles.imagesContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesScroll}>
                    {selectedImages.map((uri, idx) => (
                      <View key={idx} style={styles.imageThumbnailWrapper}>
                        <Image source={{ uri }} style={styles.imageThumbnail} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => {
                            setSelectedImages(prev => prev.filter((_, i) => i !== idx));
                            setFotosBase64(prev => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {selectedImages.length < 6 && (
                      <TouchableOpacity style={styles.addImageBtn} onPress={handleAddPhoto}>
                        <Ionicons name="camera-outline" size={24} color={Colors.dark.textSecondary} />
                        <Text style={styles.addImageText}>Agregar</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>

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

      {/* Modal Aumentar Seguro */}
      <Modal visible={isSeguroModalOpen} animationType="slide" transparent onRequestClose={() => setIsSeguroModalOpen(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Aumentar Cobertura del Seguro</Text>
                <TouchableOpacity onPress={() => setIsSeguroModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.hint}>
                Podés aumentar el valor de la póliza contratada. La diferencia del premio se cobrará utilizando tus medios de pago.
              </Text>

              <Text style={styles.inputLabel}>NUEVO VALOR ASEGURADO TOTAL ($) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 500000"
                placeholderTextColor={Colors.dark.textSecondary}
                keyboardType="numeric"
                value={nuevoImporteSeguro}
                onChangeText={setNuevoImporteSeguro}
              />

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleAumentarSeguro}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>CONFIRMAR Y PAGAR DIFERENCIA</Text>}
              </TouchableOpacity>
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
  imagesContainer: { marginVertical: Spacing.two },
  imagesScroll:    { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  imageThumbnailWrapper: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  imageThumbnail:  { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn:  { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addImageBtn:     { width: 80, height: 80, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.dark.textSecondary, justifyContent: 'center', alignItems: 'center', gap: 4 },
  addImageText:    { fontSize: 10, color: Colors.dark.textSecondary, fontWeight: 'bold' },
  logisticaBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#101626', padding: Spacing.three, borderRadius: 8, marginTop: 4 },
  logisticaText: { fontSize: 12, color: Colors.dark.textSecondary, flex: 1 },
  seguroBox: { backgroundColor: '#151C30', padding: Spacing.four, borderRadius: 10, gap: 6, marginTop: 8, borderWidth: 1, borderColor: '#233052' },
  seguroHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seguroTitle: { fontSize: 11, fontWeight: 'bold', color: Colors.dark.success, letterSpacing: 1 },
  seguroText: { fontSize: 13, color: '#fff' },
  aumentarSeguroBtn: { height: 36, backgroundColor: Colors.dark.primary, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  aumentarSeguroBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
});
