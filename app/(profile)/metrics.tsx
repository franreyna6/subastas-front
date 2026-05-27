import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

export default function MetricsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Métricas e Historial</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Resumen */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen Financiero</Text>
          <Text style={styles.totalAmount}>$340.000</Text>
          <Text style={styles.summarySubtitle}>Monto Total Ofertado en la Plataforma</Text>
        </View>

        {/* Gráfico de Barras Simulado (Distribución de Categorías) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Distribución por Categoría de Subasta</Text>
          
          <View style={styles.chartContainer}>
            {/* Barra 1 */}
            <View style={styles.chartBarRow}>
              <Text style={styles.barLabel}>Común</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '80%', backgroundColor: Colors.dark.primary }]} />
              </View>
              <Text style={styles.barVal}>8</Text>
            </View>

            {/* Barra 2 */}
            <View style={styles.chartBarRow}>
              <Text style={styles.barLabel}>Plata</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '50%', backgroundColor: Colors.dark.primary }]} />
              </View>
              <Text style={styles.barVal}>5</Text>
            </View>

            {/* Barra 3 */}
            <View style={styles.chartBarRow}>
              <Text style={styles.barLabel}>Oro</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '20%', backgroundColor: Colors.dark.primary }]} />
              </View>
              <Text style={styles.barVal}>2</Text>
            </View>
          </View>
        </View>

        {/* Tabla de Participaciones */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Historial Reciente</Text>
          
          <View style={styles.historyList}>
            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyItemName}>Colección Arte Moderno</Text>
                <Text style={styles.historyItemDate}>27/05/2026</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusText, { color: Colors.dark.success }]}>GANADA</Text>
              </View>
            </View>

            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyItemName}>Autos Clásicos</Text>
                <Text style={styles.historyItemDate}>15/05/2026</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>PARTICIPÓ</Text>
              </View>
            </View>

            <View style={[styles.historyItem, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.historyItemName}>Relojes Vintage</Text>
                <Text style={styles.historyItemDate}>02/05/2026</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>PARTICIPÓ</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Simulada para coincidir con Figma) */}
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
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  chartContainer: {
    gap: Spacing.three,
    marginVertical: Spacing.two,
  },
  chartBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  barLabel: {
    width: 60,
    fontSize: 13,
    color: Colors.dark.text,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#121625',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barVal: {
    width: 20,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyList: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#242F50',
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyItemDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
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
