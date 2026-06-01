import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simular inicio de sesión
    setTimeout(() => {
      setLoading(false);
      // Redirigir al dashboard (comprador)
      router.replace('/(buyer)/dashboard');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icono de Gavel (Martillo) */}
        <View style={styles.logoContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="hammer-sharp" size={48} color={Colors.dark.primary} />
          </View>
          <Text style={styles.logoText}>SUBASTAS</Text>
        </View>

        {/* Formulario */}
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

          {/* Botón Ingresar */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Enlaces */}
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
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.five,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  iconBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    letterSpacing: 2,
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
  button: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    marginTop: Spacing.five,
    alignItems: 'center',
    gap: Spacing.three,
  },
  footerText: {
    color: Colors.dark.text,
    fontSize: 14,
  },
  linkText: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: Spacing.one,
  },
});
