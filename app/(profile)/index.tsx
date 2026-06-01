import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Volver a login
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cabecera del Perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CM</Text>
          </View>
          <Text style={styles.profileName}>CARLOS MENDEZ</Text>
          <Text style={styles.profileEmail}>carlos@email.com</Text>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>CATEGORÍA PLATA</Text>
          </View>
        </View>

        {/* Grilla de Estadísticas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>9</Text>
            <Text style={styles.statLabel}>SUBASTAS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>GANADAS</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>$274K</Text>
            <Text style={styles.statLabel}>TOTAL GASTADO</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>MEDIOS DE PAGO</Text>
          </View>
        </View>

        {/* Menú de Opciones */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(buyer)/dashboard')}
          >
            <Text style={styles.menuItemText}>Inicio</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(profile)/payments')}
          >
            <Text style={styles.menuItemText}>Medios de pago</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(seller)/my-items')}
          >
            <Text style={styles.menuItemText}>Mis artículos a subastar</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(profile)/fines')}
          >
            <Text style={styles.menuItemText}>Multas y bloqueos</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Simulada para coincidir con Figma) */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(buyer)/dashboard')}>
          <Ionicons name="home-outline" size={24} color={Colors.dark.textSecondary} />
          <Text style={styles.navText}>INICIO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(profile)/metrics')}>
          <Ionicons name="time-outline" size={24} color={Colors.dark.textSecondary} />
          <Text style={styles.navText}>HISTORIAL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(profile)')}>
          <Ionicons name="person" size={24} color={Colors.dark.primary} />
          <Text style={[styles.navText, { color: Colors.dark.primary }]}>PERFIL</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    backgroundColor: '#0F182F', // Fondo ligeramente más claro del header
    borderRadius: 16,
    marginBottom: Spacing.four,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.three,
  },
  categoryBadge: {
    backgroundColor: '#24335C', // Fondo del badge en el perfil
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#A2B0C4', // Texto del badge
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  menuContainer: {
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#242F50',
  },
  menuItemText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 15,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#0C111F',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#171B30',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
});
