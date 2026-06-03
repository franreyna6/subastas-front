import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import {
  CATEGORIA_COLOR,
  CATEGORIA_ICON,
  CATEGORIA_PROXIMA,
  CATEGORIA_REQUISITOS,
} from '@/lib/utils/categoria';

interface Props {
  categoria: string;
  visible: boolean;
  onClose: () => void;
}

export default function CategoryInfoModal({ categoria, visible, onClose }: Props) {
  const color    = CATEGORIA_COLOR[categoria]  ?? '#1A3A5C';
  const icon     = CATEGORIA_ICON[categoria]   ?? 'pricetag-outline';
  const proxima  = CATEGORIA_PROXIMA[categoria];
  const requisitos = proxima ? CATEGORIA_REQUISITOS[proxima] : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          {/* Encabezado con color de la categoría */}
          <View style={[styles.header, { backgroundColor: color }]}>
            <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={40} color="rgba(255,255,255,0.9)" />
            <Text style={styles.headerTitle}>CATEGORÍA {categoria.toUpperCase()}</Text>
          </View>

          <View style={styles.body}>
            {requisitos ? (
              <>
                <Text style={styles.sectionLabel}>
                  PARA SUBIR A{' '}
                  <Text style={{ color: CATEGORIA_COLOR[proxima] ?? '#fff' }}>
                    {proxima.toUpperCase()}
                  </Text>
                </Text>
                {requisitos.map((req, i) => (
                  <View key={i} style={styles.reqRow}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={Colors.dark.primary} style={{ marginTop: 1 }} />
                    <Text style={styles.reqText}>{req}</Text>
                  </View>
                ))}
                <Text style={styles.note}>
                  Contactá al equipo de soporte para solicitar la revisión de tu categoría.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.sectionLabel}>CATEGORÍA MÁXIMA</Text>
                <Text style={styles.note}>
                  Ya alcanzaste el nivel más alto. Tenés acceso a todas las subastas de la plataforma.
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>CERRAR</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
  },
  sheet: {
    width: '100%',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  body: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.one,
  },
  reqRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  reqText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.two,
    lineHeight: 18,
  },
  closeBtn: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.four,
    height: 48,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
