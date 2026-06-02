import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { api } from '@/lib/api/apiClient';

type Step = 'email' | 'codigo' | 'success';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresá tu correo electrónico.');
      return;
    }
    setLoading(true);
    const { error } = await api.post('/api/auth/forgot-password', { email: email.trim() });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    setStep('codigo');
  };

  const handleResetPassword = async () => {
    if (!codigo.trim()) {
      Alert.alert('Error', 'Ingresá el código que recibiste.');
      return;
    }
    if (nuevaPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    const { error } = await api.post('/api/auth/reset-password', {
      email: email.trim(),
      codigo: codigo.trim(),
      nuevaPassword,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    setStep('success');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="key-sharp" size={48} color={Colors.dark.primary} />
          </View>
          <Text style={styles.logoText}>RECUPERAR</Text>
        </View>

        {step === 'email' && (
          <View style={styles.form}>
            <Text style={styles.description}>
              Ingresá tu correo y te enviamos un código de 6 dígitos para recuperar tu contraseña.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="usuario@email.com"
                placeholderTextColor={Colors.dark.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>}
            </TouchableOpacity>
          </View>
        )}

        {step === 'codigo' && (
          <View style={styles.form}>
            <Text style={styles.description}>
              Revisá tu bandeja de entrada. Ingresá el código de 6 dígitos y tu nueva contraseña.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CÓDIGO</Text>
              <TextInput
                style={[styles.input, styles.inputCode]}
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
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Colors.dark.textSecondary}
                value={nuevaPassword}
                onChangeText={setNuevaPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
              <TextInput
                style={styles.input}
                placeholder="Repetí la contraseña"
                placeholderTextColor={Colors.dark.textSecondary}
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>CAMBIAR CONTRASEÑA</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')}>
              <Text style={styles.resendText}>¿No recibiste el código? Volvé a intentarlo</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'success' && (
          <View style={styles.form}>
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.dark.success} />
              <Text style={styles.successText}>¡Contraseña actualizada!</Text>
              <Text style={styles.descriptionCentered}>
                Ya podés ingresar con tu nueva contraseña.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, paddingHorizontal: Spacing.five, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.six },
  iconBackground: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  logoText: { fontSize: 28, fontWeight: 'bold', color: Colors.dark.primary, letterSpacing: 2 },
  description: { fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center', marginBottom: Spacing.four, lineHeight: 20 },
  descriptionCentered: { fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: Spacing.two },
  form: { width: '100%', gap: Spacing.four },
  inputGroup: { width: '100%', gap: Spacing.two },
  label: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1.5 },
  input: { width: '100%', height: 52, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: Colors.dark.text, fontSize: 15 },
  inputCode: { textAlign: 'center', fontSize: 28, fontWeight: 'bold', letterSpacing: 8 },
  button: { width: '100%', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  resendText: { color: Colors.dark.textSecondary, fontSize: 13, textAlign: 'center', marginTop: Spacing.two },
  successContainer: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  successText: { fontSize: 20, fontWeight: 'bold', color: Colors.dark.text, marginTop: Spacing.two },
  footer: { marginTop: Spacing.five, alignItems: 'center' },
  linkText: { color: Colors.dark.primary, fontWeight: '600' },
});
