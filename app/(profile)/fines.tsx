import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface Fine {
  id: string;
  reason: string;
  auction: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

interface Block {
  id: string;
  reason: string;
  date: string;
  duration: string;
  status: 'active' | 'resolved';
}

const INITIAL_FINES: Fine[] = [
  {
    id: '1',
    reason: 'Retiro de oferta tardío',
    auction: 'Colección Relojes Vintage',
    amount: 15000,
    date: '28/05/2026',
    status: 'pending',
  },
  {
    id: '2',
    reason: 'Incumplimiento de pago',
    auction: 'Autos Clásicos Importados',
    amount: 35000,
    date: '12/04/2026',
    status: 'paid',
  },
];

const INITIAL_BLOCKS: Block[] = [
  {
    id: '1',
    reason: 'Comportamiento sospechoso de ofertas duplicadas',
    date: '15/03/2026',
    duration: '48 Horas',
    status: 'resolved',
  },
];

export default function FinesScreen() {
  const router = useRouter();
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);
  const [blocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calcula total pendiente
  const pendingTotal = fines
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const handlePayFine = (fine: Fine) => {
    setSelectedFine(fine);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedFine) return;
    
    setLoading(true);

    // Simulación del proceso de pago
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
      
      // Actualizar estado de la multa
      setFines(prevFines => 
        prevFines.map(f => 
          f.id === selectedFine.id ? { ...f, status: 'paid' } : f
        )
      );

      Alert.alert(
        'Pago Exitoso',
        `Se ha procesado el pago de $${selectedFine.amount.toLocaleString()} por la multa "${selectedFine.reason}".`
      );
      setSelectedFine(null);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Multas y Bloqueos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Resumen del Estado */}
        <View style={styles.statusBox}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>ESTADO DE LA CUENTA</Text>
              <Text style={styles.statusValue}>
                {pendingTotal > 0 ? 'Con Advertencia' : 'Habilitada / Limpia'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: pendingTotal > 0 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(16, 185, 129, 0.15)' }
            ]}>
              <Ionicons 
                name={pendingTotal > 0 ? "warning-outline" : "checkmark-circle-outline"} 
                size={24} 
                color={pendingTotal > 0 ? '#FFD700' : Colors.dark.success} 
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total en multas pendientes:</Text>
            <Text style={[styles.totalAmount, pendingTotal > 0 ? styles.hasFines : styles.noFines]}>
              ${pendingTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Sección Multas */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>HISTORIAL DE MULTAS</Text>
          
          {fines.length === 0 ? (
            <Text style={styles.emptyText}>No registras multas en el sistema.</Text>
          ) : (
            <View style={styles.listContainer}>
              {fines.map((fine) => {
                const isPending = fine.status === 'pending';
                return (
                  <View key={fine.id} style={styles.listItem}>
                    <View style={styles.itemMain}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{fine.reason}</Text>
                        <Text style={styles.itemSubtitle}>{fine.auction}</Text>
                        <Text style={styles.itemDate}>{fine.date}</Text>
                      </View>
                      <View style={styles.itemRight}>
                        <Text style={[styles.itemAmount, isPending ? styles.pendingText : styles.paidText]}>
                          ${fine.amount.toLocaleString()}
                        </Text>
                        
                        {isPending ? (
                          <TouchableOpacity 
                            style={styles.payButton}
                            onPress={() => handlePayFine(fine)}
                          >
                            <Text style={styles.payButtonText}>PAGAR</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.paidBadge}>
                            <Text style={styles.paidBadgeText}>PAGADA</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Sección Bloqueos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>HISTORIAL DE BLOQUEOS</Text>
          
          {blocks.length === 0 ? (
            <Text style={styles.emptyText}>No registras bloqueos ni suspensiones en tu historial.</Text>
          ) : (
            <View style={styles.listContainer}>
              {blocks.map((block) => {
                const isActive = block.status === 'active';
                return (
                  <View key={block.id} style={styles.listItem}>
                    <View style={styles.blockItemContent}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.itemTitle}>{block.reason}</Text>
                        <Text style={styles.itemSubtitle}>Duración: {block.duration}</Text>
                        <Text style={styles.itemDate}>Fecha: {block.date}</Text>
                      </View>
                      <View style={[
                        styles.blockStatusBadge,
                        { backgroundColor: isActive ? 'rgba(233, 78, 101, 0.15)' : 'rgba(140, 155, 176, 0.15)' }
                      ]}>
                        <Text style={[
                          styles.blockStatusText,
                          { color: isActive ? Colors.dark.primary : Colors.dark.textSecondary }
                        ]}>
                          {isActive ? 'ACTIVO' : 'RESUELTO'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Confirmar Pago */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Pago</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedFine && (
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Estás por pagar la multa por el motivo de:
                </Text>
                <Text style={styles.modalReason}>{selectedFine.reason}</Text>
                <Text style={styles.modalSubDescription}>
                  Subasta afectada: {selectedFine.auction}
                </Text>

                <View style={styles.modalAmountCard}>
                  <Text style={styles.modalAmountLabel}>Monto a pagar</Text>
                  <Text style={styles.modalAmountValue}>${selectedFine.amount.toLocaleString()}</Text>
                </View>

                <Text style={styles.modalNote}>
                  * El pago se debitará del medio de pago predeterminado configurado en tu perfil.
                </Text>

                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleConfirmPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>CONFIRMAR Y PAGAR</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  statusBox: {
    backgroundColor: '#0F182F',
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statusBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#242F50',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hasFines: {
    color: '#FFD700',
  },
  noFines: {
    color: Colors.dark.success,
  },
  sectionCard: {
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  listContainer: {
    gap: Spacing.three,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#242F50',
    paddingBottom: Spacing.three,
  },
  itemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#FFD700',
  },
  paidText: {
    color: Colors.dark.success,
  },
  payButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidBadgeText: {
    color: Colors.dark.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
  blockItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  blockStatusBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 6,
  },
  blockStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Modal confirmación
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.dark.background,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  modalReason: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSubDescription: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  modalAmountCard: {
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.four,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: Spacing.two,
    gap: 4,
  },
  modalAmountLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  modalNote: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  confirmButton: {
    height: 48,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
