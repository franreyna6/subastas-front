import React, { useState } from 'react';
<<<<<<< Updated upstream
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
=======
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
>>>>>>> Stashed changes
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authService } from '@/lib/services/auth.service';
import { registrationStore } from '@/lib/store/registrationStore';

export default function RegisterStep2Screen() {
  const router = useRouter();
<<<<<<< Updated upstream
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
=======
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Completá ambas contraseñas.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    const regData = registrationStore.get();
    if (!regData.email) {
      Alert.alert('Error', 'Faltan datos del registro. Volvé al inicio.');
      router.replace('/(auth)/register-step0');
      return;
    }

    setLoading(true);
    const { error } = await authService.signUp(regData.email, password, {
      full_name: `${regData.nombre} ${regData.apellido}`,
      phone: regData.telefono ?? '',
      dni: regData.dni ?? '',
      address: regData.address ?? '',
      country: regData.country ?? 'Argentina',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error al registrarse', error.message);
      return;
    }

    registrationStore.clear();
    Alert.alert(
      '¡Registro exitoso!',
      'Revisá tu email para confirmar tu cuenta, luego ingresá.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
    );
  };
>>>>>>> Stashed changes

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrate</Text>
        </View>

        {/* Indicadores de Paso */}
        <View style={styles.stepIndicatorContainer}>
<<<<<<< Updated upstream
          <View style={[styles.stepPill, { backgroundColor: '#00FF00' }]} /> {/* Paso 1 completado */}
          <View style={[styles.stepPill, { backgroundColor: '#FF3333' }]} /> {/* Paso 2 activo */}
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.backgroundSelected }]} /> {/* Paso 3 pendiente */}
=======
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.success }]} />
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.success }]} />
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.primary }]} />
>>>>>>> Stashed changes
        </View>

        {/* Título de Paso */}
        <Text style={styles.stepTitle}>PASO 2 - DOCUMENTACION</Text>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DOMICILIO LEGAL</Text>
            <TextInput
              style={styles.input}
              placeholder="Av. Corrientes 1234, CABA"
              placeholderTextColor={Colors.dark.textSecondary}
<<<<<<< Updated upstream
              value={address}
              onChangeText={setAddress}
=======
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
>>>>>>> Stashed changes
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAÍS DE ORIGEN</Text>
            <TextInput
              style={styles.input}
              placeholder="Argentina"
              placeholderTextColor={Colors.dark.textSecondary}
<<<<<<< Updated upstream
              value={country}
              onChangeText={setCountry}
            />
          </View>

          {/* Carga de Fotos DNI */}
          <Text style={styles.label}>FOTO DEL DNI</Text>
          
          <TouchableOpacity style={styles.photoUploadBox}>
            <Ionicons name="camera-outline" size={32} color={Colors.dark.textSecondary} />
            <Text style={styles.photoUploadText}>Frente del documento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoUploadBox}>
            <Ionicons name="camera-outline" size={32} color={Colors.dark.textSecondary} />
            <Text style={styles.photoUploadText}>Dorso del documento</Text>
          </TouchableOpacity>

          {/* Botón Continuar */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/(auth)/register-step3')}
          >
            <Text style={styles.buttonText}>CONTINUAR</Text>
=======
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>FINALIZAR REGISTRO</Text>
            )}
>>>>>>> Stashed changes
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.five,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    marginBottom: Spacing.three,
  },
  backButton: {
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  stepPill: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  stepTitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: Spacing.four,
  },
  form: {
    width: '100%',
    gap: Spacing.four,
  },
  inputGroup: {
    width: '100%',
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: Spacing.one,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: Colors.dark.text,
    fontSize: 15,
  },
  photoUploadBox: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  photoUploadText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
