import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { subastasApi, ResultadoSubasta } from '@/lib/api/subastas.api';

// Imágenes por categoría de subasta
const IMAGES_BY_CATEGORIA: Record<string, string[]> = {
  plata: [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=800&auto=format&fit=crop',
  ],
  oro: [
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=800&auto=format&fit=crop',
  ],
  comun: [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
  ],
  especial: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
  ],
  platino: [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
  ],
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
];

const STATUS_COLOR: Record<string, string> = {
  GANADA:    Colors.dark.success,
  'PARTICIPÓ': Colors.dark.textSecondary,
  CERRADA:   '#555',
};

function formatMoney(n: number) {
  return '$ ' + n.toLocaleString('es-AR');
}

function formatFecha(fecha: string) {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export default function ClosedAuctionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resultado, setResultado] = useState<ResultadoSubasta | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    subastasApi.resultado(Number(id)).then(res => {
      if (res.data) setResultado(res.data);
      else setError(res.error ?? 'Error al cargar la subasta');
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de subasta</Text>
        </View>
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (error || !resultado) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de subasta</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.dark.textSecondary }}>{error ?? 'Sin datos'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = IMAGES_BY_CATEGORIA[resultado.categoria] ?? DEFAULT_IMAGES;
  const statusColor = STATUS_COLOR[resultado.estado] ?? Colors.dark.textSecondary;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{resultado.descripcion}</Text>
        <View style={[styles.closedBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.closedBadgeText, { color: statusColor }]}>{resultado.estado}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Imágenes */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow} contentContainerStyle={styles.imagesContent}>
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.productImage} />
          ))}
        </ScrollView>

        {/* Resultado */}
        <View style={styles.resultRow}>
          <View style={styles.resultCol}>
            <Text style={styles.resultLabel}>FECHA</Text>
            <Text style={[styles.resultValue, { fontSize: 16 }]}>{formatFecha(resultado.fecha)}</Text>
          </View>
          {resultado.miImporte != null && (
            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>MI OFERTA GANADORA</Text>
              <Text style={[styles.resultValue, { color: statusColor }]}>{formatMoney(resultado.miImporte)}</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>{resultado.estado}</Text>
          </View>
          <Text style={styles.metaText}>Cat. {resultado.categoria.toUpperCase()}</Text>
        </View>

        {/* Historial de pujas */}
        <View style={styles.bidsSection}>
          <Text style={styles.bidsTitle}>HISTORIAL DE PUJAS</Text>
          {resultado.pujos.length === 0 ? (
            <Text style={styles.emptyBids}>Sin pujas registradas.</Text>
          ) : (
            <View style={styles.bidsList}>
              {resultado.pujos.map((puja, i) => (
                <View key={i} style={[styles.bidItem, i === resultado.pujos.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.bidderRow}>
                    {puja.esYo && <View style={styles.myDot} />}
                    {puja.ganador && <Ionicons name="trophy" size={14} color="#FFD700" style={{ marginRight: 4 }} />}
                    <Text style={[styles.bidder, puja.esYo && { color: Colors.dark.success, fontWeight: '700' }]}>
                      {puja.numeropostor}
                    </Text>
                  </View>
                  <Text style={[styles.bidAmount, puja.esYo && { color: Colors.dark.success }]}>
                    {formatMoney(puja.importe)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.dark.background },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: '#0F182F', gap: Spacing.two },
  backButton:  { marginRight: Spacing.one },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  closedBadge: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: 8 },
  closedBadgeText: { fontSize: 10, fontWeight: 'bold' },
  scrollContent: { paddingBottom: Spacing.six },
  imagesRow:   { marginBottom: Spacing.four },
  imagesContent: { paddingHorizontal: Spacing.four, gap: Spacing.three, paddingVertical: Spacing.three },
  productImage: { width: 260, height: 180, borderRadius: 12, resizeMode: 'cover' },
  resultRow:   { flexDirection: 'row', paddingHorizontal: Spacing.four, gap: Spacing.three, marginBottom: Spacing.three },
  resultCol:   { flex: 1, backgroundColor: Colors.dark.backgroundElement, borderRadius: 12, padding: Spacing.three, gap: 4 },
  resultLabel: { fontSize: 10, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1 },
  resultValue: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  metaRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, gap: Spacing.two, marginBottom: Spacing.four },
  metaText:    { fontSize: 13, color: Colors.dark.textSecondary },
  statusPill:  { paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { fontSize: 11, fontWeight: 'bold' },
  bidsSection: { marginHorizontal: Spacing.four },
  bidsTitle:   { fontSize: 12, fontWeight: 'bold', color: Colors.dark.textSecondary, letterSpacing: 1.5, marginBottom: Spacing.two },
  emptyBids:   { fontSize: 13, color: Colors.dark.textSecondary, textAlign: 'center', paddingVertical: Spacing.four },
  bidsList:    { backgroundColor: Colors.dark.backgroundElement, borderRadius: 12, paddingHorizontal: Spacing.three },
  bidItem:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three, borderBottomWidth: 1, borderBottomColor: '#242F50' },
  bidderRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  myDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.success },
  bidder:      { fontSize: 14, color: Colors.dark.textSecondary },
  bidAmount:   { fontSize: 14, fontWeight: '600', color: Colors.dark.text },
});
