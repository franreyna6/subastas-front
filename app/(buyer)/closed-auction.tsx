import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

const IMAGES = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
];

const BIDS_BY_AUCTION: Record<string, { bidder: string; amount: string; isMe: boolean }[]> = {
  '1': [
    { bidder: 'Vos', amount: '$ 125.000', isMe: true },
    { bidder: 'postor_42', amount: '$ 123.000', isMe: false },
    { bidder: 'maría_v', amount: '$ 120.000', isMe: false },
    { bidder: 'coleccionista99', amount: '$ 115.000', isMe: false },
    { bidder: 'Vos', amount: '$ 112.000', isMe: true },
  ],
  '2': [
    { bidder: 'auto_fan_01', amount: '$ 320.000', isMe: false },
    { bidder: 'Vos', amount: '$ 300.000', isMe: true },
    { bidder: 'auto_fan_01', amount: '$ 285.000', isMe: false },
    { bidder: 'Vos', amount: '$ 270.000', isMe: true },
    { bidder: 'rueda_libre', amount: '$ 260.000', isMe: false },
  ],
  '3': [
    { bidder: 'reloj_lover', amount: '$ 98.000', isMe: false },
    { bidder: 'Vos', amount: '$ 90.000', isMe: true },
    { bidder: 'reloj_lover', amount: '$ 85.000', isMe: false },
    { bidder: 'Vos', amount: '$ 80.000', isMe: true },
    { bidder: 'tiempo_libre', amount: '$ 75.000', isMe: false },
  ],
  '4': [
    { bidder: 'joya_queen', amount: '$ 210.000', isMe: false },
    { bidder: 'Vos', amount: '$ 195.000', isMe: true },
    { bidder: 'joya_queen', amount: '$ 180.000', isMe: false },
    { bidder: 'Vos', amount: '$ 165.000', isMe: true },
  ],
  '5': [
    { bidder: 'Vos', amount: '$ 67.000', isMe: true },
    { bidder: 'mueble_fino', amount: '$ 65.000', isMe: false },
    { bidder: 'Vos', amount: '$ 60.000', isMe: true },
    { bidder: 'mueble_fino', amount: '$ 55.000', isMe: false },
  ],
  '6': [
    { bidder: 'arte_ba', amount: '$ 450.000', isMe: false },
    { bidder: 'Vos', amount: '$ 420.000', isMe: true },
    { bidder: 'arte_ba', amount: '$ 400.000', isMe: false },
    { bidder: 'Vos', amount: '$ 380.000', isMe: true },
    { bidder: 'escultor_x', amount: '$ 360.000', isMe: false },
  ],
};

const STATUS_COLOR: Record<string, string> = {
  GANADA: Colors.dark.success,
  PARTICIPÓ: Colors.dark.textSecondary,
  PERDIDA: Colors.dark.primary,
};

export default function ClosedAuctionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    image: string;
    finalPrice: string;
    myBid: string;
    status: string;
    date: string;
  }>();

  const bids = BIDS_BY_AUCTION[params.id] ?? [];
  const images = [params.image, IMAGES[(parseInt(params.id) % IMAGES.length)], IMAGES[((parseInt(params.id) + 1) % IMAGES.length)]];
  const statusColor = STATUS_COLOR[params.status] ?? Colors.dark.textSecondary;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{params.name}</Text>
        <View style={[styles.closedBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.closedBadgeText, { color: statusColor }]}>CERRADA</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Imágenes del producto */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow} contentContainerStyle={styles.imagesContent}>
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.productImage} />
          ))}
        </ScrollView>

        {/* Resultado */}
        <View style={styles.resultRow}>
          <View style={styles.resultCol}>
            <Text style={styles.resultLabel}>PRECIO FINAL</Text>
            <Text style={styles.resultValue}>{params.finalPrice}</Text>
          </View>
          <View style={styles.resultCol}>
            <Text style={styles.resultLabel}>MI ÚLTIMA OFERTA</Text>
            <Text style={[styles.resultValue, { color: statusColor }]}>{params.myBid}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.dark.textSecondary} />
          <Text style={styles.metaText}>{params.date}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>{params.status}</Text>
          </View>
        </View>

        {/* Historial de pujas */}
        <View style={styles.bidsSection}>
          <Text style={styles.bidsTitle}>HISTORIAL DE PUJAS</Text>
          <View style={styles.bidsList}>
            {bids.map((bid, i) => (
              <View key={i} style={[styles.bidItem, i === bids.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.bidderRow}>
                  {bid.isMe && <View style={styles.myDot} />}
                  <Text style={[styles.bidder, bid.isMe && { color: Colors.dark.success, fontWeight: '700' }]}>
                    {bid.bidder}
                  </Text>
                </View>
                <Text style={[styles.bidAmount, bid.isMe && { color: Colors.dark.success }]}>
                  {bid.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#0F182F',
    gap: Spacing.two,
  },
  backButton: {
    marginRight: Spacing.one,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closedBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  imagesRow: {
    marginBottom: Spacing.four,
  },
  imagesContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  productImage: {
    width: 260,
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  resultRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  resultCol: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    padding: Spacing.three,
    gap: 4,
  },
  resultLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
  metaText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    flex: 1,
    marginLeft: 4,
  },
  statusPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  bidsSection: {
    marginHorizontal: Spacing.four,
  },
  bidsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.two,
  },
  bidsList: {
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#242F50',
  },
  bidderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  myDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.success,
  },
  bidder: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  bidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
});
