import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { subastasApi, SubastaResumen } from '@/lib/api/subastas.api';
import { authStore } from '@/lib/store/authStore';
import { MOCK_SUBASTAS } from '@/lib/mock/mockData';

const CATEGORIA_COLOR: Record<string, string> = {
  platino: '#A0522D',
  oro:     '#B8860B',
  plata:   '#708090',
  especial:'#6A0DAD',
  comun:   '#1A3A5C',
};

const CATEGORIA_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  platino: 'diamond-outline',
  oro:     'car-sport-outline',
  plata:   'color-palette-outline',
  especial:'star-outline',
  comun:   'pricetag-outline',
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const TIPO_BADGE: Record<string, { label: string; color: string; textColor: string }> = {
  en_vivo: { label: 'EN VIVO',  color: '#16A34A', textColor: '#FFF' },
  proxima: { label: 'PRÓXIMA',  color: '#2563EB', textColor: '#FFF' },
  cerrada: { label: 'CERRADA',  color: '#555',    textColor: '#FFF' },
};

function AuctionCard({ s, onPress }: { s: SubastaResumen; onPress?: () => void }) {
  const badge = TIPO_BADGE[s.tipo];
  const isCerrada = s.tipo === 'cerrada';
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={[styles.card, isCerrada && { opacity: 0.55 }]} onPress={onPress}>
      <View style={[styles.cardBanner, { backgroundColor: isCerrada ? '#2A2A3A' : (CATEGORIA_COLOR[s.categoria] ?? '#1A3A5C') }]}>
        <Ionicons name={CATEGORIA_ICON[s.categoria] ?? 'pricetag-outline'} size={36} color="rgba(255,255,255,0.35)" />
        <View style={[styles.tipoBadge, { backgroundColor: badge.color }]}>
          <Text style={[styles.tipoBadgeText, { color: badge.textColor }]}>{badge.label}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{s.descripcion || `Subasta #${s.id}`}</Text>
        <Text style={styles.cardSubtitle}>{s.totalItems} ítems · Cat. {(s.categoria ?? '').toUpperCase()}</Text>
        <View style={styles.cardFooter}>
          {!isCerrada && <Text style={styles.cardPrice}>desde {formatPrice(s.precioBaseMinimo)}</Text>}
          <Text style={styles.cardDate}>{s.fecha}  {s.hora?.slice(0, 5)}</Text>
        </View>
      </View>
    </Wrapper>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [subastas, setSubastas] = useState<SubastaResumen[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery]       = useState('');
  const [nombre, setNombre]     = useState('');
  const [categoria, setCategoria] = useState('');

  const load = useCallback(async () => {
    const sesion = await authStore.get();
    if (sesion) {
      setNombre(sesion.nombre?.split(' ')[0] ?? '');
      setCategoria(sesion.categoria ?? '');
    }

    if (authStore.isPrueba(sesion)) {
      setSubastas(MOCK_SUBASTAS);
    } else {
      const res = await subastasApi.listar();
      setSubastas(res.data ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = subastas.filter(s =>
    !query.trim() ||
    s.descripcion.toLowerCase().includes(query.toLowerCase()) ||
    s.categoria.toLowerCase().includes(query.toLowerCase())
  );

  const enVivo  = filtered.filter(s => s.tipo === 'en_vivo');
  const proximas = filtered.filter(s => s.tipo === 'proxima');
  const cerradas = filtered.filter(s => s.tipo === 'cerrada');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Bienvenido,</Text>
          <Text style={styles.userName}>{nombre || 'Usuario'}</Text>
        </View>
        {categoria ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoria.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.searchSection}>
        <Ionicons name="search-outline" size={20} color={Colors.dark.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar subastas..."
          placeholderTextColor={Colors.dark.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.dark.primary}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Colors.dark.textSecondary} />
              <Text style={styles.emptyText}>Sin resultados</Text>
            </View>
          ) : (
            <>
              {/* EN VIVO */}
              {enVivo.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>EN VIVO</Text>
                  {enVivo.map(s => <AuctionCard key={s.id} s={s} onPress={() => router.push({ pathname: '/(buyer)/live-room', params: { id: s.id, name: s.descripcion } })} />)}
                </>
              )}

              {/* PRÓXIMAS */}
              {proximas.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, enVivo.length > 0 && { marginTop: Spacing.four }]}>PRÓXIMAS</Text>
                  {proximas.map(s => <AuctionCard key={s.id} s={s} onPress={() => router.push({ pathname: '/(buyer)/live-room', params: { id: s.id, name: s.descripcion } })} />)}
                </>
              )}

              {/* CERRADAS */}
              {cerradas.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: Spacing.four }]}>CERRADAS</Text>
                  {cerradas.map(s => <AuctionCard key={s.id} s={s} />)}
                </>
              )}
            </>
          )}
        </ScrollView>
      )}

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/dashboard')}>
          <Ionicons name="home" size={24} color={Colors.dark.primary} />
          <Text style={[styles.navText, { color: Colors.dark.primary }]}>INICIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(profile)/metrics')}>
          <Ionicons name="time-outline" size={24} color={Colors.dark.textSecondary} />
          <Text style={styles.navText}>HISTORIAL</Text>
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
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: '#0F182F',
  },
  welcomeLabel: { fontSize: 12, color: Colors.dark.textSecondary },
  userName:     { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  categoryBadge: { backgroundColor: '#A2B0C4', paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 16 },
  categoryBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#111625' },
  searchSection: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    marginHorizontal: Spacing.four, marginVertical: Spacing.three,
    borderRadius: 8, paddingHorizontal: Spacing.three, height: 44,
  },
  searchInput: { flex: 1, color: Colors.dark.text, fontSize: 14 },
  scrollContent: { paddingHorizontal: Spacing.four, paddingBottom: 90 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: Spacing.two },
  emptyText: { fontSize: 15, color: Colors.dark.textSecondary },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: Colors.dark.textSecondary, letterSpacing: 1.5, marginBottom: Spacing.two },
  card: { backgroundColor: Colors.dark.backgroundElement, borderRadius: 12, overflow: 'hidden', marginBottom: Spacing.three },
  cardBanner: { height: 110, alignItems: 'center', justifyContent: 'center' },
  tipoBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tipoBadgeText: { fontSize: 10, fontWeight: 'bold' },
  cardInfo: { padding: Spacing.three, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  cardSubtitle: { fontSize: 12, color: Colors.dark.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  cardDate:  { fontSize: 12, color: Colors.dark.textSecondary },
  navBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 64,
    backgroundColor: '#0C111F', flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#171B30',
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: 'bold', color: Colors.dark.textSecondary, marginTop: 4 },
});
