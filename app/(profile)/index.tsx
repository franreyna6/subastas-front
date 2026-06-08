import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { authApi } from '@/lib/api/auth.api';
import { pagosApi } from '@/lib/api/pagos.api';
import { api } from '@/lib/api/apiClient';
import { authStore } from '@/lib/store/authStore';
import { MOCK_PAGOS, MOCK_STATS } from '@/lib/mock/mockData';
import CategoryInfoModal from '@/components/CategoryInfoModal';

interface Perfil {
  nombre: string;
  email: string;
  categoria: string | null;
  rol: string;
}

interface Stats {
  subastas: number;
  ganadas: number;
  totalGastado: number;
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [perfil, setPerfil]         = useState<Perfil | null>(null);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [totalPagos, setTotalPagos] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [showCatModal, setShowCatModal] = useState(false);

  const load = useCallback(async () => {
    const sesion = await authStore.get();

    if (authStore.isPrueba(sesion)) {
      setPerfil({ nombre: sesion!.nombre, email: 'prueba@subastas.com', categoria: sesion!.categoria ?? 'platino', rol: 'cliente' });
      setStats(MOCK_STATS);
      setTotalPagos(MOCK_PAGOS.length);
    } else {
      const [meRes, pagosRes, statsRes] = await Promise.all([
        api.get<Perfil>('/api/auth/me'),
        pagosApi.listar(),
        api.get<Stats>('/api/perfil/stats'),
      ]);
      if (meRes.data)    setPerfil(meRes.data);
      if (pagosRes.data) setTotalPagos(pagosRes.data.length);
      if (statsRes.data) setStats(statsRes.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => {
    await authApi.logout();
    router.replace('/(auth)/login');
  };

  const initials = perfil?.nombre
    ? perfil.nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const goHistory = () => router.push('/(profile)/metrics');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Header del perfil */}
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.profileName}>{perfil?.nombre?.toUpperCase() ?? ''}</Text>
              <Text style={styles.profileEmail}>{perfil?.email ?? ''}</Text>
              {perfil?.categoria && (
                <TouchableOpacity style={styles.categoryBadge} onPress={() => setShowCatModal(true)}>
                  <Text style={styles.categoryBadgeText}>CATEGORÍA {perfil.categoria.toUpperCase()}</Text>
                  <Ionicons name="information-circle-outline" size={14} color="#A2B0C4" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </View>

            {/* Stats clicables → historial */}
            <View style={styles.statsGrid}>
              <TouchableOpacity style={styles.statCard} onPress={goHistory} activeOpacity={0.7}>
                <Text style={styles.statValue}>{stats?.subastas ?? '—'}</Text>
                <Text style={styles.statLabel}>SUBASTAS</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.dark.textSecondary} style={styles.statArrow} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.statCard} onPress={goHistory} activeOpacity={0.7}>
                <Text style={styles.statValue}>{stats?.ganadas ?? '—'}</Text>
                <Text style={styles.statLabel}>GANADAS</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.dark.textSecondary} style={styles.statArrow} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.statCard} onPress={goHistory} activeOpacity={0.7}>
                <Text style={styles.statValue}>{stats ? formatMoney(stats.totalGastado) : '—'}</Text>
                <Text style={styles.statLabel}>TOTAL GASTADO</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.dark.textSecondary} style={styles.statArrow} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(profile)/payments')} activeOpacity={0.7}>
                <Text style={styles.statValue}>{totalPagos}</Text>
                <Text style={styles.statLabel}>MEDIOS DE PAGO</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.dark.textSecondary} style={styles.statArrow} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Menú */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(buyer)/dashboard')}>
            <Text style={styles.menuItemText}>Inicio</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(profile)/payments')}>
            <Text style={styles.menuItemText}>Medios de pago</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(seller)/my-items')}>
            <Text style={styles.menuItemText}>Mis artículos a subastar</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(profile)/metrics')}>
            <Text style={styles.menuItemText}>Historial de subastas</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(profile)/victories')}>
            <Text style={styles.menuItemText}>Mis victorias pendientes</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(profile)/fines')}>
            <Text style={styles.menuItemText}>Multas y bloqueos</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

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

      {showCatModal && perfil?.categoria && (
        <CategoryInfoModal
          categoria={perfil.categoria}
          visible={showCatModal}
          onClose={() => setShowCatModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: 100 },
  profileHeader: { alignItems: 'center', paddingVertical: Spacing.four, backgroundColor: '#0F182F', borderRadius: 16, marginBottom: Spacing.four },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.dark.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.three },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  profileName:  { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: Colors.dark.textSecondary, marginBottom: Spacing.three },
  categoryBadge: { backgroundColor: '#24335C', paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: 20 },
  categoryBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#A2B0C4' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.three, marginBottom: Spacing.five },
  statCard: { width: '47%', backgroundColor: Colors.dark.backgroundElement, borderRadius: 12, padding: Spacing.three },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.dark.primary, marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.dark.text },
  statArrow: { position: 'absolute', top: Spacing.three, right: Spacing.three },
  menuContainer: { backgroundColor: Colors.dark.backgroundElement, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.four, paddingHorizontal: Spacing.four, borderBottomWidth: 1, borderBottomColor: '#242F50' },
  menuItemText: { fontSize: 15, color: '#FFFFFF' },
  logoutItem: { borderBottomWidth: 0 },
  logoutText: { fontSize: 15, color: Colors.dark.primary, fontWeight: '600' },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: '#0C111F', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#171B30' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 10, fontWeight: 'bold', color: Colors.dark.textSecondary, marginTop: 4 },
});
