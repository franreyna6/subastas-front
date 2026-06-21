import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authApi } from '@/lib/api/auth.api';
import { authStore, PRUEBA_SESSION } from '@/lib/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (email.trim().toLowerCase() === 'prueba') {
      await authStore.save(PRUEBA_SESSION);
      router.replace('/(buyer)/dashboard');
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Ingresá email y contraseña.');
      return;
    }

    setLoading(true);
    const { data, error } = await authApi.login(email.trim(), password);
    setLoading(false);

    if (error || !data) {
      Alert.alert('Error al ingresar', error ?? 'Error desconocido');
      return;
    }

    if (data.rol === 'duenio') {
      router.replace('/(seller)/my-items');
    } else {
      router.replace('/(buyer)/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="hammer-sharp" size={48} color={Colors.dark.primary} />
          </View>
          <Text style={styles.logoText}>SUBASTAS</Text>
        </View>

        <View style={styles.form}>
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
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={Colors.dark.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(v => !v)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.buttonText}>INGRESAR</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/register-step0')}>
            <Text style={styles.footerText}>
              ¿No tenés cuenta? <Text style={styles.linkText}>Registrate</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.linkText}>Olvidé mi contraseña</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: Spacing.two }} onPress={() => router.push('/(auth)/register-step2')}>
            <Text style={styles.linkText}>¿Recibiste tu código? Completá tu registro</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.dark.background },
  content:       { flexGrow: 1, paddingHorizontal: Spacing.five, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.six },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.six },
  iconBackground:{ width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  logoText:      { fontSize: 28, fontWeight: 'bold', color: Colors.dark.primary, letterSpacing: 2 },
  form:          { width: '100%', gap: Spacing.four },
  inputGroup:    { width: '100%', gap: Spacing.two },
  label:         { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1.5 },
  input:         { width: '100%', height: 52, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: Colors.dark.text, fontSize: 15 },
  passwordRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, height: 52 },
  passwordInput: { flex: 1, height: 52, paddingHorizontal: Spacing.three, color: Colors.dark.text, fontSize: 15 },
  eyeButton:     { paddingHorizontal: Spacing.three, height: 52, justifyContent: 'center' },
  button:        { width: '100%', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.three },
  buttonText:    { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footer:        { marginTop: Spacing.five, alignItems: 'center', gap: Spacing.three },
  footerText:    { color: Colors.dark.text, fontSize: 14 },
  linkText:      { color: Colors.dark.primary, fontWeight: '600' },
  forgotPassword:{ marginTop: Spacing.one },
});
