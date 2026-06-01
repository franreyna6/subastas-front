import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

export default function RegisterStep1Screen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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
          <View style={[styles.stepPill, { backgroundColor: '#FF3333' }]} /> {/* Paso 1 activo */}
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.backgroundSelected }]} /> {/* Paso 2 pendiente */}
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.backgroundSelected }]} /> {/* Paso 3 pendiente */}
        </View>

        {/* Título de Paso */}
        <Text style={styles.stepTitle}>PASO 1 - DATOS PERSONALES</Text>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOMBRE Y APELLIDO</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez"
              placeholderTextColor={Colors.dark.textSecondary}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DNI / CUIL / CUIT</Text>
            <TextInput
              style={styles.input}
              placeholder="20-12345678-9"
              placeholderTextColor={Colors.dark.textSecondary}
              value={documentNumber}
              onChangeText={setDocumentNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
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
            <Text style={styles.label}>TELÉFONO DE CONTACTO</Text>
            <TextInput
              style={styles.input}
              placeholder="11 1234 5678"
              placeholderTextColor={Colors.dark.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Botón Continuar */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => router.push('/(auth)/register-step2')}
          >
            <Text style={styles.buttonText}>CONTINUAR</Text>
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
