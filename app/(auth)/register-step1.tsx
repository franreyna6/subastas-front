import React, { useState } from 'react';
import {
  StyleSheet, Text, TextInput, TouchableOpacity,
  View, ScrollView, Image, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing } from '@/constants/theme';
import { registrationStore } from '@/lib/store/registrationStore';

async function pickFromCamera(onUri: (uri: string) => void) {
  const { granted } = await ImagePicker.requestCameraPermissionsAsync();
  if (!granted) {
    Alert.alert('Permiso denegado', 'Habilitá el acceso a la cámara en los ajustes.');
    return;
  }
  const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
  if (!result.canceled) onUri(result.assets[0].uri);
}

async function pickFromGallery(onUri: (uri: string) => void) {
  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!granted) {
    Alert.alert('Permiso denegado', 'Habilitá el acceso a las fotos en los ajustes.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
  if (!result.canceled) onUri(result.assets[0].uri);
}

function PhotoSlot({ label, uri, onCamera, onGallery }: {
  label: string;
  uri: string | null;
  onCamera: () => void;
  onGallery: () => void;
}) {
  return (
    <View style={slot.wrapper}>
      <Text style={slot.title}>{label}</Text>

      {uri ? (
        <View style={slot.preview}>
          <Image source={{ uri }} style={slot.image} />
          <Ionicons name="checkmark-circle" size={24} color={Colors.dark.success} style={slot.check} />
        </View>
      ) : (
        <View style={slot.placeholder}>
          <Ionicons name="image-outline" size={36} color={Colors.dark.textSecondary} />
        </View>
      )}

      <View style={slot.buttons}>
        <TouchableOpacity style={slot.btn} onPress={onCamera}>
          <Ionicons name="camera" size={18} color="#FFFFFF" />
          <Text style={slot.btnText}>Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[slot.btn, slot.btnSecondary]} onPress={onGallery}>
          <Ionicons name="images" size={18} color={Colors.dark.primary} />
          <Text style={[slot.btnText, { color: Colors.dark.primary }]}>Galería</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RegisterStep1Screen() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Argentina');
  const [fotoFrente, setFotoFrente] = useState<string | null>(null);
  const [fotoDorso, setFotoDorso] = useState<string | null>(null);

  const handleContinue = () => {
    if (!address.trim() || !country.trim()) {
      Alert.alert('Campos requeridos', 'Completá domicilio y país.');
      return;
    }
    if (!fotoFrente || !fotoDorso) {
      Alert.alert('Fotos requeridas', 'Subí la foto del frente y dorso de tu DNI.');
      return;
    }
    registrationStore.set({ address, country, fotoDniFrente: fotoFrente, fotoDniDorso: fotoDorso });
    router.push('/(auth)/register-step2');
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
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.primary }]} />
          <View style={[styles.stepPill, { backgroundColor: Colors.dark.backgroundSelected }]} />
        </View>

        <Text style={styles.stepTitle}>PASO 2 - DOMICILIO Y DOCUMENTO</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DOMICILIO LEGAL</Text>
            <TextInput
              style={styles.input}
              placeholder="Av. Corrientes 1234, CABA"
              placeholderTextColor={Colors.dark.textSecondary}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAÍS DE ORIGEN</Text>
            <TextInput
              style={styles.input}
              placeholder="Argentina"
              placeholderTextColor={Colors.dark.textSecondary}
              value={country}
              onChangeText={setCountry}
            />
          </View>

          <Text style={styles.label}>FOTO DEL DNI</Text>

          <PhotoSlot
            label="FRENTE"
            uri={fotoFrente}
            onCamera={() => pickFromCamera(setFotoFrente)}
            onGallery={() => pickFromGallery(setFotoFrente)}
          />

          <PhotoSlot
            label="DORSO"
            uri={fotoDorso}
            onCamera={() => pickFromCamera(setFotoDorso)}
            onGallery={() => pickFromGallery(setFotoDorso)}
          />

          <Text style={styles.hint}>
            Las fotos son verificadas por la empresa antes de aprobar tu cuenta.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>CONTINUAR</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const slot = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  title: { fontSize: 11, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1 },
  placeholder: {
    height: 90, borderRadius: 8, borderWidth: 1,
    borderColor: '#242F50', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  preview: { height: 90, borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  check: { position: 'absolute', bottom: 6, right: 6 },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  btn: {
    flex: 1, height: 40, backgroundColor: Colors.dark.primary,
    borderRadius: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1, borderColor: Colors.dark.primary,
  },
  btnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { paddingHorizontal: Spacing.five, paddingBottom: Spacing.six },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three, marginBottom: Spacing.three },
  backButton: { marginRight: Spacing.three },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.two, marginBottom: Spacing.five },
  stepPill: { flex: 1, height: 10, borderRadius: 5 },
  stepTitle: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '700', textAlign: 'center', letterSpacing: 1.5, marginBottom: Spacing.four },
  form: { width: '100%', gap: Spacing.four },
  inputGroup: { width: '100%', gap: Spacing.two },
  label: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600', letterSpacing: 1.5 },
  input: { width: '100%', height: 52, backgroundColor: Colors.dark.backgroundElement, borderRadius: 8, paddingHorizontal: Spacing.three, color: Colors.dark.text, fontSize: 15 },
  hint: { fontSize: 12, color: Colors.dark.textSecondary, lineHeight: 16, textAlign: 'center' },
  button: { width: '100%', height: 52, backgroundColor: Colors.dark.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
