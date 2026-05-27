import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'check';
  title: string;
  subtitle: string;
  status: 'verified' | 'pending' | 'reviewing';
}

const INITIAL_PAYMENTS: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    title: 'Visa Débito (Nacional)',
    subtitle: '•••• •••• •••• 4321',
    status: 'verified',
  },
  {
    id: '2',
    type: 'bank',
    title: 'Banco Galicia (Corriente)',
    subtitle: 'CBU: 00701234••••••••••••••',
    status: 'verified',
  },
  {
    id: '3',
    type: 'check',
    title: 'Cheque Certificado (Garantía)',
    subtitle: 'Monto: $50.000 - Pendiente',
    status: 'reviewing',
  },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'card' | 'bank' | 'check'>('card');

  // Form states - Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Form states - Bank
  const [bankCbu, setBankCbu] = useState('');
  const [bankAlias, setBankAlias] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountType, setBankAccountType] = useState<'Corriente' | 'Ahorro'>('Ahorro');

  // Form states - Check
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkAmount, setCheckAmount] = useState('');

  const resetForm = () => {
    // Reset Card
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvv('');
    
    // Reset Bank
    setBankCbu('');
    setBankAlias('');
    setBankHolder('');
    setBankName('');
    setBankAccountType('Ahorro');

    // Reset Check
    setCheckNumber('');
    setCheckBank('');
    setCheckAmount('');

    setSelectedType('card');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Card formatting
  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const limited = cleaned.slice(0, 16);
    let formatted = '';
    for (let i = 0; i < limited.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += limited[i];
    }
    setCardNumber(formatted);
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const limited = cleaned.slice(0, 4);
    if (limited.length > 2) {
      setCardExpiry(`${limited.slice(0, 2)}/${limited.slice(2)}`);
    } else {
      setCardExpiry(limited);
    }
  };

  const handleSave = () => {
    // Validations
    if (selectedType === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        Alert.alert('Error', 'Por favor ingresa un número de tarjeta de 16 dígitos.');
        return;
      }
      if (!cardHolder.trim()) {
        Alert.alert('Error', 'Por favor ingresa el nombre del titular.');
        return;
      }
      if (cardExpiry.length < 5) {
        Alert.alert('Error', 'Por favor ingresa la fecha de vencimiento (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        Alert.alert('Error', 'Por favor ingresa un CVV válido.');
        return;
      }
    } else if (selectedType === 'bank') {
      if (!bankCbu.trim() && !bankAlias.trim()) {
        Alert.alert('Error', 'Por favor ingresa un CBU o un Alias.');
        return;
      }
      if (bankCbu.trim() && bankCbu.length !== 22) {
        Alert.alert('Error', 'El CBU debe contener exactamente 22 dígitos.');
        return;
      }
      if (!bankHolder.trim()) {
        Alert.alert('Error', 'Por favor ingresa el nombre del titular.');
        return;
      }
      if (!bankName.trim()) {
        Alert.alert('Error', 'Por favor ingresa el nombre del banco.');
        return;
      }
    } else if (selectedType === 'check') {
      if (!checkNumber.trim()) {
        Alert.alert('Error', 'Por favor ingresa el número de cheque.');
        return;
      }
      if (!checkBank.trim()) {
        Alert.alert('Error', 'Por favor ingresa el banco emisor.');
        return;
      }
      if (!checkAmount.trim() || isNaN(parseFloat(checkAmount))) {
        Alert.alert('Error', 'Por favor ingresa un monto válido.');
        return;
      }
    }

    setLoading(true);

    // Simulate saving to server
    setTimeout(() => {
      setLoading(false);
      
      let newMethod: PaymentMethod;
      const id = (paymentMethods.length + 1).toString();

      if (selectedType === 'card') {
        const cleanCard = cardNumber.replace(/\s/g, '');
        const lastFour = cleanCard.slice(-4);
        const cardBrand = cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Tarjeta';
        newMethod = {
          id,
          type: 'card',
          title: `${cardBrand} Débito (Nacional)`,
          subtitle: `•••• •••• •••• ${lastFour}`,
          status: 'verified',
        };
      } else if (selectedType === 'bank') {
        const identifier = bankCbu.trim() ? `CBU: ${bankCbu.slice(0, 6)}••••••••••••••••` : `Alias: ${bankAlias}`;
        newMethod = {
          id,
          type: 'bank',
          title: `${bankName} (${bankAccountType})`,
          subtitle: identifier,
          status: 'verified',
        };
      } else {
        const formattedAmount = parseFloat(checkAmount).toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0
        });
        newMethod = {
          id,
          type: 'check',
          title: `Cheque Certificado (${checkBank})`,
          subtitle: `N°: ${checkNumber} | Monto: ${formattedAmount} - Pendiente`,
          status: 'reviewing',
        };
      }

      setPaymentMethods([...paymentMethods, newMethod]);
      setIsModalOpen(false);
      Alert.alert('Éxito', 'Medio de pago agregado correctamente.');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medios de Pago</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Lista de Medios de Pago */}
        {paymentMethods.map((method) => {
          let iconName: 'card-outline' | 'business-outline' | 'document-text-outline' = 'card-outline';
          if (method.type === 'bank') iconName = 'business-outline';
          if (method.type === 'check') iconName = 'document-text-outline';

          const isReviewing = method.status === 'reviewing';
          const isPending = method.status === 'pending';

          return (
            <View key={method.id} style={[styles.card, (isReviewing || isPending) && styles.unverifiedCard]}>
              <Ionicons 
                name={iconName} 
                size={28} 
                color={(isReviewing || isPending) ? Colors.dark.textSecondary : Colors.dark.primary} 
              />
              <View style={styles.cardDetails}>
                <Text style={styles.cardTitle}>{method.title}</Text>
                <Text style={styles.cardSubtitle}>{method.subtitle}</Text>
              </View>
              <View style={[
                styles.verifiedBadge, 
                isReviewing && { backgroundColor: '#FFD700' },
                isPending && { backgroundColor: '#E94E65' }
              ]}>
                <Text style={[
                  styles.verifiedText, 
                  (isReviewing || isPending) && { color: '#000000' }
                ]}>
                  {method.status === 'verified' ? 'Verificado' : method.status === 'reviewing' ? 'Revisando' : 'Pendiente'}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Botón Agregar */}
        <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>AGREGAR MEDIO DE PAGO</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Agregar Medio de Pago */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Medio de Pago</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Selectores de Tipo */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, selectedType === 'card' && styles.tabButtonActive]}
                  onPress={() => setSelectedType('card')}
                >
                  <Ionicons 
                    name="card-outline" 
                    size={16} 
                    color={selectedType === 'card' ? '#FFFFFF' : Colors.dark.textSecondary} 
                  />
                  <Text style={[styles.tabButtonText, selectedType === 'card' && styles.tabButtonTextActive]}>
                    Tarjeta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, selectedType === 'bank' && styles.tabButtonActive]}
                  onPress={() => setSelectedType('bank')}
                >
                  <Ionicons 
                    name="business-outline" 
                    size={16} 
                    color={selectedType === 'bank' ? '#FFFFFF' : Colors.dark.textSecondary} 
                  />
                  <Text style={[styles.tabButtonText, selectedType === 'bank' && styles.tabButtonTextActive]}>
                    CBU/Alias
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, selectedType === 'check' && styles.tabButtonActive]}
                  onPress={() => setSelectedType('check')}
                >
                  <Ionicons 
                    name="document-text-outline" 
                    size={16} 
                    color={selectedType === 'check' ? '#FFFFFF' : Colors.dark.textSecondary} 
                  />
                  <Text style={[styles.tabButtonText, selectedType === 'check' && styles.tabButtonTextActive]}>
                    Cheque
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Formulario Dinámico */}
              <ScrollView 
                contentContainerStyle={styles.formContainer} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {selectedType === 'card' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>NÚMERO DE TARJETA</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="4517 8492 0184 9204"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      value={cardNumber}
                      onChangeText={handleCardNumberChange}
                    />

                    <Text style={styles.inputLabel}>NOMBRE DEL TITULAR</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="JUAN PEREZ"
                      placeholderTextColor={Colors.dark.textSecondary}
                      autoCapitalize="characters"
                      value={cardHolder}
                      onChangeText={setCardHolder}
                    />

                    <View style={styles.row}>
                      <View style={{ flex: 1, marginRight: Spacing.two }}>
                        <Text style={styles.inputLabel}>VENCIMIENTO</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YY"
                          placeholderTextColor={Colors.dark.textSecondary}
                          keyboardType="numeric"
                          value={cardExpiry}
                          onChangeText={handleExpiryChange}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: Spacing.two }}>
                        <Text style={styles.inputLabel}>CVC / CVV</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="123"
                          placeholderTextColor={Colors.dark.textSecondary}
                          keyboardType="numeric"
                          secureTextEntry
                          maxLength={4}
                          value={cardCvv}
                          onChangeText={setCardCvv}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {selectedType === 'bank' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>CBU (22 DÍGITOS)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0070123456789012345678"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      maxLength={22}
                      value={bankCbu}
                      onChangeText={setBankCbu}
                    />

                    <Text style={styles.inputLabel}>O ALIAS DE LA CUENTA</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="mi.alias.pago"
                      placeholderTextColor={Colors.dark.textSecondary}
                      autoCapitalize="none"
                      value={bankAlias}
                      onChangeText={setBankAlias}
                    />

                    <Text style={styles.inputLabel}>TITULAR DE LA CUENTA</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="JUAN PEREZ"
                      placeholderTextColor={Colors.dark.textSecondary}
                      autoCapitalize="characters"
                      value={bankHolder}
                      onChangeText={setBankHolder}
                    />

                    <Text style={styles.inputLabel}>BANCO</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="BANCO GALICIA"
                      placeholderTextColor={Colors.dark.textSecondary}
                      autoCapitalize="characters"
                      value={bankName}
                      onChangeText={setBankName}
                    />

                    <Text style={styles.inputLabel}>TIPO DE CUENTA</Text>
                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          bankAccountType === 'Ahorro' && styles.selectButtonActive
                        ]}
                        onPress={() => setBankAccountType('Ahorro')}
                      >
                        <Text style={[
                          styles.selectButtonText,
                          bankAccountType === 'Ahorro' && styles.selectButtonTextActive
                        ]}>Caja de Ahorro</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.selectButton,
                          bankAccountType === 'Corriente' && styles.selectButtonActive
                        ]}
                        onPress={() => setBankAccountType('Corriente')}
                      >
                        <Text style={[
                          styles.selectButtonText,
                          bankAccountType === 'Corriente' && styles.selectButtonTextActive
                        ]}>Cta. Corriente</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {selectedType === 'check' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.inputLabel}>NÚMERO DE CHEQUE</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="12345678"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      value={checkNumber}
                      onChangeText={setCheckNumber}
                    />

                    <Text style={styles.inputLabel}>BANCO EMISOR</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="BANCO NACION"
                      placeholderTextColor={Colors.dark.textSecondary}
                      autoCapitalize="characters"
                      value={checkBank}
                      onChangeText={setCheckBank}
                    />

                    <Text style={styles.inputLabel}>MONTO EN GARANTÍA ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="150000"
                      placeholderTextColor={Colors.dark.textSecondary}
                      keyboardType="numeric"
                      value={checkAmount}
                      onChangeText={setCheckAmount}
                    />
                  </View>
                )}

                {/* Botón Guardar */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>GUARDAR MEDIO DE PAGO</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
    gap: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.four,
    borderRadius: 12,
    gap: Spacing.three,
  },
  unverifiedCard: {
    opacity: 0.75,
  },
  cardDetails: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  verifiedBadge: {
    backgroundColor: Colors.dark.success,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111625',
  },
  addButton: {
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.four,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two + 2,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.dark.backgroundSelected,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    paddingBottom: Spacing.five,
  },
  formGroup: {
    gap: Spacing.three,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  input: {
    height: 48,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: '#FFFFFF',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectButtonActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: 'rgba(233, 78, 101, 0.1)',
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
  },
  selectButtonTextActive: {
    color: Colors.dark.primary,
  },
  saveButton: {
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four + 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

