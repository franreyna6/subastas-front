import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authApi } from '@/lib/api/auth.api';
import { socialStore, SocialProvider } from '@/lib/store/socialStore';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email.trim().toLowerCase() === 'prueba') {
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

  const handleSocialLogin = (provider: SocialProvider) => {
    // En producción: iniciar OAuth real con expo-auth-session
    // Para el TP: simulamos que el proveedor devolvió estos datos
    const mockData: Record<SocialProvider, { email: string; nombre: string }> = {
      google:   { email: 'usuario@gmail.com',    nombre: 'Usuario Google' },
      facebook: { email: 'usuario@facebook.com', nombre: 'Usuario Facebook' },
      apple:    { email: 'usuario@privaterelay.appleid.com', nombre: '' },
    };
    socialStore.set({ provider, ...mockData[provider] });
    router.push('/(auth)/social-complete');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divisor */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O CONTINUÁ CON</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botones sociales */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('google')}>
            <Ionicons name="logo-google" size={26} color="#DB4437" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('apple')}>
            <Ionicons name="logo-apple" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('facebook')}>
            <Ionicons name="logo-facebook" size={26} color="#1877F2" />
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
  form: { width: '100%', gap: Spacing.four },
  inputGroup: { width: '100%', gap: Spacing.two },
  label: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1.5 },
  input: { width: '100%', height: 52, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: Colors.dark.text, fontSize: 15 },
  button: { width: '100%', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.three },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: Spacing.four, gap: Spacing.three },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#242F50' },
  dividerText: { fontSize: 11, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1 },
  socialRow: { flexDirection: 'row', gap: Spacing.three, width: '100%' },
  socialButton: { flex: 1, height: 48, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  footer: { marginTop: Spacing.five, alignItems: 'center', gap: Spacing.three },
  footerText: { color: Colors.dark.text, fontSize: 14 },
  linkText: { color: Colors.dark.primary, fontWeight: '600' },
  forgotPassword: { marginTop: Spacing.one },
});
