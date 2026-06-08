import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { registrationStore } from '@/lib/store/registrationStore';

export default function RegisterStep0Screen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrate</Text>
        </View>

        {/* Indicadores de Paso */}
        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.primary }]} />
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.backgroundSelected }]} />
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.backgroundSelected }]} />
        </View>

        {/* Título de Paso */}
        <Text style={styles.stepTitle}>PASO 1 - DATOS PERSONALES</Text>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOMBRE</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan"
              placeholderTextColor={Colors.dark.textSecondary}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>APELLIDO</Text>
            <TextInput
              style={styles.input}
              placeholder="Pérez"
              placeholderTextColor={Colors.dark.textSecondary}
              value={apellido}
              onChangeText={setApellido}
              autoCapitalize="words"
            />
          </View>

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
            <Text style={styles.label}>NÚMERO DE DNI</Text>
            <TextInput
              style={styles.input}
              placeholder="12345678"
              placeholderTextColor={Colors.dark.textSecondary}
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
            />
          </View>

          {/* Botón Continuar */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // Bypass de validación para permitir la navegación directa durante pruebas
              registrationStore.set({ nombre, apellido, email, telefono, dni });
              router.push('/(auth)/register-step1');
            }}
          >
            <Text style={styles.buttonText}>CONTINUAR</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
