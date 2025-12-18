// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Empleado = {
  nombre?: string;
  email?: string;
};

function EmpleadoPanelContent() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fontFamily = Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif';
  const [usuario, setUsuario] = useState<Empleado | null>(null);
  const [tareas, setTareas] = useState(0);
  const [reportes, setReportes] = useState(0);
  const [reportesTerminados, setReportesTerminados] = useState(0);
  const [tareasTerminadas, setTareasTerminadas] = useState(0);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          setUsuario(userData);
        } else {
          router.replace('/');
        }
      } catch (error) {
        router.replace('/');
      }
    };
    obtenerUsuario();
  }, [router]);

  const initials = useMemo(() => {
    const nombre = usuario?.nombre?.trim();
    if (!nombre) return 'EM';
    return nombre
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }, [usuario?.nombre]);

  const stats = [
    {
      label: 'Tareas',
      value: tareas,
      iconBg: '#ec4899',
      iconName: 'checkmark-circle-outline' as const,
      accent: '#f472b6',
    },
    {
      label: 'Reportes',
      value: reportes,
      iconBg: '#f59e0b',
      iconName: 'document-text-outline' as const,
      accent: '#fbbf24',
    },
    {
      label: 'Reportes Terminados',
      value: reportesTerminados,
      iconBg: '#10b981',
      iconName: 'checkmark-done-outline' as const,
      accent: '#6ee7b7',
    },
    {
      label: 'Tareas Terminadas',
      value: tareasTerminadas,
      iconBg: '#3b82f6',
      iconName: 'star-outline' as const,
      accent: '#93c5fd',
    },
  ];

  const menuOptions = [
    {
      title: 'Reportes',
      description: 'Crear y visualizar reportes',
      gradientStart: '#ec4899',
      gradientEnd: '#f472b6',
      iconName: 'document-text' as const,
    },
    {
      title: 'Historial de Reportes',
      description: 'Consultar reportes anteriores',
      gradientStart: '#f59e0b',
      gradientEnd: '#fbbf24',
      iconName: 'time' as const,
    },
    {
      title: 'Tareas',
      description: 'Ver mis tareas asignadas',
      gradientStart: '#3b82f6',
      gradientEnd: '#60a5fa',
      iconName: 'checkmark-circle' as const,
    },
    {
      title: 'Historial de Tareas',
      description: 'Consultar tareas completadas',
      gradientStart: '#10b981',
      gradientEnd: '#6ee7b7',
      iconName: 'archive' as const,
    },
    {
      title: 'Generar inventario',
      description: 'Reporte de inventario del establecimiento',
      gradientStart: '#8b5cf6',
      gradientEnd: '#c4b5fd',
      iconName: 'cube' as const,
    },
  ];

  const handleMenuPress = (title: string) => {
    // TODO: Implement navigation to respective screens
    console.log('Pressed:', title);
  };

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
      <ScrollView
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
          <View style={styles.headerLeft}>
            <View style={styles.badgeWrapper}>
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.badge, isMobile && styles.badgeMobile]}
              >
                <Text style={styles.badgeText}>{initials}</Text>
              </LinearGradient>
              <View style={styles.badgeDot} />
            </View>
            <View style={styles.welcomeTextWrapper}>
              <Text
                style={[styles.welcomeTitle, isMobile && styles.welcomeTitleMobile]}
                numberOfLines={1}
              >
                Bienvenido <Text style={styles.welcomeName}>{usuario?.nombre ?? 'Empleado'}</Text>
              </Text>
              <Text style={styles.welcomeSubtitle}>Panel de empleado</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogout(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCardVertical}>
              <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                <Ionicons name={stat.iconName} size={28} color="#fff" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={styles.statChipText}>Hoy</Text>
            </View>
          ))}
        </View>

        {/* Menu Options */}
        <View style={styles.padding}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
              Opciones
            </Text>
            <Text style={styles.sectionSubtitle}>Gestiona tus reportes y tareas</Text>
          </View>

          <View style={[styles.optionsGrid, isMobile && styles.optionsGridMobile]}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionTouchable, isMobile && styles.optionTouchableMobile]}
                activeOpacity={0.8}
                onPress={() => handleMenuPress(option.title)}
              >
                <LinearGradient
                  colors={[option.gradientStart, option.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionCard}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIconWrapper}>
                      <Ionicons name={option.iconName} size={28} color="#fff" />
                    </View>
                    <View style={styles.optionTextWrapper}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      {showLogout && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isMobile && styles.modalContentMobile]}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-out" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Cerrar sesión</Text>
            <Text style={styles.modalText}>¿Estás seguro de que deseas cerrar tu sesión?</Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogout(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function EmpleadoPanel() {
  return <EmpleadoPanelContent />;
}

const styles = StyleSheet.create({
  padding: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerRowMobile: {
    marginBottom: 24,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  badgeWrapper: { position: 'relative', marginRight: 16 },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  badgeMobile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    shadowRadius: 10,
  },
  badgeText: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  badgeDot: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: '#10b981',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#020617',
  },
  welcomeTextWrapper: { flex: 1 },
  welcomeTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  welcomeTitleMobile: { fontSize: 20 },
  welcomeName: { color: '#22d3ee', fontWeight: '800' },
  welcomeSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCardVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.5)',
    padding: 16,
    gap: 16,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
  },
  statChipText: { color: '#cbd5e1', fontSize: 11, fontWeight: '600' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  sectionHeader: { marginBottom: 20 },
  sectionHeaderMobile: { marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  sectionTitleMobile: { fontSize: 22, marginBottom: 4 },
  sectionSubtitle: { color: '#94a3b8', fontSize: 13 },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    rowGap: 20,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  optionsGridMobile: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 8,
  },
  optionTouchable: {
    width: '48%',
    minHeight: 150,
  },
  optionTouchableMobile: {
    width: '100%',
  },
  optionCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    flex: 1,
    justifyContent: 'space-between',
  },
  optionContent: { flexDirection: 'row', alignItems: 'flex-start' },
  optionIconWrapper: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  optionTextWrapper: { flex: 1 },
  optionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  optionDescription: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 32,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  modalContentMobile: {
    maxWidth: '85%',
    padding: 24,
    borderRadius: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelButtonText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

