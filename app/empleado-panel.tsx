// @ts-nocheck
import { actualizarEstadoReporteAsignado, obtenerReportesAsignados } from '@/lib/reportes';
import { actualizarEstadoTarea, obtenerTareasEmpleado } from '@/lib/tareas';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [showTareasModal, setShowTareasModal] = useState(false);
  const [listaTareas, setListaTareas] = useState<any[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [showTareaDetalle, setShowTareaDetalle] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<any>(null);
  const [actualizandoTarea, setActualizandoTarea] = useState(false);
  const [showHistorialTareasModal, setShowHistorialTareasModal] = useState(false);
  const [listaTareasTerminadas, setListaTareasTerminadas] = useState<any[]>([]);
  const [loadingHistorialTareas, setLoadingHistorialTareas] = useState(false);
  const [showReportesModal, setShowReportesModal] = useState(false);
  const [listaReportes, setListaReportes] = useState<any[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [showReporteDetalle, setShowReporteDetalle] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
  const [actualizandoReporte, setActualizandoReporte] = useState(false);
  const [showHistorialReportesModal, setShowHistorialReportesModal] = useState(false);
  const [listaReportesTerminados, setListaReportesTerminados] = useState<any[]>([]);
  const [loadingHistorialReportes, setLoadingHistorialReportes] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      if (usuario?.email) {
        cargarTareas();
        cargarReportes();
      }
    }, [usuario?.email])
  );

  const cargarTareas = async () => {
    if (!usuario?.email) return;
    setLoadingTareas(true);
    try {
      const { success, data } = await obtenerTareasEmpleado(usuario.email);
      if (success) {
        // Solo mostrar tareas pendientes, no las completadas
        const tareasActivas = data?.filter((t: any) => t.estado === 'pendiente') || [];
        setListaTareas(tareasActivas);
        const pendientes = tareasActivas.length;
        const terminadas = data?.filter((t: any) => t.estado === 'completada').length || 0;
        setTareas(pendientes);
        setTareasTerminadas(terminadas);
      }
    } catch (error) {
      console.error('Error cargando tareas:', error);
    } finally {
      setLoadingTareas(false);
    }
  };

  const marcarComoCompletada = async () => {
    if (!tareaSeleccionada?.id) return;
    
    setActualizandoTarea(true);
    try {
      const { success } = await actualizarEstadoTarea(tareaSeleccionada.id, 'completada');
      if (success) {
        // Actualizar la tarea en la lista local
        const tareasActualizadas = listaTareas.map((t: any) =>
          t.id === tareaSeleccionada.id ? { ...t, estado: 'completada' } : t
        );
        setListaTareas(tareasActualizadas);
        
        // Actualizar stats
        const pendientes = tareasActualizadas.filter((t: any) => t.estado === 'pendiente').length;
        const terminadas = tareasActualizadas.filter((t: any) => t.estado === 'completada').length;
        setTareas(pendientes);
        setTareasTerminadas(terminadas);
        
        // Cerrar modales
        setShowTareaDetalle(false);
        setTareaSeleccionada(null);
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    } finally {
      setActualizandoTarea(false);
    }
  };

  const cargarTareasTerminadas = async () => {
    if (!usuario?.email) return;
    setLoadingHistorialTareas(true);
    try {
      const { success, data } = await obtenerTareasEmpleado(usuario.email);
      if (success) {
        const terminadas = data?.filter((t: any) => t.estado === 'completada') || [];
        setListaTareasTerminadas(terminadas);
      }
    } catch (error) {
      console.error('Error cargando tareas terminadas:', error);
    } finally {
      setLoadingHistorialTareas(false);
    }
  };

  const cargarReportes = async () => {
    if (!usuario?.email) return;
    setLoadingReportes(true);
    try {
      const { success, data } = await obtenerReportesAsignados(usuario.email);
      if (success) {
        // Solo mostrar reportes en_proceso, no los terminados
        const reportesActivos = data?.filter((r: any) => r.estado === 'en_proceso') || [];
        setListaReportes(reportesActivos);
        const pendientes = reportesActivos.length;
        const terminados = data?.filter((r: any) => r.estado === 'terminado').length || 0;
        setReportes(pendientes);
        setReportesTerminados(terminados);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoadingReportes(false);
    }
  };

  const cargarReportesTerminados = async () => {
    if (!usuario?.email) return;
    setLoadingHistorialReportes(true);
    try {
      const { success, data } = await obtenerReportesAsignados(usuario.email);
      if (success) {
        const terminados = data?.filter((r: any) => r.estado === 'terminado') || [];
        setListaReportesTerminados(terminados);
      }
    } catch (error) {
      console.error('Error cargando reportes terminados:', error);
    } finally {
      setLoadingHistorialReportes(false);
    }
  };

  const actualizarEstadoReporte = async (nuevoEstado: string) => {
    if (!reporteSeleccionado?.id) return;
    
    setActualizandoReporte(true);
    try {
      const { success } = await actualizarEstadoReporteAsignado(reporteSeleccionado.id, nuevoEstado);
      if (success) {
        const reportesActualizados = listaReportes.map((r: any) =>
          r.id === reporteSeleccionado.id ? { ...r, estado: nuevoEstado } : r
        );
        setListaReportes(reportesActualizados);
        
        const pendientes = reportesActualizados.filter((r: any) => r.estado === 'en_proceso').length;
        const terminados = reportesActualizados.filter((r: any) => r.estado === 'terminado').length;
        setReportes(pendientes);
        setReportesTerminados(terminados);
        
        setShowReporteDetalle(false);
        setReporteSeleccionado(null);
      }
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
    } finally {
      setActualizandoReporte(false);
    }
  };

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
    if (title === 'Tareas') {
      setShowTareasModal(true);
    } else if (title === 'Historial de Tareas') {
      cargarTareasTerminadas();
      setShowHistorialTareasModal(true);
    } else if (title === 'Reportes') {
      cargarReportes();
      setShowReportesModal(true);
    } else if (title === 'Historial de Reportes') {
      cargarReportesTerminados();
      setShowHistorialReportesModal(true);
    } else {
      console.log('Pressed:', title);
    }
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
        <View style={[styles.container, isMobile && styles.containerMobile]}>
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
        <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, isMobile && styles.statCardMobile]}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                  <Ionicons name={stat.iconName} size={24} color="#fff" />
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statChipText}>Hoy</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
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

      {showTareasModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.tareasModalContent, isMobile && styles.tareasModalContentMobile]}>
            <View style={styles.tareasModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: 12, padding: 8 }}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#3b82f6" />
                </View>
                <Text style={[styles.tareasModalTitle, { fontFamily }]}>Mis Tareas</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTareasModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {loadingTareas ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando tareas...</Text>
              </View>
            ) : listaTareas.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="checkmark-done" size={48} color="#6ee7b7" style={{ marginBottom: 12 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 14, textAlign: 'center' }, { fontFamily }]}>
                  No tienes tareas asignadas
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.tareasList} showsVerticalScrollIndicator={false}>
                {listaTareas.map((tarea: any, index: number) => {
                  const estadoColor =
                    tarea.estado === 'pendiente'
                      ? '#fbbf24'
                      : tarea.estado === 'en_proceso'
                        ? '#3b82f6'
                        : tarea.estado === 'completada'
                          ? '#10b981'
                          : '#ef4444';

                  const estadoLabel =
                    tarea.estado === 'pendiente'
                      ? 'Pendiente'
                      : tarea.estado === 'en_proceso'
                        ? 'En Proceso'
                        : tarea.estado === 'completada'
                          ? 'Completada'
                          : 'Rechazada';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.tareaCard,
                        {
                          borderLeftWidth: 4,
                          borderLeftColor: estadoColor,
                        },
                      ]}
                      onPress={() => {
                        setTareaSeleccionada(tarea);
                        setShowTareaDetalle(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.tareaAdmin, { fontFamily }]}>Asignada por: {tarea.admin_nombre}</Text>
                          <Text style={[styles.tareaDescripcion, { fontFamily }]}>{tarea.descripcion}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[{ color: '#cbd5e1', fontSize: 12 }, { fontFamily }]}>
                          {new Date(tarea.created_at).toLocaleDateString('es-ES')}
                        </Text>
                        <View style={[styles.estadoBadge, { backgroundColor: `${estadoColor}20` }]}>
                          <Text style={[styles.estadoBadgeText, { color: estadoColor }]}>{estadoLabel}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.tareaCloseButton]}
              onPress={() => setShowTareasModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.tareaCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showTareaDetalle && tareaSeleccionada && (
        <View style={styles.modalOverlay}>
          <View style={[styles.detalleModalContent, isMobile && styles.detalleModalContentMobile]}>
            <View style={styles.detalleModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: 12, padding: 8 }}>
                  <Ionicons name="document-text-outline" size={24} color="#3b82f6" />
                </View>
                <Text style={[styles.detalleModalTitle, { fontFamily }]}>Detalles de Tarea</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowTareaDetalle(false); setTareaSeleccionada(null); }} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Asignada por</Text>
                <Text style={[styles.detalleValue, { fontFamily }]}>{tareaSeleccionada.admin_nombre}</Text>
              </View>

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Email del Admin</Text>
                <Text style={[styles.detalleValue, { fontFamily }]}>{tareaSeleccionada.admin_email}</Text>
              </View>

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Descripción</Text>
                <View style={styles.detalleTextBox}>
                  <Text style={[styles.detalleValueText, { fontFamily }]}>{tareaSeleccionada.descripcion}</Text>
                </View>
              </View>

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Fecha de Asignación</Text>
                <Text style={[styles.detalleValue, { fontFamily }]}>
                  {new Date(tareaSeleccionada.created_at).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Estado Actual</Text>
                <View style={{ 
                  backgroundColor: tareaSeleccionada.estado === 'pendiente' 
                    ? '#fbbf2420' 
                    : tareaSeleccionada.estado === 'en_proceso'
                      ? '#3b82f620'
                      : '#10b98120',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={[{ 
                    color: tareaSeleccionada.estado === 'pendiente' 
                      ? '#fbbf24' 
                      : tareaSeleccionada.estado === 'en_proceso'
                        ? '#3b82f6'
                        : '#10b981',
                    fontWeight: '700'
                  }, { fontFamily }]}>
                    {tareaSeleccionada.estado === 'pendiente' 
                      ? 'Pendiente'
                      : tareaSeleccionada.estado === 'en_proceso'
                        ? 'En Proceso'
                        : 'Completada'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.modalButton, styles.detalleCancelButton, { flex: 1 }]}
                onPress={() => { setShowTareaDetalle(false); setTareaSeleccionada(null); }}
                activeOpacity={0.7}
                disabled={actualizandoTarea}
              >
                <Text style={styles.detalleCancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
              
              {tareaSeleccionada.estado !== 'completada' && (
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.modalButton, { flex: 1 }]}
                >
                  <TouchableOpacity
                    onPress={marcarComoCompletada}
                    activeOpacity={0.85}
                    disabled={actualizandoTarea}
                  >
                    <Text style={[styles.detalleCompleteButtonText, { fontFamily }]}>
                      {actualizandoTarea ? 'Actualizando...' : '✓ Marcar Completada'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          </View>
        </View>
      )}

      {showHistorialTareasModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.tareasModalContent, isMobile && styles.tareasModalContentMobile]}>
            <View style={styles.tareasModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: 8 }}>
                  <Ionicons name="archive-outline" size={24} color="#10b981" />
                </View>
                <Text style={[styles.tareasModalTitle, { fontFamily }]}>Historial de Tareas</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistorialTareasModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {loadingHistorialTareas ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando historial...</Text>
              </View>
            ) : listaTareasTerminadas.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="folder-open-outline" size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 14, textAlign: 'center' }, { fontFamily }]}>
                  No hay tareas completadas
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.tareasList} showsVerticalScrollIndicator={false}>
                {listaTareasTerminadas.map((tarea: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tareaCard,
                      {
                        borderLeftWidth: 4,
                        borderLeftColor: '#10b981',
                      },
                    ]}
                    onPress={() => {
                      setTareaSeleccionada(tarea);
                      setShowHistorialTareasModal(false);
                      setShowTareaDetalle(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.tareaAdmin, { fontFamily }]}>Asignada por: {tarea.admin_nombre}</Text>
                        <Text style={[styles.tareaDescripcion, { fontFamily }]}>{tarea.descripcion}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: 12 }, { fontFamily }]}>
                        {new Date(tarea.created_at).toLocaleDateString('es-ES')}
                      </Text>
                      <View style={[styles.estadoBadge, { backgroundColor: '#10b98120' }]}>
                        <Text style={[styles.estadoBadgeText, { color: '#10b981' }]}>Completada</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.tareaCloseButton]}
              onPress={() => setShowHistorialTareasModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.tareaCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal de Reportes Asignados */}
      {showReportesModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.reportesModalContent, isMobile && styles.reportesModalContentMobile]}>
            <View style={styles.reportesModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 12, padding: 8 }}>
                  <Ionicons name="document-text-outline" size={24} color="#f59e0b" />
                </View>
                <Text style={[styles.reportesModalTitle, { fontFamily }]}>Mis Reportes Asignados</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReportesModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {loadingReportes ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando reportes...</Text>
              </View>
            ) : listaReportes.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="document-text-outline" size={48} color="#94a3b8" style={{ marginBottom: 12, opacity: 0.5 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 14, textAlign: 'center' }, { fontFamily }]}>
                  No tienes reportes asignados
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.reportesList} showsVerticalScrollIndicator={false}>
                {listaReportes.map((reporte: any) => {
                  const estadoColor = 
                    reporte.estado === 'terminado' ? '#10b981' :
                    reporte.estado === 'en_proceso' ? '#3b82f6' :
                    '#f59e0b';
                  
                  return (
                    <TouchableOpacity
                      key={reporte.id}
                      style={[
                        styles.reporteCard,
                        {
                          borderLeftWidth: 4,
                          borderLeftColor: estadoColor,
                        },
                      ]}
                      onPress={() => {
                        setReporteSeleccionado(reporte);
                        setShowReporteDetalle(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.reporteEquipo, { fontFamily }]}>{reporte.equipo_descripcion}</Text>
                          <Text style={[styles.reporteUsuario, { fontFamily }]}>Reportado por: {reporte.usuario_nombre}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[{ color: '#cbd5e1', fontSize: 12 }, { fontFamily }]}>
                          {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                        </Text>
                        <View style={[styles.estadoBadge, { backgroundColor: `${estadoColor}20` }]}>
                          <Text style={[styles.estadoBadgeText, { color: estadoColor }]}>
                            {reporte.estado === 'en_proceso' ? 'En Proceso' : reporte.estado === 'terminado' ? 'Terminado' : 'Pendiente'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.reporteCloseButton]}
              onPress={() => setShowReportesModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.reporteCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showReporteDetalle && reporteSeleccionado && (
        <View style={styles.modalOverlay}>
          <View style={[styles.detalleModalContent, isMobile && styles.detalleModalContentMobile]}>
            <View style={styles.detalleModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 12, padding: 8 }}>
                  <Ionicons name="document-text-outline" size={24} color="#f59e0b" />
                </View>
                <Text style={[styles.detalleModalTitle, { fontFamily }]}>Detalles del Reporte</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowReporteDetalle(false); setReporteSeleccionado(null); }} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Equipo/Servicio</Text>
                <Text style={[styles.detalleValue, { fontFamily }]}>{reporteSeleccionado.equipo_descripcion}</Text>
              </View>

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Reportado por</Text>
                <Text style={[styles.detalleValue, { fontFamily }]}>{reporteSeleccionado.usuario_nombre}</Text>
              </View>

              {reporteSeleccionado.equipo_modelo && (
                <View style={styles.detalleField}>
                  <Text style={[styles.detalleLabel, { fontFamily }]}>Modelo</Text>
                  <Text style={[styles.detalleValue, { fontFamily }]}>{reporteSeleccionado.equipo_modelo}</Text>
                </View>
              )}

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Comentario</Text>
                <View style={styles.detalleTextBox}>
                  <Text style={[styles.detalleValueText, { fontFamily }]}>{reporteSeleccionado.comentario}</Text>
                </View>
              </View>

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Fecha de Reporte</Text>
                <Text style={[styles.detalleValue, { fontFamily }]}>
                  {new Date(reporteSeleccionado.created_at).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.detalleField}>
                <Text style={[styles.detalleLabel, { fontFamily }]}>Estado Actual</Text>
                <View style={{ 
                  backgroundColor: reporteSeleccionado.estado === 'en_proceso' 
                    ? '#3b82f620' 
                    : reporteSeleccionado.estado === 'terminado'
                      ? '#10b98120'
                      : '#f5a62420',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={[{ 
                    color: reporteSeleccionado.estado === 'en_proceso' 
                      ? '#3b82f6' 
                      : reporteSeleccionado.estado === 'terminado'
                        ? '#10b981'
                        : '#f59e0b',
                    fontWeight: '700'
                  }, { fontFamily }]}>
                    {reporteSeleccionado.estado === 'en_proceso' 
                      ? 'En Proceso'
                      : reporteSeleccionado.estado === 'terminado'
                        ? 'Terminado'
                        : 'Pendiente'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.modalButton, styles.detalleCancelButton, { flex: 1 }]}
                onPress={() => { setShowReporteDetalle(false); setReporteSeleccionado(null); }}
                activeOpacity={0.7}
                disabled={actualizandoReporte}
              >
                <Text style={styles.detalleCancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
              
              {reporteSeleccionado.estado === 'en_proceso' && (
                <LinearGradient
                  colors={['#f59e0b', '#f97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}
                >
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: 'transparent' }]}
                    onPress={() => actualizarEstadoReporte('terminado')}
                    disabled={actualizandoReporte}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.detalleCancelButtonText, { color: '#fff' }]}>
                      {actualizandoReporte ? 'Actualizando...' : 'Marcar Terminado'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Modal de Historial de Reportes */}
      {showHistorialReportesModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.reportesModalContent, isMobile && styles.reportesModalContentMobile]}>
            <View style={styles.reportesModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: 8 }}>
                  <Ionicons name="checkmark-done-outline" size={24} color="#10b981" />
                </View>
                <Text style={[styles.reportesModalTitle, { fontFamily }]}>Historial de Reportes</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistorialReportesModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {loadingHistorialReportes ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando historial...</Text>
              </View>
            ) : listaReportesTerminados.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="archive-outline" size={48} color="#94a3b8" style={{ marginBottom: 12, opacity: 0.5 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 14, textAlign: 'center' }, { fontFamily }]}>
                  No hay reportes terminados
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.reportesList} showsVerticalScrollIndicator={false}>
                {listaReportesTerminados.map((reporte: any) => (
                  <TouchableOpacity
                    key={reporte.id}
                    style={[
                      styles.reporteCard,
                      {
                        borderLeftWidth: 4,
                        borderLeftColor: '#10b981',
                      },
                    ]}
                    onPress={() => {
                      setReporteSeleccionado(reporte);
                      setShowHistorialReportesModal(false);
                      setShowReporteDetalle(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reporteEquipo, { fontFamily }]}>{reporte.equipo_descripcion}</Text>
                        <Text style={[styles.reporteUsuario, { fontFamily }]}>Reportado por: {reporte.usuario_nombre}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: 12 }, { fontFamily }]}>
                        {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                      </Text>
                      <View style={[styles.estadoBadge, { backgroundColor: '#10b98120' }]}>
                        <Text style={[styles.estadoBadgeText, { color: '#10b981' }]}>
                          Terminado
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.reporteCloseButton]}
              onPress={() => setShowHistorialReportesModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.reporteCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 28,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  containerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
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
  statsRow: {
    marginBottom: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  statsRowMobile: {
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flexBasis: 'calc(25% - 15px)',
    flexGrow: 1,
    minWidth: 180,
    backgroundColor: 'rgba(30,41,59,0.4)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(51,65,85,0.5)',
    padding: 24,
  },
  statCardMobile: {
    flexBasis: '100%',
    minWidth: 'auto',
    borderRadius: 16,
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  statChip: {
    backgroundColor: 'rgba(51,65,85,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statChipText: { color: '#cbd5e1', fontSize: 11, fontWeight: '600' },
  statValue: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
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
  tareasModalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    maxWidth: 600,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  tareasModalContentMobile: {
    maxWidth: '90%',
    maxHeight: '85%',
    padding: 16,
  },
  tareasModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tareasModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tareasList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  tareaCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderColor: '#1e293b',
  },
  tareaAdmin: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tareaDescripcion: {
    color: '#f0f9ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  estadoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tareaCloseButton: {
    backgroundColor: '#1f2937',
    borderColor: '#334155',
  },
  tareaCloseButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  reportesModalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    maxWidth: 600,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  reportesModalContentMobile: {
    maxWidth: '90%',
    maxHeight: '85%',
    padding: 16,
  },
  reportesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  reportesModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  reportesList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  reporteCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderColor: '#1e293b',
  },
  reporteEquipo: {
    color: '#f0f9ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reporteUsuario: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  reporteCloseButton: {
    backgroundColor: '#1f2937',
    borderColor: '#334155',
  },
  reporteCloseButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  detalleModalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    maxWidth: 600,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  detalleModalContentMobile: {
    maxWidth: '90%',
    maxHeight: '90%',
    padding: 16,
  },
  detalleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  detalleModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  detalleField: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  detalleLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detalleValue: {
    color: '#f0f9ff',
    fontSize: 15,
    fontWeight: '500',
  },
  detalleValueText: {
    color: '#f0f9ff',
    fontSize: 14,
  },
  detalleTextBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 6,
  },
  detalleCancelButton: {
    backgroundColor: '#1f2937',
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detalleCancelButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  detalleCompleteButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detalleCompleteButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});

