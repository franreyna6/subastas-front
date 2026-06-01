import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import * as DocumentPicker from 'expo-document-picker';

interface AuctionItem {
  id: string;
  title: string;
  status: 'pending_approval' | 'accepted' | 'inspeccion' | 'rejected';
  details: string;
  priceLabel?: string;
  priceValue?: string;
  commission?: string;
  rejectionReason?: string;
}

const INITIAL_ITEMS: AuctionItem[] = [
  {
    id: '1',
    title: 'Reloj de Oro de Bolsillo',
    status: 'pending_approval',
    details: 'La tasación ha finalizado. Por favor acepta o rechaza las condiciones de la subasta:',
    priceLabel: 'BASE VALORADO',
    priceValue: '$250.000',
    commission: '10%',
  },
  {
    id: '2',
    title: 'Pintura Abstracta "Fuego"',
    status: 'inspeccion',
    details: 'El artículo ha llegado a nuestras instalaciones y está siendo evaluado por el equipo de martilleros.',
  },
  {
    id: '3',
    title: 'Escultura de Bronce Románica',
    status: 'rejected',
    details: 'La procedencia legal del bien no pudo ser validada. Se devolverá el bien a cargo del dueño.',
    rejectionReason: 'La procedencia legal del bien no pudo ser validada. Se devolverá el bien a cargo del dueño.',
  },
];

