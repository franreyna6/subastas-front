import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Olvidé mi contraseña</Text>
        </View>

        {sent ? (
          <View style={styles.successContainer}>
            <Ionicons name="mail-outline" size={64} color={Colors.dark.primary} />
            <Text style={styles.successTitle}>¡Revisá tu correo!</Text>
            <Text style={styles.successSubtitle}>
              Te enviamos un enlace para restablecer tu contraseña a{' '}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.buttonText}>VOLVER AL INICIO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.description}>
              Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
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
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.button, (!email || loading) && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={!email || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>ENVIAR ENLACE</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    marginBottom: Spacing.four,
  },
  backButton: {
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  form: {
    gap: Spacing.four,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  inputGroup: {
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
    marginTop: Spacing.two,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
});
