// @ts-nocheck
import { getProxyUrl } from '@/lib/cloudflare';
import { actualizarEstadoReporteAsignado, guardarCotizacion as guardarCotizacionDB, obtenerArchivosReporte, obtenerReportesAsignados } from '@/lib/reportes';
import { actualizarEstadoTarea, obtenerTareasEmpleado } from '@/lib/tareas';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
  const [showStats, setShowStats] = useState(true);
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
  const [archivosReporte, setArchivosReporte] = useState<any[]>([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const [showArchivoModal, setShowArchivoModal] = useState(false);
  const [archivoVisualizando, setArchivoVisualizando] = useState<any | null>(null);
  const [showCotizarModal, setShowCotizarModal] = useState(false);
  const [descripcionTrabajo, setDescripcionTrabajo] = useState('');
  const [precioCotizacion, setPrecioCotizacion] = useState('');
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false);
  
  // Estados para Fase 2 (ejecución del trabajo)
  const [revision, setRevision] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [reparacion, setReparacion] = useState('');
  const [recomendacionesAdicionales, setRecomendacionesAdicionales] = useState('');
  const [materialesRefacciones, setMaterialesRefacciones] = useState('');
  const [guardandoFase2, setGuardandoFase2] = useState(false);
  const [evidenciaReporte, setEvidenciaReporte] = useState<any[]>([]);

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

  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      if (usuario?.email) {
        cargarTareas();
        cargarReportes();
      }
      
      // Cerrar todos los modales si viene el parámetro closeModals
      if (params?.closeModals === 'true') {
        setShowTareasModal(false);
        setShowTareaDetalle(false);
        setShowHistorialTareasModal(false);
        setShowReportesModal(false);
        setShowReporteDetalle(false);
        setShowHistorialReportesModal(false);
        setShowArchivoModal(false);
        setShowCotizarModal(false);
        setShowLogout(false);
      }
    }, [usuario?.email, params?.closeModals])
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
        // Mostrar reportes pendientes, cotizados y en_proceso (excluir terminados)
        const reportesActivos = data?.filter((r: any) => r.estado === 'pendiente' || r.estado === 'cotizado' || r.estado === 'en_proceso') || [];
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
        // Mostrar solo reportes terminados (excluir cotizados)
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
        setArchivosReporte([]);
      }
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
    } finally {
      setActualizandoReporte(false);
    }
  };

  const guardarCotizacion = async () => {
    if (!reporteSeleccionado?.id) return;
    
    if (!descripcionTrabajo.trim()) {
      alert('Por favor ingresa un análisis general');
      return;
    }
    
    if (!precioCotizacion.trim()) {
      alert('Por favor ingresa el precio de la cotización');
      return;
    }

    const precioNumerico = parseFloat(precioCotizacion);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }

    setGuardandoCotizacion(true);
    try {
      // Obtener información del usuario (empleado)
      const empleadoJson = await AsyncStorage.getItem('usuario_empleado');
      const empleado = empleadoJson ? JSON.parse(empleadoJson) : { nombre: 'Empleado' };

      // Guardar cotización en tabla dedicada
      const { success } = await guardarCotizacionDB({
        reporte_id: reporteSeleccionado.id,
        empleado_nombre: empleado.nombre || 'Empleado',
        analisis_general: descripcionTrabajo.trim(),
        precio_cotizacion: precioNumerico,
      });
      
      if (success) {
        // Actualizar el estado del reporte a 'cotizado' en la BD
        await actualizarEstadoReporteAsignado(reporteSeleccionado.id, 'cotizado');
        
        // Actualizar lista de reportes localmente - cambiar estado a cotizado
        const reportesActualizados = listaReportes.map((r: any) =>
          r.id === reporteSeleccionado.id ? { ...r, estado: 'cotizado' } : r
        );
        setListaReportes(reportesActualizados);
        
        const pendientes = reportesActualizados.filter((r: any) => r.estado === 'pendiente').length;
        setReportes(pendientes);
        
        // Limpiar estados
        setShowCotizarModal(false);
        setReporteSeleccionado(null);
        setDescripcionTrabajo('');
        setPrecioCotizacion('');
        
        alert('Cotización guardada exitosamente');
      } else {
        alert('Error al guardar la cotización');
      }
    } catch (error) {
      console.error('Error al guardar cotización:', error);
      alert('Error al guardar la cotización');
    } finally {
      setGuardandoCotizacion(false);
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
      iconBg: '#9333ea',
      iconName: 'checkmark-circle-outline' as const,
      accent: '#c084fc',
    },
    {
      label: 'Reportes',
      value: reportes,
      iconBg: '#b45309',
      iconName: 'document-text-outline' as const,
      accent: '#d97706',
    },
    {
      label: 'Reportes Terminados',
      value: reportesTerminados,
      iconBg: '#047857',
      iconName: 'checkmark-done-outline' as const,
      accent: '#10b981',
    },
    {
      label: 'Tareas Terminadas',
      value: tareasTerminadas,
      iconBg: '#1e40af',
      iconName: 'star-outline' as const,
      accent: '#3b82f6',
    },
  ];

  const menuOptions = [
    {
      title: 'Reportes',
      description: 'Crear y visualizar reportes',
      gradientStart: '#9333ea',
      gradientEnd: '#a78bfa',
      iconName: 'document-text' as const,
    },
    {
      title: 'Historial de Reportes',
      description: 'Consultar reportes anteriores',
      gradientStart: '#b45309',
      gradientEnd: '#d97706',
      iconName: 'time' as const,
    },
    {
      title: 'Tareas',
      description: 'Ver mis tareas asignadas',
      gradientStart: '#1e40af',
      gradientEnd: '#3b82f6',
      iconName: 'checkmark-circle' as const,
    },
    {
      title: 'Historial de Tareas',
      description: 'Consultar tareas completadas',
      gradientStart: '#047857',
      gradientEnd: '#059669',
      iconName: 'archive' as const,
    },
    {
      title: 'Generar inventario',
      description: 'Reporte de inventario del establecimiento',
      gradientStart: '#6d28d9',
      gradientEnd: '#7c3aed',
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, isMobile && styles.containerMobile]}>
          <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeWrapper}>
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.badge, isMobile && styles.badgeMobile]}
                >
                  <Text style={[styles.badgeText, { fontFamily }]}>{initials}</Text>
                </LinearGradient>
                <View style={styles.badgeDot} />
              </View>

              <View style={styles.welcomeTextWrapper}>
                <Text style={[styles.welcomeTitle, isMobile && styles.welcomeTitleMobile, { fontFamily }]}>Bienvenido <Text style={styles.welcomeName}>{usuario?.nombre ?? 'Usuario'}</Text></Text>
                <Text style={[styles.welcomeSubtitle, { fontFamily }]}>Panel de Empleado</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowStats(!showStats)} style={styles.toggleButton} activeOpacity={0.8}>
                <Ionicons name={showStats ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogout(true)} style={styles.logoutButton} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {showStats && (
            <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
              {stats.map((stat, index) => (
                <View key={index} style={[styles.statCard, isMobile && styles.statCardMobile]}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
                      <Ionicons name={stat.iconName as any} size={24} color="white" />
                    </View>
                    <View style={styles.statChip}>
                      <Text style={[styles.statChipText, { fontFamily }]}>Hoy</Text>
                    </View>
                  </View>
                  <Text style={[styles.statValue, { fontFamily }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { fontFamily, color: stat.accent }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.sectionHeader, isMobile && styles.sectionHeaderMobile]}>
            <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile, { fontFamily }]}>Opciones Principales</Text>
            <Text style={[styles.sectionSubtitle, { fontFamily }]}>Accede a tus tareas y reportes</Text>
          </View>

          <View style={[styles.optionsGrid, isMobile && styles.optionsGridMobile]}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                style={[styles.optionTouchable, isMobile && styles.optionTouchableMobile]}
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
                      <Ionicons name={option.iconName as any} size={28} color="white" />
                    </View>
                    <View style={styles.optionTextWrapper}>
                      <Text style={[styles.optionTitle, { fontFamily }]}>{option.title}</Text>
                      <Text style={[styles.optionDescription, { fontFamily }]}>{option.description}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {showLogout && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(248, 113, 113, 0.2)', borderColor: 'rgba(248, 113, 113, 0.5)' }]}>
                <Ionicons name="alert-circle-outline" size={22} color="#f87171" />
              </View>
              <Text style={[styles.modalTitle, { fontFamily }]}>Cerrar sesión</Text>
            </View>
            <Text style={[styles.modalBodyText, { fontFamily }]}>¿Seguro que deseas salir? Se cerrará tu sesión en este dispositivo.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowLogout(false)}>
                <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalPrimary}
              >
                <TouchableOpacity onPress={confirmLogout} activeOpacity={0.85}>
                  <Text style={[styles.modalPrimaryText, { fontFamily }]}>Cerrar sesión</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      )}

      {showTareasModal && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 8 : 12, flex: 1 }}>
                <View style={{ backgroundColor: '#1e40af', borderRadius: 12, padding: isMobile ? 8 : 10 }}>
                  <Ionicons name="checkmark-circle-outline" size={isMobile ? 20 : 24} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]} numberOfLines={1}>Mis Tareas</Text>
                  <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Tareas asignadas pendientes de completar</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={cargarTareas} style={styles.refreshButton} activeOpacity={0.7}>
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTareasModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingTareas ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando tareas...</Text>
              </View>
            ) : listaTareas.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="checkmark-done" size={56} color="#10b981" style={{ marginBottom: 16, opacity: 0.6 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 15, textAlign: 'center', fontWeight: '600' }, { fontFamily }]}>
                  No tienes tareas asignadas
                </Text>
              </View>
            ) : (
              <ScrollView style={[styles.modalList, isMobile && styles.modalListMobile]} showsVerticalScrollIndicator={false}>
                {listaTareas.map((tarea: any, index: number) => {
                  const estadoColor =
                    tarea.estado === 'pendiente'
                      ? '#f59e0b'
                      : tarea.estado === 'en_proceso'
                        ? '#3b82f6'
                        : '#10b981';

                  return (
                    <View key={index} style={[styles.cardContainer, isMobile && styles.cardContainerMobile]}>
                      <View style={[styles.cardAccentLeft, { backgroundColor: estadoColor }]} />
                      <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
                        <View style={styles.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.cardMainTitle, { fontFamily }]} numberOfLines={1}>{tarea.descripcion}</Text>
                            <Text style={[styles.cardUserInfo, { fontFamily }]} numberOfLines={1}>Asignada por: {tarea.admin_nombre}</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setTareaSeleccionada(tarea);
                              setShowTareasModal(false);
                              setShowTareaDetalle(true);
                            }}
                            activeOpacity={0.7}
                            style={styles.cardEyeButton}
                          >
                            <Ionicons name="eye-outline" size={22} color="#64748b" />
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.cardDescription, { fontFamily }]} numberOfLines={2}>{tarea.descripcion}</Text>
                        <View style={styles.cardFooter}>
                          <Text style={[styles.cardDate, { fontFamily }]}>
                            {new Date(tarea.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${estadoColor}25`, borderColor: `${estadoColor}50` }]}>
                            <Text style={[styles.statusBadgeText, { color: estadoColor, fontFamily }]}>
                              {tarea.estado === 'pendiente' ? 'Pendiente' : tarea.estado === 'en_proceso' ? 'En Proceso' : 'Completada'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {showTareaDetalle && tareaSeleccionada && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.detailModalHeader, isMobile && styles.detailModalHeaderMobile]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailModalTitle, isMobile && styles.detailModalTitleMobile, { fontFamily }]} numberOfLines={1}>Detalles de la tarea</Text>
                <Text style={[styles.detailModalSubtitle, isMobile && styles.detailModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Información completa de la asignación</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowTareaDetalle(false); setTareaSeleccionada(null); }} activeOpacity={0.7}>
                <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.detailContent, isMobile && styles.detailContentMobile]}>
                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Descripción</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{tareaSeleccionada.descripcion}</Text>
                  </View>
                </View>

                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Asignada por</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{tareaSeleccionada.admin_nombre}</Text>
                    {tareaSeleccionada.admin_email && (
                      <Text style={[styles.detailSubValue, { fontFamily }]}>{tareaSeleccionada.admin_email}</Text>
                    )}
                  </View>
                </View>

                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Fecha de Asignación</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>
                      {new Date(tareaSeleccionada.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRowFields}>
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { flex: 1 }]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Estado</Text>
                    <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {tareaSeleccionada.estado === 'pendiente' 
                          ? 'Pendiente'
                          : tareaSeleccionada.estado === 'en_proceso'
                            ? 'En Proceso'
                            : 'Completada'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.detailFooter, isMobile && styles.detailFooterMobile]}>
              <TouchableOpacity
                style={styles.detailCloseButton}
                onPress={() => { setShowTareaDetalle(false); setTareaSeleccionada(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.detailCloseButtonText, { fontFamily }]}>Cerrar</Text>
              </TouchableOpacity>
              
              {tareaSeleccionada.estado !== 'completada' && (
                <LinearGradient
                  colors={['#047857', '#10b981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.detailActionButton}
                >
                  <TouchableOpacity
                    onPress={marcarComoCompletada}
                    disabled={actualizandoTarea}
                    activeOpacity={0.85}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={[styles.detailActionButtonText, { fontFamily }]}>
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
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 8 : 12, flex: 1 }}>
                <View style={{ backgroundColor: '#047857', borderRadius: 12, padding: isMobile ? 8 : 10 }}>
                  <Ionicons name="archive-outline" size={isMobile ? 20 : 24} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]} numberOfLines={1}>Historial de Tareas</Text>
                  <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Tareas completadas exitosamente</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={cargarTareasTerminadas} style={styles.refreshButton} activeOpacity={0.7}>
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowHistorialTareasModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingHistorialTareas ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando historial...</Text>
              </View>
            ) : listaTareasTerminadas.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="folder-open-outline" size={56} color="#94a3b8" style={{ marginBottom: 16, opacity: 0.4 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 15, textAlign: 'center', fontWeight: '600' }, { fontFamily }]}>
                  No hay tareas completadas
                </Text>
              </View>
            ) : (
              <ScrollView style={[styles.modalList, isMobile && styles.modalListMobile]} showsVerticalScrollIndicator={false}>
                {listaTareasTerminadas.map((tarea: any, index: number) => (
                  <View key={index} style={[styles.cardContainer, isMobile && styles.cardContainerMobile]}>
                    <View style={[styles.cardAccentLeft, { backgroundColor: '#10b981' }]} />
                    <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardMainTitle, { fontFamily }]} numberOfLines={1}>{tarea.descripcion}</Text>
                          <Text style={[styles.cardUserInfo, { fontFamily }]} numberOfLines={1}>Asignada por: {tarea.admin_nombre}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            setTareaSeleccionada(tarea);
                            setShowHistorialTareasModal(false);
                            setShowTareaDetalle(true);
                          }}
                          activeOpacity={0.7}
                          style={styles.cardEyeButton}
                        >
                          <Ionicons name="eye-outline" size={22} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.cardDescription, { fontFamily }]} numberOfLines={2}>{tarea.descripcion}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={[styles.cardDate, { fontFamily }]}>
                          {new Date(tarea.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#10b98125', borderColor: '#10b98150' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#10b981', fontFamily }]}>Completada</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {showReportesModal && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 8 : 12, flex: 1 }}>
                <View style={{ backgroundColor: '#b45309', borderRadius: 12, padding: isMobile ? 8 : 10 }}>
                  <Ionicons name="document-text-outline" size={isMobile ? 20 : 24} color="#d97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]} numberOfLines={1}>Mis Reportes Asignados</Text>
                  <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Reportes en progreso asignados a ti</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={cargarReportes} style={styles.refreshButton} activeOpacity={0.7}>
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowReportesModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingReportes ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando reportes...</Text>
              </View>
            ) : listaReportes.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="document-text" size={56} color="#94a3b8" style={{ marginBottom: 16, opacity: 0.4 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 15, textAlign: 'center', fontWeight: '600' }, { fontFamily }]}>
                  No tienes reportes asignados
                </Text>
              </View>
            ) : (
              <ScrollView style={[styles.modalList, isMobile && styles.modalListMobile]} showsVerticalScrollIndicator={false}>
                {listaReportes.map((reporte: any) => (
                  <View key={reporte.id} style={[styles.cardContainer, isMobile && styles.cardContainerMobile]}>
                    <View style={[styles.cardAccentLeft, { backgroundColor: '#d97706' }]} />
                    <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardMainTitle, { fontFamily }]} numberOfLines={1}>{reporte.equipo_descripcion}</Text>
                          <Text style={[styles.cardUserInfo, { fontFamily }]} numberOfLines={1}>
                            {reporte.usuario_nombre} - {reporte.usuario_email || 'Sin email'}
                          </Text>
                          <Text style={[styles.cardCompanyInfo, { fontFamily }]} numberOfLines={1}>
                            {reporte.empresa} • {reporte.sucursal}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            setReporteSeleccionado(reporte);
                            setShowReportesModal(false);
                            setShowReporteDetalle(true);
                            // Cargar archivos del reporte
                            setCargandoArchivos(true);
                            const resultado = await obtenerArchivosReporte(reporte.id);
                            if (resultado.success) {
                              setArchivosReporte(resultado.data || []);
                            }
                            setCargandoArchivos(false);
                          }}
                          activeOpacity={0.7}
                          style={styles.cardEyeButton}
                        >
                          <Ionicons name="eye-outline" size={22} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.cardDescription, { fontFamily }]} numberOfLines={2}>{reporte.comentario || 'Sin descripción'}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={[styles.cardDate, { fontFamily }]}>
                          {new Date(reporte.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: reporte.estado === 'cotizado' ? '#f59e0b25' : '#d9770625', borderColor: reporte.estado === 'cotizado' ? '#f59e0b50' : '#d9770650' }]}>
                          <Text style={[styles.statusBadgeText, { color: reporte.estado === 'cotizado' ? '#f59e0b' : '#d97706', fontFamily }]}>
                            {reporte.estado === 'cotizado' ? 'En Espera de Respuesta' : 'En Proceso'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {showReporteDetalle && reporteSeleccionado && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.detailModalHeader, isMobile && styles.detailModalHeaderMobile]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailModalTitle, isMobile && styles.detailModalTitleMobile, { fontFamily }]} numberOfLines={1}>Detalles del reporte</Text>
                <Text style={[styles.detailModalSubtitle, isMobile && styles.detailModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Resumen completo del ticket</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowReporteDetalle(false); setReporteSeleccionado(null); setArchivosReporte([]); }} activeOpacity={0.7}>
                <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.detailContent, isMobile && styles.detailContentMobile]}>
                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Equipo / Servicio</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.equipo_descripcion}</Text>
                  </View>
                </View>

                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Solicitante</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.usuario_nombre}</Text>
                    {reporteSeleccionado.usuario_email && (
                      <Text style={[styles.detailSubValue, { fontFamily }]}>{reporteSeleccionado.usuario_email}</Text>
                    )}
                  </View>
                </View>

                {reporteSeleccionado.empresa && (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Empresa</Text>
                    <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.empresa}</Text>
                    </View>
                  </View>
                )}

                {reporteSeleccionado.sucursal && (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Sucursal</Text>
                    <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.sucursal}</Text>
                    </View>
                  </View>
                )}

                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Comentario / Problema</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.comentario || 'Sin comentarios'}</Text>
                  </View>
                </View>

                <View style={styles.detailRowFields}>
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { flex: 1 }]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Prioridad</Text>
                    <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {reporteSeleccionado.prioridad || 'Media'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { flex: 1 }]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Estado</Text>
                    <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {reporteSeleccionado.estado === 'en_proceso' 
                          ? 'En Proceso'
                          : reporteSeleccionado.estado === 'cotizado'
                            ? 'En Espera de Respuesta'
                            : reporteSeleccionado.estado === 'terminado'
                              ? 'Terminado'
                              : 'Pendiente'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Fotos y Videos */}
                {cargandoArchivos ? (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Cargando archivos...</Text>
                  </View>
                ) : null}

                {!cargandoArchivos && archivosReporte.length > 0 && (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Archivos Adjuntos ({archivosReporte.length})</Text>
                    <View style={styles.archivosContainer}>
                      {archivosReporte.map((archivo, idx) => {
                        const proxyUrl = getProxyUrl(archivo.cloudflare_url);
                        return (
                          <TouchableOpacity 
                            key={idx} 
                            style={styles.archivoItem}
                            onPress={() => {
                              setArchivoVisualizando({
                                url: proxyUrl,
                                tipo: archivo.tipo_archivo,
                                nombre: archivo.nombre_original || 'Archivo'
                              });
                              setShowArchivoModal(true);
                            }}
                          >
                            {archivo.tipo_archivo === 'foto' ? (
                              <>
                                <Image
                                  source={{ uri: proxyUrl }}
                                  style={styles.archivoThumb}
                                  onError={() => console.log('Error loading image:', proxyUrl)}
                                />
                                <Text style={[styles.archivoLabel, { fontFamily }]}>📷 Foto</Text>
                              </>
                            ) : (
                              <>
                                <View style={styles.videoThumb}>
                                  <Ionicons name="play-circle" size={40} color="#06b6d4" />
                                </View>
                                <Text style={[styles.archivoLabel, { fontFamily }]}>🎥 Video</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Campos Fase 2 (cuando está en_proceso) */}
                {reporteSeleccionado.estado === 'en_proceso' && (
                  <>
                    <View style={{ height: 1, backgroundColor: '#1f2937', marginVertical: 16 }} />
                    
                    <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                      <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Revisión</Text>
                      <TextInput
                        style={[styles.textInputArea, isMobile && styles.textInputAreaMobile, { fontFamily }]}
                        placeholder="Describe la revisión realizada..."
                        placeholderTextColor="#cbd5e1"
                        multiline
                        numberOfLines={3}
                        value={revision}
                        onChangeText={setRevision}
                        editable={!guardandoFase2}
                      />
                    </View>

                    <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                      <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Recomendaciones</Text>
                      <TextInput
                        style={[styles.textInputArea, isMobile && styles.textInputAreaMobile, { fontFamily }]}
                        placeholder="Recomendaciones para el cliente..."
                        placeholderTextColor="#cbd5e1"
                        multiline
                        numberOfLines={3}
                        value={recomendaciones}
                        onChangeText={setRecomendaciones}
                        editable={!guardandoFase2}
                      />
                    </View>

                    <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                      <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Reparación</Text>
                      <TextInput
                        style={[styles.textInputArea, isMobile && styles.textInputAreaMobile, { fontFamily }]}
                        placeholder="Detalla lo que fue reparado..."
                        placeholderTextColor="#cbd5e1"
                        multiline
                        numberOfLines={3}
                        value={reparacion}
                        onChangeText={setReparacion}
                        editable={!guardandoFase2}
                      />
                    </View>

                    <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                      <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Recomendaciones Adicionales</Text>
                      <TextInput
                        style={[styles.textInputArea, isMobile && styles.textInputAreaMobile, { fontFamily }]}
                        placeholder="Recomendaciones adicionales (opcional)..."
                        placeholderTextColor="#cbd5e1"
                        multiline
                        numberOfLines={2}
                        value={recomendacionesAdicionales}
                        onChangeText={setRecomendacionesAdicionales}
                        editable={!guardandoFase2}
                      />
                    </View>

                    <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                      <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Materiales / Refacciones</Text>
                      <TextInput
                        style={[styles.textInputArea, isMobile && styles.textInputAreaMobile, { fontFamily }]}
                        placeholder="Materiales o refacciones utilizadas..."
                        placeholderTextColor="#cbd5e1"
                        multiline
                        numberOfLines={2}
                        value={materialesRefacciones}
                        onChangeText={setMaterialesRefacciones}
                        editable={!guardandoFase2}
                      />
                    </View>
                  </>
                )}
              </View>
            </ScrollView>

            <View style={[styles.detailFooter, isMobile && styles.detailFooterMobile]}>
              <TouchableOpacity
                style={styles.detailCloseButton}
                onPress={() => { setShowReporteDetalle(false); setReporteSeleccionado(null); setArchivosReporte([]); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.detailCloseButtonText, { fontFamily }]}>Cerrar</Text>
              </TouchableOpacity>
              
              {reporteSeleccionado.estado === 'pendiente' && (
                <LinearGradient
                  colors={['#d97706', '#f59e0b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.detailActionButton}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setShowReporteDetalle(false);
                      setShowCotizarModal(true);
                    }}
                    activeOpacity={0.85}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={[styles.detailActionButtonText, { fontFamily }]}>
                      Cotizar
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}

              {reporteSeleccionado.estado === 'en_proceso' && (
                <LinearGradient
                  colors={['#10b981', '#06b6d4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.detailActionButton}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      if (!revision.trim() || !recomendaciones.trim() || !reparacion.trim()) {
                        alert('Por favor completa los campos obligatorios: Revisión, Recomendaciones y Reparación');
                        return;
                      }

                      // PASO 3: Guardar Fase 2 primero
                      const fase2Data = {
                        revision,
                        recomendaciones,
                        reparacion,
                        recomendaciones_adicionales: recomendacionesAdicionales,
                        materiales_refacciones: materialesRefacciones,
                      };

                      // Actualizar el reporte con datos de Fase 2
                      const updateResult = await actualizarEstadoReporteAsignado(
                        reporteSeleccionado.id,
                        'finalizado_por_tecnico',
                        revision // descripcion_trabajo
                      );

                      if (!updateResult.success) {
                        alert('Error al finalizar el reporte: ' + updateResult.error);
                        return;
                      }

                      // Éxito: mostrar mensaje y recargar
                      alert(
                        'Trabajo finalizado\n\n' +
                        'El cliente debe revisar y confirmar la finalización ' +
                        'antes de responder la encuesta.'
                      );
                      
                      // Limpiar y cerrar modal
                      setShowReporteDetalle(false);
                      setReporteSeleccionado(null);
                      
                      // Recargar lista de reportes
                      cargarReportes();
                    }}
                    activeOpacity={0.85}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={[styles.detailActionButtonText, { fontFamily }]}>
                      Finalizar Trabajo
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>
          </View>
        </View>
      )}

      {showHistorialReportesModal && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 8 : 12, flex: 1 }}>
                <View style={{ backgroundColor: '#047857', borderRadius: 12, padding: isMobile ? 8 : 10 }}>
                  <Ionicons name="checkmark-done-outline" size={isMobile ? 20 : 24} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]} numberOfLines={1}>Historial de Reportes</Text>
                  <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Reportes finalizados y completados</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={cargarReportesTerminados} style={styles.refreshButton} activeOpacity={0.7}>
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowHistorialReportesModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingHistorialReportes ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando historial...</Text>
              </View>
            ) : listaReportesTerminados.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="archive" size={56} color="#94a3b8" style={{ marginBottom: 16, opacity: 0.4 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 15, textAlign: 'center', fontWeight: '600' }, { fontFamily }]}>
                  No hay reportes terminados
                </Text>
              </View>
            ) : (
              <ScrollView style={[styles.modalList, isMobile && styles.modalListMobile]} showsVerticalScrollIndicator={false}>
                {listaReportesTerminados.map((reporte: any) => (
                  <View key={reporte.id} style={[styles.cardContainer, isMobile && styles.cardContainerMobile]}>
                    <View style={[styles.cardAccentLeft, { backgroundColor: '#10b981' }]} />
                    <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardMainTitle, { fontFamily }]} numberOfLines={1}>{reporte.equipo_descripcion}</Text>
                          <Text style={[styles.cardUserInfo, { fontFamily }]} numberOfLines={1}>
                            {reporte.usuario_nombre} - {reporte.usuario_email || 'Sin email'}
                          </Text>
                          <Text style={[styles.cardCompanyInfo, { fontFamily }]} numberOfLines={1}>
                            {reporte.empresa} • {reporte.sucursal}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            setReporteSeleccionado(reporte);
                            setShowHistorialReportesModal(false);
                            setShowReporteDetalle(true);
                            // Cargar archivos del reporte
                            setCargandoArchivos(true);
                            const resultado = await obtenerArchivosReporte(reporte.id);
                            if (resultado.success) {
                              setArchivosReporte(resultado.data || []);
                            }
                            setCargandoArchivos(false);
                          }}
                          activeOpacity={0.7}
                          style={styles.cardEyeButton}
                        >
                          <Ionicons name="eye-outline" size={22} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.cardDescription, { fontFamily }]} numberOfLines={2}>{reporte.comentario || 'Sin descripción'}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={[styles.cardDate, { fontFamily }]}>
                          {new Date(reporte.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#10b98125', borderColor: '#10b98150' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#10b981', fontFamily }]}>Terminado</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {showCotizarModal && reporteSeleccionado && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.detailModalHeader, isMobile && styles.detailModalHeaderMobile]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailModalTitle, isMobile && styles.detailModalTitleMobile, { fontFamily }]} numberOfLines={1}>Cotizar Reporte</Text>
                <Text style={[styles.detailModalSubtitle, isMobile && styles.detailModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Ingresa los detalles de la cotización</Text>
              </View>
              <TouchableOpacity onPress={() => { 
                setShowCotizarModal(false); 
                setDescripcionTrabajo('');
                setPrecioCotizacion('');
              }} activeOpacity={0.7}>
                <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.detailContent, isMobile && styles.detailContentMobile]}>
                {/* Información del reporte */}
                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Equipo / Servicio</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.equipo_descripcion}</Text>
                  </View>
                </View>

                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Solicitante</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.usuario_nombre}</Text>
                    {reporteSeleccionado.usuario_email && (
                      <Text style={[styles.detailSubValue, { fontFamily }]}>{reporteSeleccionado.usuario_email}</Text>
                    )}
                  </View>
                </View>

                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Comentario / Problema</Text>
                  <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                    <Text style={[styles.detailValueText, { fontFamily }]}>{reporteSeleccionado.comentario || 'Sin comentarios'}</Text>
                  </View>
                </View>

                {/* Campos de cotización */}
                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { marginTop: 24 }]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily, color: '#f59e0b' }]}>
                    Análisis General *
                  </Text>
                  <TextInput
                    style={[styles.textInputArea, { fontFamily }]}
                    value={descripcionTrabajo}
                    onChangeText={setDescripcionTrabajo}
                    placeholder="Ingresa el análisis general del reporte..."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile]}>
                  <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily, color: '#f59e0b' }]}>
                    Precio del arreglo *
                  </Text>
                  <TextInput
                    style={[styles.textInputPrice, { fontFamily }]}
                    value={precioCotizacion}
                    onChangeText={setPrecioCotizacion}
                    placeholder="0.00"
                    placeholderTextColor="#64748b"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={[styles.detailFooter, isMobile && styles.detailFooterMobile]}>
              <TouchableOpacity
                style={styles.detailCloseButton}
                onPress={() => { 
                  setShowCotizarModal(false); 
                  setDescripcionTrabajo('');
                  setPrecioCotizacion('');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.detailCloseButtonText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <LinearGradient
                colors={['#d97706', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.detailActionButton}
              >
                <TouchableOpacity
                  onPress={guardarCotizacion}
                  disabled={guardandoCotizacion}
                  activeOpacity={0.85}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={[styles.detailActionButtonText, { fontFamily }]}>
                    {guardandoCotizacion ? 'Guardando...' : 'Cotizar'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      )}

      {showArchivoModal && archivoVisualizando && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.archivoModalContent, isMobile && styles.archivoModalContentMobile, { flex: 1, flexDirection: 'column', justifyContent: 'center' }]}>
            <TouchableOpacity 
              style={[styles.archivoModalClose, isMobile && styles.archivoModalCloseMobile]}
              onPress={() => {
                setShowArchivoModal(false);
                setArchivoVisualizando(null);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={isMobile ? 24 : 32} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              {archivoVisualizando.tipo === 'foto' ? (
                <Image
                  source={{ uri: archivoVisualizando.url }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  resizeMode="contain"
                />
              ) : (
                <Video
                  source={{ uri: archivoVisualizando.url }}
                  style={{ width: '100%', height: '100%' }}
                  useNativeControls
                  resizeMode="contain"
                  isLooping
                />
              )}
            </View>

            <Text style={[styles.archivoModalName, isMobile && styles.archivoModalNameMobile, { fontFamily }]}>
              {archivoVisualizando.nombre}
            </Text>
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
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { paddingBottom: 32, backgroundColor: '#0f172a' },
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
  headerRow: {
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
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
  },
  optionsGridMobile: {
    columnGap: 10,
    rowGap: 10,
    marginBottom: 8,
  },
  optionTouchable: { 
    flexBasis: 'calc(50% - 10px)',
    minWidth: 280,
  },
  optionTouchableMobile: { 
    flexBasis: '100%',
    minWidth: 'auto',
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
    minHeight: 100,
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
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  modalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalBodyText: { color: '#cbd5e1', fontSize: 14, marginBottom: 18 },
  modalActions: { flexDirection: 'row', gap: 14, marginTop: 6 },
  modalSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: { color: '#e2e8f0', fontWeight: '700' },
  modalPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: { color: '#fff', fontWeight: '700', textAlign: 'center', paddingVertical: 12 },
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalOverlayMobile: {
    padding: 12,
  },
  largeModal: {
    width: '100%',
    maxWidth: 700,
    maxHeight: '85%',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    overflow: 'hidden',
    flexDirection: 'column',
  },
  largeModalMobile: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '90%',
    height: 'auto',
    minHeight: 600,
    borderRadius: 12,
    marginVertical: 0,
  },
  largeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  largeModalHeaderMobile: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  largeModalTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800',
  },
  largeModalTitleMobile: {
    fontSize: 16,
  },
  largeModalSubtitle: { 
    color: '#94a3b8', 
    fontSize: 12,
    marginTop: 2,
  },
  largeModalSubtitleMobile: {
    fontSize: 11,
  },
  modalList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalListMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    paddingRight: 12,
  },
  cardAccentLeft: {
    width: 4,
    height: '100%',
  },
  cardTitle: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  cardMeta: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  cardDate: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardContainerMobile: {
    marginBottom: 10,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardContentMobile: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardMainTitle: {
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardUserInfo: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 4,
  },
  cardCompanyInfo: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardEyeButton: {
    backgroundColor: '#334155',
    borderRadius: 8,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  detailModalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailModalHeaderMobile: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  detailModalTitleMobile: {
    fontSize: 16,
  },
  detailModalSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  detailModalSubtitleMobile: {
    fontSize: 11,
  },
  detailScroll: {
    flex: 1,
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  detailContentMobile: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  detailFieldGroup: {
    gap: 8,
  },
  detailFieldGroupMobile: {
    gap: 6,
  },
  detailFieldLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  detailFieldLabelMobile: {
    fontSize: 11,
  },
  detailValueBox: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailValueBoxMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  detailValueText: {
    color: '#f1f5f9',
    fontSize: 15,
    lineHeight: 20,
  },
  detailSubValue: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
  },
  detailRowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  detailFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  detailFooterMobile: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  refreshText: { 
    color: '#67e8f9', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  detailCloseButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCloseButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 14,
  },
  detailActionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  detailActionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  textInputArea: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textInputPrice: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },
  archivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  archivoItem: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivoThumb: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  videoThumb: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  archivoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  archivoModalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    maxWidth: '90%',
    maxHeight: '90%',
    width: '85%',
    height: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexDirection: 'column',
  },
  archivoModalContentMobile: {
    borderRadius: 12,
    padding: 16,
    width: '90%',
    height: '80%',
  },
  archivoModalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivoModalCloseMobile: {
    width: 40,
    height: 40,
  },
  archivoModalImage: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  archivoModalImageMobile: {
    height: 300,
  },
  archivoModalVideo: {
    width: '100%',
    height: 500,
    marginBottom: 12,
  },
  archivoModalVideoMobile: {
    height: 300,
  },
  archivoModalName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  archivoModalNameMobile: {
    fontSize: 12,
  },
});

