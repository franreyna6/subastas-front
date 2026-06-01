import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface AuctionHistory {
  id: string;
  name: string;
  date: string;
  status: 'GANADA' | 'PARTICIPÓ' | 'PERDIDA';
  finalPrice: string;
  myBid: string;
  image: string;
}

const HISTORY: AuctionHistory[] = [
  {
    id: '1',
    name: 'Colección Arte Moderno',
    date: '27/05/2026',
    status: 'GANADA',
    finalPrice: '$ 125.000',
    myBid: '$ 125.000',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Autos Clásicos',
    date: '15/05/2026',
    status: 'PARTICIPÓ',
    finalPrice: '$ 320.000',
    myBid: '$ 300.000',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Relojes Vintage',
    date: '02/05/2026',
    status: 'PARTICIPÓ',
    finalPrice: '$ 98.000',
    myBid: '$ 90.000',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Joyas de Época',
    date: '18/04/2026',
    status: 'PERDIDA',
    finalPrice: '$ 210.000',
    myBid: '$ 195.000',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Mobiliario Antiguo',
    date: '05/04/2026',
    status: 'GANADA',
    finalPrice: '$ 67.000',
    myBid: '$ 67.000',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '6',
    name: 'Esculturas Contemporáneas',
    date: '22/03/2026',
    status: 'PARTICIPÓ',
    finalPrice: '$ 450.000',
    myBid: '$ 420.000',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '7',
    name: 'Fotografía Documental',
    date: '10/03/2026',
    status: 'PERDIDA',
    finalPrice: '$ 55.000',
    myBid: '$ 48.000',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '8',
    name: 'Instrumentos Musicales',
    date: '28/02/2026',
    status: 'GANADA',
    finalPrice: '$ 82.000',
    myBid: '$ 82.000',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '9',
    name: 'Numismática Clásica',
    date: '14/02/2026',
    status: 'PARTICIPÓ',
    finalPrice: '$ 33.000',
    myBid: '$ 29.000',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
  },
];

const PAGE_SIZE = 6;

type Filter = 'TODAS' | 'GANADA' | 'PERDIDA' | 'PARTICIPÓ';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Todas', value: 'TODAS' },
  { label: 'Ganadas', value: 'GANADA' },
  { label: 'Perdidas', value: 'PERDIDA' },
  { label: 'Participó', value: 'PARTICIPÓ' },
];

const STATUS_COLOR: Record<AuctionHistory['status'], string> = {
  GANADA: Colors.dark.success,
  PARTICIPÓ: Colors.dark.textSecondary,
  PERDIDA: Colors.dark.primary,
};

function parseBid(bid: string): number {
  return parseInt(bid.replace(/[^0-9]/g, ''), 10) || 0;
}

function formatTotal(amount: number): string {
  return '$ ' + amount.toLocaleString('es-AR');
}

export default function MetricsScreen() {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeFilter, setActiveFilter] = useState<Filter>('TODAS');

  const filteredHistory = activeFilter === 'TODAS'
    ? HISTORY
    : HISTORY.filter(item => item.status === activeFilter);

  const visibleHistory = filteredHistory.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHistory.length;

  const totalBid = useMemo(
    () => HISTORY.reduce((sum, item) => sum + parseBid(item.myBid), 0),
    [],
  );

  const handleFilter = (f: Filter) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Métricas e Historial</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Resumen */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen Financiero</Text>
          <Text style={styles.totalAmount}>{formatTotal(totalBid)}</Text>
          <Text style={styles.summarySubtitle}>Monto Total Ofertado en la Plataforma</Text>
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

          {visibleHistory.length === 0 && (
            <Text style={styles.emptyFilter}>Sin subastas para este filtro.</Text>
          )}

          {visibleHistory.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyItem, index === visibleHistory.length - 1 && !hasMore && { borderBottomWidth: 0 }]}
              onPress={() => router.push({
                pathname: '/(buyer)/closed-auction',
                params: {
                  id: item.id,
                  name: item.name,
                  image: item.image,
                  finalPrice: item.finalPrice,
                  myBid: item.myBid,
                  status: item.status,
                  date: item.date,
                },
              })}
            >
              <View style={styles.historyLeft}>
                <Text style={styles.historyItemName}>{item.name}</Text>
                <Text style={styles.historyItemDate}>{item.date}</Text>
                <Text style={styles.historyItemBid}>
                  {'Mi oferta: '}
                  <Text style={styles.historyItemBidValue}>{item.myBid}</Text>
                </Text>
              </View>
              <View style={styles.historyRight}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.dark.textSecondary} style={styles.chevron} />
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
        </View>
      </ScrollView>

      {/* Barra de Navegación */}
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
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#0F182F',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: 100,
  },
  summaryBox: {
    backgroundColor: '#0F182F',
    padding: Spacing.five,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  summarySubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 16,
    padding: Spacing.four,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#242F50',
  },
  historyLeft: {
    flex: 1,
    gap: 3,
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyItemDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  historyItemBid: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  historyItemBidValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 2,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#242F50',
  },
  filterChipActive: {
    backgroundColor: Colors.dark.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyFilter: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: '#242F50',
    marginTop: Spacing.one,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#0C111F',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#171B30',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
});
