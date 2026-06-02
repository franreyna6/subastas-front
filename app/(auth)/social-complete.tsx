import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authApi } from '@/lib/api/auth.api';
import { socialStore } from '@/lib/store/socialStore';

const PROVIDER_LABEL: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
};

const PROVIDER_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  google:   'logo-google',
  facebook: 'logo-facebook',
  apple:    'logo-apple',
};

const PROVIDER_COLOR: Record<string, string> = {
  google:   '#DB4437',
  facebook: '#1877F2',
  apple:    '#FFFFFF',
};

export default function SocialCompleteScreen() {
  const router = useRouter();
  const social = socialStore.get();

  // Si no hay datos del proveedor, volver al login
  if (!social) {
    router.replace('/(auth)/login');
    return null;
  }

  const [nombre, setNombre] = useState(social.nombre);
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const providerLabel = PROVIDER_LABEL[social.provider] ?? social.provider;
  const providerIcon  = PROVIDER_ICON[social.provider]  ?? 'person';
  const providerColor = PROVIDER_COLOR[social.provider] ?? Colors.dark.primary;

  const handleComplete = async () => {
    if (!nombre.trim() || !dni.trim()) {
      Alert.alert('Campos requeridos', 'Nombre y DNI son obligatorios.');
      return;
    }

    setLoading(true);
    const { error } = await authApi.register({
      nombre: nombre.trim(),
      documento: dni.trim(),
      direccion: direccion.trim() || undefined,
      email: social.email,
      password: `social_${social.provider}_${Date.now()}`,
      rol: 'cliente',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    socialStore.clear();
    Alert.alert(
      '¡Registro enviado!',
      'Tu solicitud fue recibida. Un empleado debe aprobarla antes de que puedas ingresar.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completá tu registro</Text>
        </View>

        {/* Banner proveedor */}
        <View style={styles.providerBanner}>
          <Ionicons name={providerIcon} size={22} color={providerColor} />
          <Text style={styles.providerText}>
            Conectado con <Text style={[styles.providerName, { color: providerColor }]}>{providerLabel}</Text>
          </Text>
        </View>

        {/* Email (bloqueado — viene del proveedor) */}
        <View style={[styles.inputGroup, { marginBottom: Spacing.two }]}>
          <Text style={styles.label}>EMAIL (del proveedor)</Text>
          <View style={styles.inputLocked}>
            <Text style={styles.inputLockedText}>{social.email}</Text>
            <Ionicons name="lock-closed" size={16} color={Colors.dark.textSecondary} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>DATOS FALTANTES</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOMBRE Y APELLIDO</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez"
              placeholderTextColor={Colors.dark.textSecondary}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DNI / CUIL / CUIT *</Text>
            <TextInput
              style={styles.input}
              placeholder="12345678"
              placeholderTextColor={Colors.dark.textSecondary}
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TELÉFONO</Text>
            <TextInput
              style={styles.input}
              placeholder="+54 11 1234-5678"
              placeholderTextColor={Colors.dark.textSecondary}
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DOMICILIO LEGAL</Text>
            <TextInput
              style={styles.input}
              placeholder="Av. Corrientes 1234, CABA"
              placeholderTextColor={Colors.dark.textSecondary}
              value={direccion}
              onChangeText={setDireccion}
            />
          </View>

          <Text style={styles.note}>
            Tu cuenta quedará pendiente de aprobación por un empleado antes de poder ingresar.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleComplete} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>COMPLETAR REGISTRO</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { paddingHorizontal: Spacing.five, paddingBottom: Spacing.six },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three, marginBottom: Spacing.three },
  backButton: { marginRight: Spacing.three },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  providerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 10,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  providerText: { fontSize: 14, color: Colors.dark.textSecondary },
  providerName: { fontWeight: '700' },
  sectionTitle: { fontSize: 11, color: Colors.dark.textSecondary, fontWeight: '700', letterSpacing: 1.5, marginBottom: Spacing.three, marginTop: Spacing.two },
  form: { width: '100%', gap: Spacing.four },
  inputGroup: { width: '100%', gap: Spacing.two },
  label: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1.5 },
  input: { width: '100%', height: 52, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: Colors.dark.text, fontSize: 15 },
  inputLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    backgroundColor: '#0A1020',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: '#242F50',
  },
  inputLockedText: { color: Colors.dark.textSecondary, fontSize: 15 },
  note: { fontSize: 12, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 18 },
  button: { width: '100%', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
