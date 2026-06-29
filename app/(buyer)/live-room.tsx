import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image, Dimensions, Modal,
  NativeSyntheticEvent, NativeScrollEvent, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authStore } from '@/lib/store/authStore';
import { subastasApi, ItemActual } from '@/lib/api/subastas.api';
import { puedeParticipar, CATEGORIA_COLOR } from '@/lib/utils/categoria';
import CategoryInfoModal from '@/components/CategoryInfoModal';
import { BASE_URL } from '@/lib/api/apiClient';

const { width: SCREEN_W } = Dimensions.get('window');
const POLL_MS = 3000;

// Imágenes placeholder hasta que se implemente el upload por item
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
];

function Carousel({ images }: { images: string[] }) {
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newPage = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setPage(newPage);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.carouselImage} />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.dotsRow}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function LiveRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const subastaId        = Number(params.id ?? 0);
  const auctionName      = params.name      ? String(params.name)      : 'Subasta';
  const categoriaSubasta = params.categoria ? String(params.categoria) : 'comun';

  const [userCategoria, setUserCategoria] = useState<string | undefined>(undefined);
  const [showCatModal, setShowCatModal]   = useState(false);

  const [loading, setLoading]             = useState(true);
  const [joining, setJoining]             = useState(false);
  const [joinError, setJoinError]         = useState<string | null>(null);
  const [numeropostor, setNumeropostor]   = useState<number | null>(null);
  const [puedePublicar, setPuedePublicar] = useState(false);

  const [subastaEstado, setSubastaEstado] = useState<string>('abierta');
  const [totalItems, setTotalItems]       = useState(0);
  const [itemActual, setItemActual]       = useState<ItemActual | null>(null);
  const [timeLeft, setTimeLeft]           = useState<number | null>(null);

  const [bidValue, setBidValue] = useState('');
  const [pujando, setPujando]   = useState(false);
  const [winInfo, setWinInfo]   = useState<{ titulo: string; importe: number } | null>(null);

  const pollingRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevItemId    = useRef<number | null>(null);
  const prevItemPujos = useRef<{ numPostor: number; importe: number; ganador: boolean }[]>([]);
  const bloqueado     = userCategoria !== undefined && !puedeParticipar(userCategoria, categoriaSubasta);

  useEffect(() => {
    authStore.get().then(s => setUserCategoria(s?.categoria));
  }, []);

  useEffect(() => {
    if (!subastaId) return;
    setJoining(true);
    subastasApi.unirse(subastaId).then(res => {
      if (res.error) setJoinError(res.error);
      else if (res.data) {
        setNumeropostor(res.data.numeropostor);
        setPuedePublicar(res.data.puedePublicar);
      }
      setJoining(false);
    });
  }, [subastaId]);

  const fetchEstado = useCallback(async () => {
    if (!subastaId) return;
    const res = await subastasApi.estado(subastaId);
    if (res.data) {
      setSubastaEstado(res.data.estado);
      setTotalItems(res.data.totalItems);

      const newItemId = res.data.itemActual?.itemId ?? null;
      if (newItemId !== prevItemId.current) {
        // Detectar si ganamos el item anterior
        if (prevItemId.current !== null && numeropostor !== null) {
          const myWin = prevItemPujos.current.find(
            p => p.numPostor === numeropostor && p.ganador
          );
          if (myWin) {
            const titulo = itemActual?.descripcion ?? 'Artículo';
            setWinInfo({ titulo, importe: myWin.importe });
          }
        }
        setBidValue('');
        prevItemId.current = newItemId;
      }
      prevItemPujos.current = res.data.itemActual?.pujos ?? [];
      setItemActual(res.data.itemActual);

      if (res.data.itemActual && res.data.itemActual.tiempoRestante !== undefined) {
        setTimeLeft(res.data.itemActual.tiempoRestante);
      } else {
        setTimeLeft(null);
      }
    }
    setLoading(false);
  }, [subastaId]);

  useEffect(() => {
    fetchEstado();
    pollingRef.current = setInterval(fetchEstado, POLL_MS);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchEstado]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const categoriaEsSinLimites = ['oro', 'platino'].includes(categoriaSubasta.toLowerCase());
  const base    = itemActual?.precioBase ?? 0;
  const mejor   = itemActual?.mejorOferta;
  const minPuja = mejor != null ? mejor + base * 0.01 : base;
  const maxPuja = mejor != null ? mejor + base * 0.20 : base * 1.20;

  const handlePlaceBid = async () => {
    if (!itemActual) return;
    const num = parseFloat(bidValue.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { Alert.alert('Error', 'Ingresá un monto válido.'); return; }

    setPujando(true);
    const res = await subastasApi.pujar(subastaId, itemActual.itemId, num);
    setPujando(false);

    if (res.error) { Alert.alert('Puja rechazada', res.error); return; }
    setBidValue('');
    fetchEstado();
  };

  // ── Error join ─────────────────────────────────────────────────────────────
  if (joinError) {
    return (
      <SafeAreaView style={styles.container}>
        <SimpleHeader title={auctionName} onBack={() => router.back()} />
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={52} color="#F59E0B" />
          <Text style={styles.statusTitle}>No se puede unir</Text>
          <Text style={styles.statusMsg}>{joinError}</Text>
          <TouchableOpacity style={styles.pill} onPress={() => router.back()}>
            <Text style={styles.pillText}>VOLVER</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || joining) {
    return (
      <SafeAreaView style={styles.container}>
        <SimpleHeader title={auctionName} onBack={() => router.back()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <Text style={styles.statusMsg}>{joining ? 'Uniéndose a la subasta...' : 'Cargando...'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Subasta finalizada ─────────────────────────────────────────────────────
  if (!itemActual) {
    return (
      <SafeAreaView style={styles.container}>
        <SimpleHeader title={auctionName} onBack={() => router.back()} />
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle" size={52} color={Colors.dark.success} />
          <Text style={styles.statusTitle}>Subasta finalizada</Text>
          <Text style={styles.statusMsg}>Todos los ítems fueron subastados.</Text>
          <TouchableOpacity style={styles.pill} onPress={() => router.back()}>
            <Text style={styles.pillText}>VOLVER</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Vista principal ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <SimpleHeader
        title={auctionName}
        onBack={() => router.back()}
        right={
          numeropostor !== null ? (
            <View style={styles.postorBadge}>
              <Text style={styles.postorText}>Postor #{numeropostor}</Text>
            </View>
          ) : undefined
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Carrusel de imágenes */}
        <Carousel
          images={
            (itemActual?.imagenes && itemActual.imagenes.length > 0)
              ? itemActual.imagenes.map(img => img.startsWith('http') ? img : `${BASE_URL}${img}`)
              : PLACEHOLDER_IMAGES
          }
        />

        {/* Título e info del ítem */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {itemActual.descripcion || `Ítem #${itemActual.itemId}`}
          </Text>
          {!!itemActual.detalleDescripcion && (
            <Text style={styles.itemDescription} numberOfLines={3}>
              {itemActual.detalleDescripcion}
            </Text>
          )}
          <Text style={styles.itemMeta}>
            Pieza {itemActual.numero} de {totalItems}
          </Text>
        </View>

        {/* Temporizador de cuenta regresiva */}
        {timeLeft !== null && (
          <View style={[styles.timerBox, timeLeft <= 15 && styles.timerBoxUrgent]}>
            <Ionicons name="time-outline" size={20} color={timeLeft <= 15 ? '#EF4444' : '#FFD700'} />
            <Text style={[styles.timerText, timeLeft <= 15 && styles.timerTextUrgent]}>
              {timeLeft > 0 
                ? `Cierre en: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                : '¡VENDIDO! Procesando...'}
            </Text>
          </View>
        )}

        {/* Precios */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>MEJOR OFERTA</Text>
            <Text style={styles.bestBid}>
              {itemActual.mejorOferta != null
                ? `$ ${itemActual.mejorOferta.toLocaleString('es-AR')}`
                : 'Sin ofertas'}
            </Text>
            {!categoriaEsSinLimites && (
              <Text style={styles.limitText}>
                Puja mín: ${Math.ceil(minPuja).toLocaleString('es-AR')} — máx: ${Math.ceil(maxPuja).toLocaleString('es-AR')}
              </Text>
            )}
          </View>
          <View style={styles.basePriceBox}>
            <Text style={styles.priceLabel}>BASE</Text>
            <Text style={styles.baseAmount}>$ {base.toLocaleString('es-AR')}</Text>
          </View>
        </View>

        {/* Zona de puja */}
        {bloqueado ? (
          <TouchableOpacity style={styles.alertBox} onPress={() => setShowCatModal(true)} activeOpacity={0.85}>
            <Ionicons name="lock-closed" size={22} color="#EF4444" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>CATEGORÍA INSUFICIENTE</Text>
              <Text style={styles.alertMsg}>
                Esta subasta requiere categoría{' '}
                <Text style={{ color: CATEGORIA_COLOR[categoriaSubasta] ?? '#fff', fontWeight: 'bold' }}>
                  {categoriaSubasta.toUpperCase()}
                </Text>
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        ) : !puedePublicar ? (
          <TouchableOpacity
            style={[styles.alertBox, { borderColor: 'rgba(245,158,11,0.4)', backgroundColor: 'rgba(245,158,11,0.07)' }]}
            onPress={() => router.push('/(profile)/payments')}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={22} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: '#F59E0B' }]}>SIN MEDIO DE PAGO</Text>
              <Text style={styles.alertMsg}>Registrá un medio de pago para pujar</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        ) : subastaEstado !== 'abierta' ? (
          <View style={styles.closedBox}>
            <Text style={styles.alertMsg}>La subasta está cerrada</Text>
          </View>
        ) : (
          <View style={styles.bidRow}>
            <TextInput
              style={styles.bidInput}
              placeholder={`$ ${Math.ceil(minPuja).toLocaleString('es-AR')}`}
              placeholderTextColor={Colors.dark.textSecondary}
              keyboardType="numeric"
              value={bidValue}
              onChangeText={setBidValue}
              editable={!pujando}
            />
            <TouchableOpacity
              style={[styles.bidBtn, pujando && { opacity: 0.6 }]}
              onPress={handlePlaceBid}
              disabled={pujando}
            >
              {pujando
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.bidBtnText}>PUJAR</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Últimas ofertas */}
        {itemActual.pujos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ÚLTIMAS OFERTAS</Text>
            <View style={styles.bidList}>
              {itemActual.pujos.map((p, idx) => {
                const esYo = p.numPostor === numeropostor;
                const isLast = idx === itemActual.pujos.length - 1;
                return (
                  <View key={idx} style={[styles.bidRow2, !isLast && styles.bidSep]}>
                    <View style={styles.bidderLeft}>
                      {esYo && <View style={styles.dot2} />}
                      <Text style={[styles.bidderName, esYo && styles.meText]}>
                        {esYo ? 'Vos' : `postor_${p.numPostor}`}
                      </Text>
                    </View>
                    <Text style={[styles.bidAmount, esYo && styles.meText]}>
                      ${p.importe.toLocaleString('es-AR')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* VER EN VIVO */}
        <TouchableOpacity style={styles.liveBtn}>
          <Text style={styles.liveBtnText}>VER EN VIVO</Text>
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>

      {showCatModal && userCategoria && (
        <CategoryInfoModal
          categoria={userCategoria}
          visible={showCatModal}
          onClose={() => setShowCatModal(false)}
        />
      )}

      {/* Popup de victoria */}
      <Modal visible={winInfo !== null} transparent animationType="fade">
        <View style={styles.winBackdrop}>
          <View style={styles.winCard}>
            <Ionicons name="trophy" size={52} color="#FFD700" />
            <Text style={styles.winTitle}>¡Ganaste!</Text>
            <Text style={styles.winItemName}>{winInfo?.titulo}</Text>
            <Text style={styles.winImporte}>${winInfo?.importe.toLocaleString('es-AR')}</Text>
            <Text style={styles.winNote}>
              Tenés 72 horas para completar el pago desde tu perfil.
            </Text>
            <TouchableOpacity style={styles.winBtn} onPress={() => setWinInfo(null)}>
              <Text style={styles.winBtnText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SimpleHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={{ marginRight: Spacing.three }}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.dark.background },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.five, gap: 16 },
  statusTitle:   { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  statusMsg:     { fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 20 },
  pill:          { backgroundColor: Colors.dark.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  pillText:      { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: '#0F182F' },
  headerTitle:   { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
  postorBadge:   { backgroundColor: Colors.dark.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  postorText:    { fontSize: 11, fontWeight: 'bold', color: '#fff' },

  scrollContent: { paddingBottom: 40 },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    backgroundColor: '#121625',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  timerBoxUrgent: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: '#EF4444',
  },
  timerText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: 'bold',
  },
  timerTextUrgent: {
    color: '#EF4444',
  },

  // Carrusel
  carouselImage: { width: SCREEN_W, height: 240, resizeMode: 'cover' },
  dotsRow:       { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: Colors.dark.background },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.backgroundElement },
  dotActive:     { backgroundColor: '#fff', width: 18 },

  // Info item
  itemInfo:        { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  itemTitle:       { fontSize: 20, fontWeight: 'bold', color: '#fff', lineHeight: 26 },
  itemDescription: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 6, lineHeight: 18 },
  itemMeta:        { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4 },

  // Precios
  priceRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.four, marginTop: Spacing.two },
  priceLabel:    { fontSize: 11, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1, marginBottom: 2 },
  bestBid:       { fontSize: 28, fontWeight: 'bold', color: '#FFD700' },
  limitText:     { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 4 },
  basePriceBox:  { alignItems: 'flex-end' },
  baseAmount:    { fontSize: 22, fontWeight: 'bold', color: '#fff' },

  // Zona de puja
  bidRow:        { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.four, marginVertical: Spacing.four, gap: Spacing.three },
  bidInput:      { flex: 2, height: 52, backgroundColor: Colors.dark.backgroundElement, borderRadius: 10, paddingHorizontal: Spacing.three, color: '#fff', fontSize: 16, fontWeight: '600' },
  bidBtn:        { flex: 1.3, height: 52, backgroundColor: Colors.dark.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bidBtnText:    { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },

  // Alertas
  alertBox:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: Spacing.four, marginVertical: Spacing.three, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: Spacing.three },
  alertTitle:    { fontSize: 12, fontWeight: 'bold', color: '#EF4444', letterSpacing: 1 },
  alertMsg:      { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 2 },
  closedBox:     { marginHorizontal: Spacing.four, marginVertical: Spacing.three, padding: Spacing.three, backgroundColor: Colors.dark.backgroundElement, borderRadius: 10, alignItems: 'center' },

  // Historial
  section:       { marginHorizontal: Spacing.four, marginTop: Spacing.three },
  sectionTitle:  { fontSize: 11, fontWeight: 'bold', color: Colors.dark.textSecondary, letterSpacing: 1.5, marginBottom: Spacing.two },
  bidList:       { backgroundColor: Colors.dark.backgroundElement, borderRadius: 12, paddingHorizontal: Spacing.three },
  bidRow2:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  bidSep:        { borderBottomWidth: 1, borderBottomColor: '#1E2A45' },
  bidderLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot2:          { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.success },
  bidderName:    { fontSize: 14, color: Colors.dark.textSecondary },
  bidAmount:     { fontSize: 14, fontWeight: '600', color: '#FFD700' },
  meText:        { color: Colors.dark.success, fontWeight: 'bold' },

  // VER EN VIVO
  liveBtn:       { marginHorizontal: Spacing.four, marginTop: 24, height: 52, backgroundColor: Colors.dark.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  liveBtnText:   { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },

  // Popup de victoria
  winBackdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: Spacing.five },
  winCard:       { width: '100%', backgroundColor: Colors.dark.backgroundElement, borderRadius: 24, padding: Spacing.five, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  winTitle:      { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },
  winItemName:   { fontSize: 16, color: '#fff', textAlign: 'center', fontWeight: '600' },
  winImporte:    { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  winNote:       { fontSize: 13, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 20 },
  winBtn:        { marginTop: 8, width: '100%', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  winBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
});
