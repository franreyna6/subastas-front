import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

export default function MyItemsScreen() {
  const router = useRouter();

  const handleAction = (itemName: string, action: string) => {
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de que deseas ${action} el artículo "${itemName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceptar', onPress: () => Alert.alert('Operación Exitosa', `Has ${action}o los términos del bien.`) }
      ]
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Item 1: Aceptado - Requiere Aprobación del Usuario */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Reloj de Oro de Bolsillo</Text>
            <View style={[styles.badge, { backgroundColor: Colors.dark.success }]}>
              <Text style={styles.badgeText}>ACEPTADO</Text>
            </View>
          </View>
          <Text style={styles.cardDetails}>
            La tasación ha finalizado. Por favor acepta o rechaza las condiciones de la subasta:
          </Text>
          <View style={styles.pricingDetails}>
            <View>
              <Text style={styles.priceLabel}>BASE VALORADO</Text>
              <Text style={styles.priceValue}>$250.000</Text>
            </View>
            <View>
              <Text style={styles.priceLabel}>COMISIÓN</Text>
              <Text style={styles.priceValue}>10%</Text>
            </View>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleAction('Reloj de Oro', 'rechazar')}
            >
              <Text style={styles.actionButtonText}>RECHAZAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAction('Reloj de Oro', 'aceptar')}
            >
              <Text style={styles.actionButtonText}>ACEPTAR VALOR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Item 2: Pendiente */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pintura Abstracta "Fuego"</Text>
            <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
              <Text style={[styles.badgeText, { color: '#000000' }]}>INSPECCIÓN</Text>
            </View>
          </View>
          <Text style={styles.cardDetails}>
            El artículo ha llegado a nuestras instalaciones y está siendo evaluado por el equipo de martilleros.
          </Text>
        </View>

        {/* Item 3: Rechazado */}
        <View style={[styles.card, { borderColor: Colors.dark.primary, borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Escultura de Bronce Románica</Text>
            <View style={[styles.badge, { backgroundColor: Colors.dark.primary }]}>
              <Text style={styles.badgeText}>RECHAZADO</Text>
            </View>
          </View>
          <Text style={styles.cardDetails}>
            <Text style={{ fontWeight: 'bold', color: Colors.dark.primary }}>Motivo:</Text> La procedencia legal del bien no pudo ser validada. Se devolverá el bien a cargo del dueño.
          </Text>
        </View>
      </ScrollView>

      {/* Botón Solicitar Subasta */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => Alert.alert('Solicitud', 'Formulario para subir fotos y origen de la pieza.')}
      >
        <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
        <Text style={styles.floatingButtonText}>SOLICITAR NUEVA SUBASTA</Text>
      </TouchableOpacity>
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
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.four,
    borderRadius: 12,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDetails: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  pricingDetails: {
    flexDirection: 'row',
    gap: Spacing.five,
    backgroundColor: '#121625',
    padding: Spacing.three,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  acceptButton: {
    backgroundColor: Colors.dark.primary,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: Spacing.five,
    left: Spacing.four,
    right: Spacing.four,
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