export default function MyItemsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<AuctionItem[]>(INITIAL_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Arte' | 'Relojes' | 'Vehículos' | 'Otros'>('Arte');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileUri, setUploadedFileUri] = useState<string | null>(null);

  const handleAction = (id: string, itemName: string, action: 'aceptar' | 'rechazar') => {
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de que deseas ${action} el artículo "${itemName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aceptar', 
          onPress: () => {
            setItems(prevItems => 
              prevItems.map(item => {
                if (item.id === id) {
                  return {
                    ...item,
                    status: action === 'aceptar' ? 'accepted' : 'rejected',
                    details: action === 'aceptar' 
                      ? 'Has aceptado las condiciones de la subasta. Se programará pronto.' 
                      : 'Has rechazado las condiciones. Nos pondremos en contacto para la devolución del bien.',
                    rejectionReason: action === 'rechazar' ? 'Rechazado por el usuario.' : undefined
                  };
                }
                return item;
              })
            );
            Alert.alert('Operación Exitosa', `Has ${action}o los términos del bien.`);
          } 
        }
      ]
    );
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileAsset = result.assets[0];
        setUploadedFile(fileAsset.name);
        setUploadedFileUri(fileAsset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al seleccionar el archivo.');
      console.error(error);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedFileUri(null);
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Arte');
    setEstimatedPrice('');
    setDescription('');
    setUploadedFile(null);
    setUploadedFileUri(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleRequestAuction = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del artículo.');
      return;
    }
    if (!estimatedPrice.trim() || isNaN(parseFloat(estimatedPrice))) {
      Alert.alert('Error', 'Por favor ingresa un precio base estimado válido.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una breve descripción del artículo.');
      return;
    }
    if (!uploadedFile) {
      Alert.alert('Error', 'Por favor sube un comprobante de origen o fotos del artículo.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);

      const newItem: AuctionItem = {
        id: (items.length + 1).toString(),
        title: title.trim(),
        status: 'inspeccion',
        details: `Artículo en evaluación (Categoría: ${category}). Precio sugerido: $${parseFloat(estimatedPrice).toLocaleString()}. Archivo: ${uploadedFile}`,
      };

      setItems(prevItems => [newItem, ...prevItems]);
      
      // En un entorno de backend real, aquí enviaríamos un FormData con:
      // - title, category, estimatedPrice, description
      // - El archivo usando la URI: uploadedFileUri
      console.log('Solicitud enviada con archivo:', uploadedFile, 'URI del archivo temporal:', uploadedFileUri);

      Alert.alert(
        'Solicitud Recibida',
        'Tu solicitud de subasta ha sido ingresada con éxito. Evaluaremos el artículo en las próximas 48 horas.'
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Artículos a Subastar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const isPendingApproval = item.status === 'pending_approval';
          const isAccepted = item.status === 'accepted';
          const isInspeccion = item.status === 'inspeccion';
          const isRejected = item.status === 'rejected';

          return (
            <View key={item.id} style={[
              styles.card, 
              isRejected && { borderColor: Colors.dark.primary, borderWidth: 1 }
            ]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                
                {isPendingApproval && (
                  <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
                    <Text style={[styles.badgeText, { color: '#000000' }]}>PENDIENTE APROBACIÓN</Text>
                  </View>
                )}
                {isAccepted && (
                  <View style={[styles.badge, { backgroundColor: Colors.dark.success }]}>
                    <Text style={styles.badgeText}>ACEPTADO</Text>
                  </View>
                )}
                {isInspeccion && (
                  <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
                    <Text style={[styles.badgeText, { color: '#000000' }]}>INSPECCIÓN</Text>
                  </View>
                )}
                {isRejected && (
                  <View style={[styles.badge, { backgroundColor: Colors.dark.primary }]}>
                    <Text style={styles.badgeText}>RECHAZADO</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardDetails}>{item.details}</Text>

              {item.priceValue && (
                <View style={styles.pricingDetails}>
                  <View>
                    <Text style={styles.priceLabel}>{item.priceLabel}</Text>
                    <Text style={styles.priceValue}>{item.priceValue}</Text>
                  </View>
                  {item.commission && (
                    <View>
                      <Text style={styles.priceLabel}>COMISIÓN</Text>
                      <Text style={styles.priceValue}>{item.commission}</Text>
                    </View>
                  )}
                </View>
              )}

              {isPendingApproval && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleAction(item.id, item.title, 'rechazar')}
                  >
                    <Text style={styles.actionButtonText}>RECHAZAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAction(item.id, item.title, 'aceptar')}
                  >
                    <Text style={styles.actionButtonText}>ACEPTAR VALOR</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Botón Solicitar Subasta */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleOpenModal}
      >
        <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" />
        <Text style={styles.floatingButtonText}>SOLICITAR NUEVA SUBASTA</Text>
      </TouchableOpacity>

      {/* Modal Solicitar Nueva Subasta */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Solicitar Nueva Subasta</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
                {/* Nombre del Artículo */}
                <Text style={styles.inputLabel}>NOMBRE DEL ARTÍCULO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Reloj de pared antiguo de bronce"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />

                {/* Categorías */}
                <Text style={styles.inputLabel}>CATEGORÍA</Text>
                <View style={styles.categoryRow}>
                  {(['Arte', 'Relojes', 'Vehículos', 'Otros'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categorySelectButton,
                        category === cat && styles.categorySelectButtonActive
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categorySelectButtonText,
                        category === cat && styles.categorySelectButtonTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Precio Base Estimado */}
                <Text style={styles.inputLabel}>PRECIO BASE SUGERIDO ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 120000"
                  placeholderTextColor={Colors.dark.textSecondary}
                  keyboardType="numeric"
                  value={estimatedPrice}
                  onChangeText={setEstimatedPrice}
                />

                {/* Descripción */}
                <Text style={styles.inputLabel}>DESCRIPCIÓN DEL BIEN</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Detalla el estado físico, origen, antigüedad..."
                  placeholderTextColor={Colors.dark.textSecondary}
                  multiline={true}
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />

                {/* Archivo adjunto / Fotos */}
                <Text style={styles.inputLabel}>FOTO O DOCUMENTO DE ORIGEN</Text>
                {uploadedFile ? (
                  <View style={styles.fileContainer}>
                    <Ionicons name="document-attach-outline" size={20} color={Colors.dark.success} />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {uploadedFile}
                    </Text>
                    <TouchableOpacity onPress={handleRemoveFile} style={styles.removeFileButton}>
                      <Ionicons name="trash-outline" size={18} color={Colors.dark.primary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick} disabled={loading}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.uploadButtonText}>SUBIR ARCHIVO / FOTOS</Text>
                  </TouchableOpacity>
                )}

                {/* Botón Solicitar */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleRequestAuction}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>ENVIAR SOLICITUD</Text>
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
    gap: Spacing.four,
    paddingBottom: 110,
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
    flex: 1,
    marginRight: Spacing.two,
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
  formContainer: {
    paddingBottom: Spacing.five,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
    letterSpacing: 1,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  input: {
    height: 48,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: '#FFFFFF',
    fontSize: 14,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: Spacing.two,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  categorySelectButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categorySelectButtonActive: {
    borderColor: Colors.dark.primary,
    backgroundColor: 'rgba(233, 78, 101, 0.1)',
  },
  categorySelectButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
  },
  categorySelectButtonTextActive: {
    color: Colors.dark.primary,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    height: 48,
    gap: Spacing.two,
  },
  fileName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  removeFileButton: {
    padding: 4,
  },
  uploadButton: {
    height: 48,
    backgroundColor: Colors.dark.backgroundSelected,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  submitButton: {
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
