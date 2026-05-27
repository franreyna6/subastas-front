import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface Bid {
  id: string;
  bidder: string;
  amount: number;
  isMe: boolean;
}

export default function LiveRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const auctionName = params.name ? String(params.name) : 'Colección Arte Moderno';

  // Valores base y de ofertas
  const basePrice = 80000;
  const [highestBid, setHighestBid] = useState(125000);
  const [bidValue, setBidValue] = useState('');
  
  // Lista de ofertas iniciales
  const [bids, setBids] = useState<Bid[]>([
    { id: '1', bidder: 'Vos', amount: 125000, isMe: true },
    { id: '2', bidder: 'postor_42', amount: 123500, isMe: false },
    { id: '3', bidder: 'maría_v', amount: 121000, isMe: false },
  ]);

  // Límites según reglas de negocio (min +1% base, max +20% base)
  const minRequiredBid = highestBid + (basePrice * 0.01);
  const maxAllowedBid = highestBid + (basePrice * 0.20);

  const handlePlaceBid = () => {
    const numBid = parseFloat(bidValue.replace(/[^0-9.]/g, ''));
    
    if (isNaN(numBid)) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }

    if (numBid < minRequiredBid) {
      Alert.alert(
        'Oferta Inválida', 
        `La oferta mínima debe ser de $${minRequiredBid.toLocaleString()} (Oferta actual + 1% del valor base).`
      );
      return;
    }

    if (numBid > maxAllowedBid) {
      Alert.alert(
        'Oferta Excesiva', 
        `La oferta máxima permitida es de $${maxAllowedBid.toLocaleString()} (Oferta actual + 20% del valor base).`
      );
      return;
    }

    // Agregar nueva oferta
    const newBid: Bid = {
      id: Date.now().toString(),
      bidder: 'Vos',
      amount: numBid,
      isMe: true
    };

    setHighestBid(numBid);
    setBids([newBid, ...bids.map(b => b.bidder === 'Vos' ? { ...b, bidder: 'Vos (anterior)', isMe: false } : b)]);
    setBidValue('');
    Alert.alert('¡Éxito!', `Has ofertado $${numBid.toLocaleString()} correctamente.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {auctionName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Imagen del bien activo */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop' }} 
          style={styles.itemImage} 
        />

        {/* Título del artículo */}
        <View style={styles.detailsContainer}>
          <Text style={styles.itemTitle}>Óleo sobre tela - "Amanecer"</Text>
          <Text style={styles.itemMetadata}>Autor: J. Miralles - 1978 - Pieza 07 de 14</Text>
        </View>

        {/* Cajas de Precio */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>MEJOR OFERTA</Text>
            <Text style={styles.priceValue}>$ {highestBid.toLocaleString()}</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>BASE</Text>
            <Text style={[styles.priceValue, { color: '#FFFFFF' }]}>$ {basePrice.toLocaleString()}</Text>
          </View>
        </View>

        {/* Límites de oferta */}
        <Text style={styles.limitLabel}>
          Puja mín: ${minRequiredBid.toLocaleString()} - máx: ${maxAllowedBid.toLocaleString()}
        </Text>

        {/* Input de Puja */}
        <View style={styles.bidInputSection}>
          <TextInput
            style={styles.bidInput}
            placeholder={`$ ${(minRequiredBid).toFixed(0)}`}
            placeholderTextColor={Colors.dark.textSecondary}
            keyboardType="numeric"
            value={bidValue}
            onChangeText={setBidValue}
          />
          <TouchableOpacity style={styles.bidButton} onPress={handlePlaceBid}>
            <Text style={styles.bidButtonText}>PUJAR</Text>
          </TouchableOpacity>
        </View>

        {/* Historial de ofertas */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>ÚLTIMAS OFERTAS</Text>
          
          <View style={styles.bidsList}>
            {bids.map((bid) => (
              <View key={bid.id} style={styles.bidItem}>
                <View style={styles.bidderContainer}>
                  {bid.isMe && <View style={styles.myBidDot} />}
                  <Text style={[styles.bidderName, bid.isMe && styles.myBidText]}>
                    {bid.bidder}
                  </Text>
                </View>
                <Text style={[styles.bidAmount, bid.isMe && styles.myBidText]}>
                  ${bid.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botón Ver en vivo */}
        <TouchableOpacity style={styles.liveStreamButton}>
          <Text style={styles.liveStreamButtonText}>VER EN VIVO</Text>
        </TouchableOpacity>
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
  },
  backButton: {
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.five,
  },
  itemImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  detailsContainer: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemMetadata: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  priceCol: {
    flex: 1,
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700', // Dorado para mejor oferta
  },
  limitLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  bidInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.four,
    gap: Spacing.three,
  },
  bidInput: {
    flex: 2,
    height: 52,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  bidButton: {
    flex: 1.2,
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  historySection: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  historyTitle: {
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
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#242F50',
  },
  bidderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  myBidDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.success,
  },
  bidderName: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  bidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  myBidText: {
    color: Colors.dark.success,
    fontWeight: 'bold',
  },
  liveStreamButton: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.five,
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveStreamButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
