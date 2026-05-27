import React from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const router = useRouter();

  const handleSelectAuction = (id: string, name: string) => {
    router.push({
      pathname: '/(buyer)/live-room',
      params: { id, name }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Superior */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeLabel}>Bienvenido,</Text>
          <Text style={styles.userName}>Carlos M.</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>PLATA</Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchSection}>
        <Ionicons name="search-outline" size={20} color={Colors.dark.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar subastas..."
          placeholderTextColor={Colors.dark.textSecondary}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SUBASTAS EN VIVO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SUBASTAS EN VIVO</Text>
        </View>

        {/* Tarjeta 1: Arte Moderno */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => handleSelectAuction('1', 'Colección Arte Moderno')}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.cardImage} 
          />
          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>Colección Arte Moderno</Text>
            </View>
            <Text style={styles.cardSubtitle}>14 piezas - Cat. Plata</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>$ 125.000</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>EN VIVO</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Tarjeta 2: Autos Clásicos */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => handleSelectAuction('2', 'Autos Clásicos')}
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.cardImage} 
          />
          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>Autos Clásicos</Text>
            </View>
            <Text style={styles.cardSubtitle}>8 vehículos - Cat. Oro</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>$ 300.000</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>EN VIVO</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* PRÓXIMAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRÓXIMAS</Text>
        </View>

        {/* Tarjeta 3: Joyas */}
        <View style={[styles.card, styles.upcomingCard]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop' }} 
            style={styles.cardImage} 
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Joyas</Text>
            <Text style={styles.cardSubtitle}>10 piezas - Mañana 15:00 hs</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>$ 750.000</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Simulada para coincidir con Figma) */}
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
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#0F182F', // Fondo ligeramente más azul del header en figma
  },
  welcomeContainer: {
    gap: 2,
  },
  welcomeLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  categoryBadge: {
    backgroundColor: '#A2B0C4', // Gris/azul claro del badge PLATA en figma
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111625',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.three,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 80, // Espacio para la barra de navegación simulada
  },
  sectionHeader: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.four,
  },
  upcomingCard: {
    opacity: 0.8,
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardInfo: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  liveBadge: {
    backgroundColor: Colors.dark.success,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111625',
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
