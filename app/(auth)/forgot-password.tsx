import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authService } from '@/lib/services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    
    setLoading(true);
    const { error } = await authService.resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icono de Llave */}
        <View style={styles.logoContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="key-sharp" size={48} color={Colors.dark.primary} />
          </View>
          <Text style={styles.logoText}>RECUPERAR</Text>
        </View>

        {!submitted ? (
          <View style={styles.form}>
            <Text style={styles.description}>
              Ingresá tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
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

            {/* Botón Enviar */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>ENVIAR INSTRUCCIONES</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.dark.success} />
              <Text style={styles.successText}>¡Instrucciones enviadas!</Text>
              <Text style={styles.descriptionCentered}>
                Hemos enviado un correo a <Text style={styles.boldText}>{email}</Text> con los pasos para restablecer tu contraseña.
              </Text>
            </View>
          </View>
        )}

        {/* Enlace Volver */}
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
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.four,
    lineHeight: 20,
  },
  descriptionCentered: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.two,
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
  successContainer: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: Spacing.two,
  },
  boldText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  footer: {
    marginTop: Spacing.five,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
});
