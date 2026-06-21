import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authApi } from '@/lib/api/auth.api';
import { registrationStore } from '@/lib/store/registrationStore';

export default function RegisterStep2Screen() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', 'Ingresá el código de validación de 6 dígitos.');
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

    setLoading(true);
    const { error } = await authApi.completeRegistration({
      codigo: codigo.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error al completar registro', error);
      return;
    }

    Alert.alert(
      '¡Registro completado!',
      'Tu cuenta fue creada con éxito. Ahora un administrador la activará definitivamente para que puedas ingresar.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrate</Text>
        </View>

        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.success }]} />
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.success }]} />
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.primary }]} />
        </View>

        <Text style={styles.stepTitle}>COMPLETAR REGISTRO (CÓDIGO RECIBIDO)</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CÓDIGO DE VALIDACIÓN (6 DÍGITOS)</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor={Colors.dark.textSecondary}
              value={codigo}
              onChangeText={setCodigo}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.dark.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.dark.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>COMPLETAR REGISTRO</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { paddingHorizontal: Spacing.five, paddingBottom: Spacing.five },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three, marginBottom: Spacing.three },
  backButton: { marginRight: Spacing.three },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.two, marginBottom: Spacing.five },
  stepPill: { flex: 1, height: 10, borderRadius: 5 },
  stepTitle: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '700', textAlign: 'center', letterSpacing: 1.5, marginBottom: Spacing.four },
  form: { width: '100%', gap: Spacing.four },
  inputGroup: { width: '100%', gap: Spacing.two },
  label: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1.5, marginTop: Spacing.one },
  input: { width: '100%', height: 52, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: Colors.dark.text, fontSize: 15 },
  button: { width: '100%', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.four },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
