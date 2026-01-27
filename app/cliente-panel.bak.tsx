// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  actualizarEstadoReporteAsignado,
  obtenerReportesCliente
} from '../lib/api-backend';

type Cliente = {
  nombre?: string;
  apellido?: string;
  email?: string;
  empresa?: string;
};

export default function ClientePanel() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fontFamily = Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif';
  const [usuario, setUsuario] = useState<Cliente | null>(null);
  // Contadores dinámicos se calculan a partir de "reportes"
  const [showLogout, setShowLogout] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [showReporteDetail, setShowReporteDetail] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState<any | null>(null);
  const [reportes, setReportes] = useState<any[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [errorReportes, setErrorReportes] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string[]>([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState<string[]>([]);
  const [showFiltros, setShowFiltros] = useState(false);

  // PASO 4: Nuevos estados para reportes finalizados por técnico
  const [reportesFinalizados, setReportesFinalizados] = useState<any[]>([]);
  const [showConfirmarFinalizacionModal, setShowConfirmarFinalizacionModal] = useState(false);
  const [reporteAConfirmar, setReporteAConfirmar] = useState<any | null>(null);
  const [confirmandoFinalizacion, setConfirmandoFinalizacion] = useState(false);

  // Estados para cotizaciones
  const [showCotizacionesModal, setShowCotizacionesModal] = useState(false);
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<any | null>(null);
  const [showCotizacionDetalleModal, setShowCotizacionDetalleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');


  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setUsuario(JSON.parse(user));
        } else {
          router.replace('/');
        }
      } catch (error) {
        router.replace('/');
      }
    };
    obtenerUsuario();
  }, [router]);

  // Mostrar alerta de reporte enviado si viene de crear reporte
  useFocusEffect(
    useCallback(() => {
      const mostrarExito = async () => {
        const flag = await AsyncStorage.getItem('reporte_exito');
        if (flag === '1') {
          await AsyncStorage.removeItem('reporte_exito');
          setShowSuccessOverlay(true);
        }
      };
      mostrarExito();
    }, [])
  );

  const cargarReportes = useCallback(
    async (email?: string) => {
      if (!email) return;
      setLoadingReportes(true);
      setErrorReportes('');
      const { success, data, error } = await obtenerReportesCliente(email);
      if (!success) {
        setErrorReportes(error || 'No se pudieron cargar los reportes');
      } else {
        setReportes(data || []);
      }
      setLoadingReportes(false);
      return data || [];
    },
    []
  );

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const cargarCotizaciones = useCallback(
    async (email?: string) => {
      if (!email) {
        console.log('[CLIENTE-PANEL] No hay email para cargar cotizaciones');
        return;
      }
      console.log('[CLIENTE-PANEL] Cargando cotizaciones para email:', email);
      setLoadingCotizaciones(true);
      try {
        console.log('[CLIENTE-PANEL] Llamando a obtenerReportesCliente');
        const resultado = await obtenerReportesCliente(email);
        console.log('[CLIENTE-PANEL] Resultado completo:', resultado);
        if (resultado.success && resultado.data) {
          console.log('[CLIENTE-PANEL] Datos cargados:', resultado.data.length);
          setCotizaciones(resultado.data);
        } else {
          console.error('[CLIENTE-PANEL] Error en respuesta:', resultado.error);
          setCotizaciones([]);
        }
      } catch (error) {
        console.error('[CLIENTE-PANEL] Exception:', error);
        setCotizaciones([]);
      } finally {
        setLoadingCotizaciones(false);
      }
    },
    []
  );

  // PASO 4: Cargar reportes finalizados por técnico (esperando confirmación del cliente)
  const cargarReportesFinalizados = useCallback(
    async (email?: string) => {
      if (!email) {
        console.log('[CLIENTE-PANEL] No hay email para cargar reportes finalizados');
        return;
      }
      console.log('[CLIENTE-PANEL] Cargando reportes finalizados por técnico para:', email);
      try {
        const resultado = await obtenerReportesCliente(email);
        if (resultado.success && resultado.data) {
          console.log('[CLIENTE-PANEL] Reportes finalizados cargados:', resultado.data.length);
          setReportesFinalizados(resultado.data);
        } else {
          console.error('[CLIENTE-PANEL] Error cargando reportes finalizados:', resultado.error);
          setReportesFinalizados([]);
        }
      } catch (error) {
        console.error('[CLIENTE-PANEL] Exception cargando reportes finalizados:', error);
        setReportesFinalizados([]);
      }
    },
    []
  );

  // Cargar reportes y cotizaciones al enfocar el panel
  useFocusEffect(
    useCallback(() => {
      if (usuario?.email) {
        cargarReportes(usuario.email);
        cargarCotizaciones(usuario.email);
        // PASO 4: Cargar reportes finalizados por técnico
        cargarReportesFinalizados(usuario.email);
      }
    }, [usuario?.email, cargarReportes, cargarCotizaciones])
  );

  // Refrescar empresa/apellido si no están en AsyncStorage
  useEffect(() => {
    const refrescarPerfil = async () => {
      if (!usuario?.id) return;
      if (usuario?.empresa && usuario?.apellido) return; // ya lo tenemos completo
      // Los datos ya vienen del login, no necesitamos refrescar
      // El usuario está completo en AsyncStorage después del login
    };
    refrescarPerfil();
  }, [usuario?.id, usuario?.empresa, usuario?.apellido]);

  const finalizados = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'terminado'),
    [reportes]
  );
  const ahora = useMemo(() => new Date(), []);
  const reportesDelMes = useMemo(
    () =>
      reportes.filter((r) => {
        if (!r.created_at) return false;
        const d = new Date(r.created_at);
        return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
      }).length,
    [reportes, ahora]
  );
  // Pendientes específicamente
  const pendientesCount = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'pendiente').length,
    [reportes]
  );
  // En proceso
  const enProcesoCount = useMemo(
    () => reportes.filter((r) => ((r.estado || '').toLowerCase().replace('_', ' ')) === 'en proceso').length,
    [reportes]
  );
  // En espera
  const enEsperaCount = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'en espera').length,
    [reportes]
  );
  // Terminados
  const resueltosCount = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'terminado').length,
    [reportes]
  );
  const activos = useMemo(() => reportes.filter((r) => (r.estado || '').toLowerCase() !== 'terminado'), [reportes]);

  const activosFiltrados = useMemo(() => {
    let lista = [...activos];

    if (filtroEstado.length > 0) {
      lista = lista.filter((r) => {
        let key = (r.estado || 'pendiente').toLowerCase();
        if (key === 'en_proceso') key = 'en proceso';
        if (key === 'en_espera') key = 'en espera';
        return filtroEstado.includes(key);
      });
    }

    if (filtroPrioridad.length > 0) {
      lista = lista.filter((r) => {
        const prioridad = (r.prioridad || 'media').toLowerCase();
        return filtroPrioridad.includes(prioridad);
      });
    }

    return lista;
  }, [activos, filtroEstado, filtroPrioridad]);

  const activosPorEstado = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    activosFiltrados.forEach((r) => {
      let key = (r.estado || 'pendiente').toLowerCase();
      if (key === 'en_proceso') key = 'en proceso';
      if (key === 'en_espera') key = 'en espera';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(r);
    });
    return grupos;
  }, [activosFiltrados]);

  const renderReporteCard = (rep: any, isSample = false) => {
    // Colores dinámicos según el estado
    const getEstadoStyles = () => {
      const estado = (rep.estado || '').toLowerCase();
      if (estado === 'pendiente') {
        return { bg: '#f59e0b33', text: '#fcd34d', border: '#f59e0b66' };
      } else if (estado === 'en_proceso' || estado === 'en proceso') {
        return { bg: '#06b6d433', text: '#67e8f9', border: '#06b6d466' };
      } else if (estado === 'programado' || estado === 'asignado') {
        return { bg: '#8b5cf633', text: '#d8b4fe', border: '#8b5cf666' };
      } else if (estado === 'pausado') {
        return { bg: '#64748b33', text: '#cbd5e1', border: '#64748b66' };
      } else if (estado === 'cotizado') {
        return { bg: '#f59e0b33', text: '#fbbf24', border: '#f59e0b66' };
      } else {
        return { bg: '#10b98133', text: '#6ee7b7', border: '#10b98166' };
      }
    };

    const estadoStyles = getEstadoStyles();
    const estadoBg = estadoStyles.bg;
    const estadoText = estadoStyles.text;
    const estadoBorder = estadoStyles.border;

    const prioridadBg = rep.prioridad === 'urgente' ? '#ef444433' : rep.prioridad === 'media' ? '#f59e0b33' : '#10b98133';
    const prioridadText = rep.prioridad === 'urgente' ? '#fca5a5' : rep.prioridad === 'media' ? '#fcd34d' : '#6ee7b7';
    const prioridadBorder = rep.prioridad === 'urgente' ? '#ef444466' : rep.prioridad === 'media' ? '#f59e0b66' : '#10b98166';

    const fecha = rep.created_at ? new Date(rep.created_at).toLocaleString() : isSample ? 'Hace un momento' : '';

    return (
      <View
        key={rep.id || `sample-${rep.equipo_descripcion}`}
        style={styles.reportCard}
      >
        <View style={styles.reportCardHeader}>
          <View style={styles.reportCardInfo}>
            <Text style={[styles.reportCardTitle, { fontFamily }]} numberOfLines={1}>
              {rep.equipo_descripcion || 'Equipo / servicio'}
            </Text>
            <Text style={[styles.reportCardDate, { fontFamily }]}>{fecha}</Text>
          </View>
          <View style={styles.reportCardActions}>
            <View style={[styles.badge, { backgroundColor: estadoBg, borderColor: estadoBorder }]}>
              <Text style={[styles.badgeText, { fontFamily, color: estadoText, fontWeight: '600' }]}>
                {isSample
                  ? 'Completado'
                  : ((rep.estado || '').toLowerCase() === 'en_proceso'
                    ? 'En proceso'
                    : (rep.estado || 'terminado')
                      .split('_')
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' '))}
              </Text>
            </View>
            {!isSample && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedReporte(rep);
                  setShowReporteDetail(true);
                }}
                style={styles.eyeButton}
              >
                <Ionicons name="eye-outline" size={16} color="#06b6d4" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={[styles.reportCardComment, { fontFamily }]} numberOfLines={2}>
          {rep.comentario || 'Sin comentarios'}
        </Text>

        <View style={styles.reportCardFooter}>
          <View style={[styles.badge, { backgroundColor: prioridadBg, borderColor: prioridadBorder }]}>
            <Text style={[styles.badgeText, { fontFamily, color: prioridadText }]}>
              Prioridad: {rep.prioridad || 'media'}
            </Text>
          </View>
          {rep.sucursal ? (
            <View style={[styles.badge, { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
              <Text style={[styles.badgeText, { fontFamily, color: '#cbd5e1' }]}>
                Sucursal: {rep.sucursal}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const ensureDemoFinalizado = useCallback(
    async (lista: any[]) => {
      if (!usuario?.email) return;
      // Función simplificada - no insertar datos de demo
      // Los reportes se cargan desde la BD
      // No es necesario crear reportes de demostración
    },
    [usuario]
  );

  const toggleFiltroEstado = (estado: string) => {
    setFiltroEstado((prev) =>
      prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado]
    );
  };

  const toggleFiltroPrioridad = (prioridad: string) => {
    setFiltroPrioridad((prev) =>
      prev.includes(prioridad) ? prev.filter((p) => p !== prioridad) : [...prev, prioridad]
    );
  };

  const limpiarFiltros = () => {
    setFiltroEstado([]);
    setFiltroPrioridad([]);
  };

  const initials = useMemo(() => {
    const nombre = usuario?.nombre?.trim();
    if (!nombre) return 'CL';
    return nombre
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }, [usuario?.nombre]);

  const stats = [
    {
      label: 'Reportes Generados',
      value: reportesDelMes,
      iconBg: 'bg-cyan-500',
      iconName: 'document-text-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-cyan-400',
    },
    {
      label: 'Pendientes',
      value: pendientesCount,
      iconBg: 'bg-amber-500',
      iconName: 'time-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-amber-400',
    },
    {
      label: 'En proceso',
      value: enProcesoCount,
      iconBg: 'bg-blue-500',
      iconName: 'hourglass-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-blue-400',
    },
    {
      label: 'En espera',
      value: enEsperaCount,
      iconBg: 'bg-yellow-500',
      iconName: 'pause-circle-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-yellow-400',
    },
    {
      label: 'Resueltos',
      value: resueltosCount,
      iconBg: 'bg-emerald-500',
      iconName: 'checkmark-done-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-emerald-400',
    },
  ];

  const abrirWhatsAppSoporte = async () => {
    try {
      const phone = '5216634387533';
      const urlApp = `whatsapp://send?phone=${phone}`;
      const urlWeb = `https://wa.me/${phone}`;
      const supported = await Linking.canOpenURL(urlApp);
      const target = supported ? urlApp : urlWeb;
      await Linking.openURL(target);
    } catch (e) {
      Alert.alert('Soporte', 'No se pudo abrir WhatsApp.');
    }
  };

  const mainOptions = [
    {
      title: 'Generar reporte',
      description: 'Crea un nuevo reporte de servicio',
      gradient: 'from-cyan-600 to-blue-500',
      iconName: 'create-outline',
      onPress: () => router.push('/modal'),
    },
    {
      title: 'Ver mis reportes',
      description: 'Consulta historial de reportes finalizados',
      gradient: 'from-indigo-600 to-purple-500',
      iconName: 'folder-open-outline',
      onPress: async () => {
        setShowReportModal(true);
        const lista = (await cargarReportes(usuario?.email)) || [];
        await ensureDemoFinalizado(lista);
      },
    },
    {
      title: 'Cotizaciones',
      description: 'Ver cotizaciones de tus reportes',
      gradient: 'from-emerald-600 to-teal-500',
      iconName: 'pricetag-outline',
      onPress: async () => {
        await cargarCotizaciones(usuario?.email);
        setShowCotizacionesModal(true);
      },
    },
    {
      title: 'Seguimiento',
      description: 'Revisa el estado de tus casos',
      gradient: 'from-cyan-700 to-cyan-600',
      iconName: 'pulse-outline',
      onPress: async () => {
        setShowSeguimientoModal(true);
        await cargarReportes(usuario?.email);
      },
    },
    {
      title: 'Contactar soporte directo',
      description: 'Chat o correo con el equipo',
      gradient: 'from-slate-700 to-slate-600',
      iconName: 'headset-outline',
      onPress: abrirWhatsAppSoporte,
    },
  ];

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/');
  };

  const handleLogout = () => {
    setShowLogout(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={isMobile ? styles.contentMobile : styles.content}>
          <View style={isMobile ? styles.headerMobile : styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.statusDot} />
              </View>

              <View style={styles.headerInfo}>
                <Text style={[styles.welcomeText, { fontFamily }]}>
                  Bienvenido {usuario?.nombre ?? 'Usuario'}{usuario?.apellido ? `, ${usuario.apellido}` : ''}
                </Text>
                <Text style={[styles.empresaText, { fontFamily }]}>
                  Empresa {usuario?.empresa ? usuario.empresa : 'Empresa no definida'}
                </Text>
                <Text style={[styles.roleText, { fontFamily }]}>Panel de Cliente</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowStats(!showStats)}
                style={styles.toggleButton}
              >
                <Ionicons name={showStats ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {showStats && (
            <View style={isMobile ? styles.statsRowMobile : styles.statsRow}>
              {stats.map((stat, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  style={isMobile ? styles.statCardMobile : styles.statCard}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIcon, {
                      backgroundColor: stat.iconBg.includes('cyan') ? '#06b6d4'
                        : stat.iconBg.includes('amber') ? '#f59e0b'
                          : stat.iconBg.includes('blue') ? '#3b82f6'
                            : stat.iconBg.includes('yellow') ? '#eab308'
                              : stat.iconBg.includes('emerald') ? '#10b981'
                                : '#06b6d4'
                    }]}>
                      <Ionicons name={stat.iconName as any} size={24} color="white" />
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={[styles.statBadgeText, { fontFamily }]}>Hoy</Text>
                    </View>
                  </View>

                  <Text style={[styles.statValue, { fontFamily }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { fontFamily }]}>{stat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontFamily }]}>Acciones principales</Text>
            <Text style={[styles.sectionSubtitle, { fontFamily }]}>Genera y consulta tus reportes</Text>
          </View>

          <View style={isMobile ? styles.optionsGridMobile : styles.optionsGrid}>
            {mainOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={option.onPress}
                style={[
                  isMobile ? styles.optionCardMobile : styles.optionCard,
                  { backgroundColor: option.gradient.includes('cyan') ? '#0891b2' : option.gradient.includes('indigo') ? '#6366f1' : option.gradient.includes('emerald') ? '#059669' : '#475569' }
                ]}
              >
                <View style={isMobile ? styles.optionContentMobile : styles.optionContent}>
                  <View style={styles.optionIcon}>
                    <Ionicons name={option.iconName as any} size={28} color="white" />
                  </View>

                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { fontFamily }]}>{option.title}</Text>
                    <Text style={[styles.optionDescription, { fontFamily }]}>{option.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* PASO 4: Sección de Reportes Finalizados por Técnico */}
          {reportesFinalizados.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <View style={{ backgroundColor: '#f59e0b20', borderRadius: 8, padding: 6 }}>
                    <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                  </View>
                  <View>
                    <Text style={[styles.sectionTitle, { fontFamily }]}>Reportes por confirmar</Text>
                    <Text style={[styles.sectionSubtitle, { fontFamily }]}>
                      {reportesFinalizados.length} reporte{reportesFinalizados.length !== 1 ? 's' : ''} pendiente{reportesFinalizados.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                {reportesFinalizados.map((reporte) => (
                  <TouchableOpacity
                    key={reporte.id}
                    onPress={() => {
                      setReporteAConfirmar(reporte);
                      setShowConfirmarFinalizacionModal(true);
                    }}
                    style={[styles.reportCard, { borderLeftWidth: 4, borderLeftColor: '#f59e0b', backgroundColor: '#f59e0b08' }]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reportTitle, { fontFamily }]}>
                          {reporte.equipo_descripcion}
                        </Text>
                        <Text style={[styles.reportSubtitle, { fontFamily, color: '#94a3b8', marginTop: 4 }]}>
                          Técnico: {reporte.empleado_asignado_nombre}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#f59e0b', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={[styles.badge, { fontFamily, color: '#000', fontSize: 12, fontWeight: '700' }]}>
                          Pendiente
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.reportSubtitle, { fontFamily, color: '#cbd5e1', fontSize: 13 }]}>
                      Toca para revisar y confirmar la finalización
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

        </View>
      </ScrollView>

      {showReportModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { flex: 1, flexDirection: 'column' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { fontFamily }]}>Mis reportes</Text>
                <Text style={[styles.modalSubtitle, { fontFamily }]}>
                  Reportes finalizados
                </Text>
              </View>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity
                  onPress={() => cargarReportes(usuario?.email)}
                  disabled={loadingReportes}
                  style={[styles.refreshButton, loadingReportes && styles.refreshButtonDisabled]}
                >
                  {loadingReportes ? (
                    <ActivityIndicator size="small" color="#67e8f9" />
                  ) : (
                    <Text style={[styles.refreshButtonText, { fontFamily }]}>Actualizar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowReportModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={[styles.infoText, { fontFamily }]}>
                Aquí solo ves los finalizados; los pendientes/en espera irán en Seguimiento.
              </Text>
            </View>

            {loadingReportes && (
              <View style={styles.reportCard}>
                <Text style={[styles.loadingText, { fontFamily }]}>Cargando reportes...</Text>
              </View>
            )}

            {!loadingReportes && errorReportes ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, { fontFamily }]}>{errorReportes}</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && finalizados.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.reportCard}>
                  <Text style={[styles.emptyText, { fontFamily }]}>Aún no tienes reportes finalizados.</Text>
                </View>
                <View style={styles.demoBox}>
                  <Text style={[styles.demoTitle, { fontFamily }]}>Ejemplo generado (SQL)</Text>
                  {renderReporteCard(
                    {
                      id: 'sample-finalizado',
                      equipo_descripcion: 'Caso demo finalizado',
                      comentario: 'Ejemplo de reporte marcado como finalizado.',
                      created_at: new Date().toISOString(),
                      prioridad: 'media',
                      estado: 'terminado',
                      sucursal: 'Sucursal Demo',
                    },
                    true
                  )}
                </View>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && finalizados.length > 0 ? (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={styles.reportsContainer}>
                  {finalizados.map((rep) => renderReporteCard(rep))}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {showSeguimientoModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { flex: 1, flexDirection: 'column' }]}>
            <View style={[styles.modalHeader, isMobile && styles.modalHeaderMobile]}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, isMobile && styles.modalTitleMobile, { fontFamily }]}>Seguimiento</Text>
                <Text style={[styles.modalSubtitle, isMobile && styles.modalSubtitleMobile, { fontFamily }]}>Reportes activos (pendiente, en proceso, etc.).</Text>
              </View>
              <View style={[styles.modalHeaderButtons, isMobile && styles.modalHeaderButtonsMobile]}>
                <TouchableOpacity
                  onPress={() => setShowFiltros((prev) => !prev)}
                  style={styles.filterToggleButton}
                >
                  <Ionicons name="options-outline" size={16} color="#06b6d4" />
                  <Text style={[styles.refreshButtonText, { fontFamily, color: '#06b6d4' }]}>
                    {showFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => cargarReportes(usuario?.email)}
                  style={styles.refreshButton}
                >
                  <Text style={[styles.refreshButtonText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowSeguimientoModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingReportes && (
              <View style={styles.reportCard}>
                <Text style={[styles.loadingText, { fontFamily }]}>Cargando reportes...</Text>
              </View>
            )}

            {!loadingReportes && errorReportes ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, { fontFamily }]}>{errorReportes}</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && activos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.reportCard}>
                  <Text style={[styles.emptyText, { fontFamily }]}>No tienes reportes en seguimiento.</Text>
                </View>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && activos.length > 0 ? (
              <>
                {showFiltros && (
                  <View style={styles.filtroPanel}>
                    <View style={styles.filtroPanelHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="options-outline" size={16} color="#06b6d4" />
                        <Text style={[styles.filtroTitulo, { fontFamily }]}>Filtros</Text>
                      </View>
                      {(filtroEstado.length > 0 || filtroPrioridad.length > 0) && (
                        <TouchableOpacity onPress={limpiarFiltros} style={styles.limpiarFiltrosButtonSmall}>
                          <Ionicons name="close-circle" size={16} color="#f87171" />
                          <Text style={[styles.limpiarFiltrosTextSmall, { fontFamily }]}>Limpiar</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.filtroSection}>
                      <Text style={[styles.filtroLabel, { fontFamily }]}>Estado</Text>
                      <View style={styles.filtroChips}>
                        {[
                          { value: 'pendiente', label: 'Pendiente', icon: 'time-outline', color: '#f59e0b' },
                          { value: 'en proceso', label: 'En proceso', icon: 'hourglass-outline', color: '#3b82f6' },
                          { value: 'en espera', label: 'En espera', icon: 'pause-circle-outline', color: '#eab308' },
                        ].map((estado) => {
                          const isActive = filtroEstado.includes(estado.value);
                          return (
                            <TouchableOpacity
                              key={estado.value}
                              onPress={() => toggleFiltroEstado(estado.value)}
                              style={[
                                styles.filtroChip,
                                isActive && { ...styles.filtroChipActive, borderColor: estado.color }
                              ]}
                            >
                              <Ionicons
                                name={estado.icon as any}
                                size={14}
                                color={isActive ? estado.color : '#94a3b8'}
                              />
                              <Text style={[
                                styles.filtroChipText,
                                { fontFamily },
                                isActive && { ...styles.filtroChipTextActive, color: estado.color }
                              ]}>
                                {estado.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.filtroSection}>
                      <Text style={[styles.filtroLabel, { fontFamily }]}>Prioridad</Text>
                      <View style={styles.filtroChips}>
                        {[
                          { value: 'baja', label: 'Baja', icon: 'chevron-down-outline', color: '#10b981' },
                          { value: 'media', label: 'Media', icon: 'remove-outline', color: '#f59e0b' },
                          { value: 'urgente', label: 'Urgente', icon: 'chevron-up-outline', color: '#ef4444' },
                        ].map((prioridad) => {
                          const isActive = filtroPrioridad.includes(prioridad.value);
                          return (
                            <TouchableOpacity
                              key={prioridad.value}
                              onPress={() => toggleFiltroPrioridad(prioridad.value)}
                              style={[
                                styles.filtroChip,
                                isActive && { ...styles.filtroChipActive, borderColor: prioridad.color }
                              ]}
                            >
                              <Ionicons
                                name={prioridad.icon as any}
                                size={14}
                                color={isActive ? prioridad.color : '#94a3b8'}
                              />
                              <Text style={[
                                styles.filtroChipText,
                                { fontFamily },
                                isActive && { ...styles.filtroChipTextActive, color: prioridad.color }
                              ]}>
                                {prioridad.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.filtroResumen}>
                      <Ionicons name="information-circle-outline" size={14} color="#94a3b8" />
                      <Text style={[styles.filtroResumenText, { fontFamily }]}>
                        Mostrando {activosFiltrados.length} de {activos.length} reportes
                      </Text>
                    </View>
                  </View>
                )}

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.reportsContainer}>
                    {Object.keys(activosPorEstado).length === 0 ? (
                      <View style={styles.reportCard}>
                        <Text style={[styles.emptyText, { fontFamily }]}>No hay reportes para este filtro.</Text>
                      </View>
                    ) : (
                      <>
                        {['pendiente', 'en proceso', 'en espera']
                          .filter((e) => activosPorEstado[e])
                          .map((estado) => (
                            <View key={estado}>
                              <Text style={[styles.sectionTitle, { fontFamily, marginBottom: 8 }]}>{estado.toUpperCase()}</Text>
                              {activosPorEstado[estado].map((rep) => renderReporteCard(rep))}
                            </View>
                          ))}
                        {Object.keys(activosPorEstado)
                          .filter((e) => !['pendiente', 'en proceso', 'en espera'].includes(e))
                          .map((estado) => (
                            <View key={estado}>
                              <Text style={[styles.sectionTitle, { fontFamily, marginBottom: 8 }]}>{estado.toUpperCase()}</Text>
                              {activosPorEstado[estado].map((rep) => renderReporteCard(rep))}
                            </View>
                          ))}
                      </>
                    )}
                  </View>
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      )}

      {showReporteDetail && selectedReporte && (
        <View style={styles.detailOverlay}>
          <View style={styles.detailContainer}>
            <View style={styles.detailHeader}>
              <View style={styles.detailHeaderText}>
                <Text style={[styles.detailTitle, { fontFamily }]}>Detalles del reporte</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowReporteDetail(false);
                  setSelectedReporte(null);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScroll}>
              <View style={styles.detailField}>
                <Text style={[styles.detailLabel, { fontFamily }]}>Equipo / Servicio</Text>
                <Text style={[styles.detailValue, { fontFamily, fontWeight: '600' }]}>
                  {selectedReporte.equipo_descripcion || 'No especificado'}
                </Text>
              </View>

              {selectedReporte.equipo_modelo && (
                <View style={styles.detailField}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Modelo</Text>
                  <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.equipo_modelo}</Text>
                </View>
              )}

              {selectedReporte.equipo_serie && (
                <View style={styles.detailField}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Serie</Text>
                  <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.equipo_serie}</Text>
                </View>
              )}

              <View style={styles.detailField}>
                <Text style={[styles.detailLabel, { fontFamily }]}>Comentario / Problema</Text>
                <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.comentario || 'Sin comentarios'}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={[styles.detailField, { flex: 1 }]}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Prioridad</Text>
                  <Text style={[styles.detailValue, { fontFamily, textTransform: 'capitalize' }]}>{selectedReporte.prioridad || 'media'}</Text>
                </View>

                <View style={[styles.detailField, { flex: 1 }]}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Estado</Text>
                  <Text style={[styles.detailValue, { fontFamily, color: '#6ee7b7', fontWeight: '600', textTransform: 'capitalize' }]}>
                    {selectedReporte.estado || 'terminado'}
                  </Text>
                </View>
              </View>

              {selectedReporte.sucursal && (
                <View style={styles.detailField}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Sucursal</Text>
                  <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.sucursal}</Text>
                </View>
              )}

              {selectedReporte.empresa && (
                <View style={styles.detailField}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Empresa</Text>
                  <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.empresa}</Text>
                </View>
              )}

              {selectedReporte.direccion_sucursal && (
                <View style={styles.detailField}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Dirección</Text>
                  <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.direccion_sucursal}</Text>
                </View>
              )}

              <View style={styles.detailField}>
                <Text style={[styles.detailLabel, { fontFamily }]}>Fecha de creación</Text>
                <Text style={[styles.detailValue, { fontFamily }]}>
                  {selectedReporte.created_at
                    ? new Date(selectedReporte.created_at).toLocaleString()
                    : 'No disponible'}
                </Text>
              </View>

              {selectedReporte.usuario_email && (
                <View style={styles.detailField}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Solicitante</Text>
                  <Text style={[styles.detailValue, { fontFamily }]}>
                    {selectedReporte.usuario_nombre} {selectedReporte.usuario_apellido}
                  </Text>
                  <Text style={[styles.detailFieldSubtext, { fontFamily }]}>{selectedReporte.usuario_email}</Text>
                </View>
              )}

              {selectedReporte.estado === 'cotizado' && (
                <>
                  <View style={[styles.detailSeparator, { marginVertical: 20 }]}>
                    <View style={styles.separatorLine} />
                    <Text style={[styles.separatorText, { fontFamily }]}>Información de Cotización</Text>
                    <View style={styles.separatorLine} />
                  </View>

                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily, color: '#f59e0b' }]}>Trabajo Realizado</Text>
                    <Text style={[styles.detailValue, { fontFamily }]}>
                      {selectedReporte.descripcion_trabajo || 'No especificado'}
                    </Text>
                  </View>

                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily, color: '#f59e0b' }]}>Precio de la Cotización</Text>
                    <Text style={[styles.detailValue, { fontFamily, fontSize: 24, fontWeight: '700', color: '#10b981' }]}>
                      ${selectedReporte.precio_cotizacion ? parseFloat(selectedReporte.precio_cotizacion).toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.detailFooter}>
              <TouchableOpacity
                onPress={() => {
                  setShowReporteDetail(false);
                  setSelectedReporte(null);
                }}
                style={styles.detailCloseButton}
              >
                <Text style={[styles.detailCloseButtonText, { fontFamily }]}>Cerrar</Text>
              </TouchableOpacity>

              {selectedReporte.estado === 'cotizado' && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Confirmar Cotización',
                      `¿Deseas confirmar esta cotización por $${parseFloat(selectedReporte.precio_cotizacion).toFixed(2)}?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Confirmar',
                          onPress: () => {
                            // Aquí irá la lógica para confirmar la cotización
                            Alert.alert('Cotización confirmada', 'El trabajo será procesado');
                            setShowReporteDetail(false);
                            setSelectedReporte(null);
                          }
                        }
                      ]
                    );
                  }}
                  style={styles.detailConfirmButton}
                >
                  <Text style={[styles.detailConfirmButtonText, { fontFamily }]}>Confirmar Cotización</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {showSuccessOverlay && (
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            <View style={styles.successHeader}>
              <View style={styles.successIcon}>
                <Ionicons name="sparkles" size={22} color="#22d3ee" />
              </View>
              <Text style={[styles.successTitle, { fontFamily }]}>Reporte enviado</Text>
            </View>
            <Text style={[styles.successMessage, { fontFamily }]}>
              Tu reporte se generó exitosamente. El equipo lo revisará en breve.
            </Text>
            <TouchableOpacity
              onPress={() => setShowSuccessOverlay(false)}
              style={styles.successButton}
              activeOpacity={0.9}
            >
              <Text style={[styles.successButtonText, { fontFamily }]}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal Cotizaciones */}
      {showCotizacionesModal && (
        <View style={styles.overlay}>
          <View style={[styles.largeModal, { flex: 1, flexDirection: 'column' }]}>
            <View style={styles.largeModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.largeModalTitle, { fontFamily }]}>Cotizaciones</Text>
                <Text style={[styles.largeModalSubtitle, { fontFamily }]}>Cotizaciones de tus reportes</Text>
                <Text style={[styles.reportMeta, { fontFamily }]}>DEBUG: {cotizaciones.length} items, loading: {loadingCotizaciones}</Text>
              </View>
              <TouchableOpacity onPress={() => {
                setShowCotizacionesModal(false);
                setCotizaciones([]);
              }} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            {loadingCotizaciones && (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>Cargando cotizaciones...</Text>
              </View>
            )}

            {!loadingCotizaciones && cotizaciones.length === 0 && (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>No tienes cotizaciones pendientes.</Text>
              </View>
            )}

            {!loadingCotizaciones && cotizaciones.length > 0 && (
              <View style={{ flex: 1, width: '100%' }}>
                <Text style={[styles.infoText, { fontFamily, color: '#10b981', paddingHorizontal: 16, marginBottom: 8 }]}>
                  ✓ Mostrando {cotizaciones.length} cotizaciones
                </Text>
                <ScrollView
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
                >
                  {cotizaciones.map((cot: any) => {
                    console.log('[RENDER] Renderizando cotización:', cot.id, cot.estado);
                    return (
                      <TouchableOpacity
                        key={cot.id}
                        style={styles.reportCard}
                        onPress={() => {
                          console.log('[UI] Presionando cotización:', cot.id);
                          setCotizacionSeleccionada(cot);
                          setShowCotizacionDetalleModal(true);
                        }}
                      >
                        <View style={styles.reportHeader}>
                          <View style={styles.reportHeaderText}>
                            <Text style={[styles.reportTitle, { fontFamily }]} numberOfLines={1}>
                              ${parseFloat(cot.precio_cotizacion).toFixed(2)}
                            </Text>
                            <Text style={[styles.reportSubtitle, { fontFamily }]} numberOfLines={1}>
                              {cot.empleado_nombre || 'Empleado'} • {cot.reportes?.equipo_descripcion || 'Equipo'}
                            </Text>
                            <Text style={[styles.reportMeta, { fontFamily }]} numberOfLines={1}>
                              {new Date(cot.created_at).toLocaleDateString('es-ES')}
                            </Text>
                          </View>
                          <View style={[
                            styles.estadoBadge,
                            cot.estado === 'pendiente' && { backgroundColor: '#fbbf24', borderColor: '#f59e0b' },
                            cot.estado === 'aceptada' && { backgroundColor: '#86efac', borderColor: '#16a34a' },
                            cot.estado === 'rechazada' && { backgroundColor: '#fca5a5', borderColor: '#dc2626' },
                          ]}>
                            <Text style={[styles.estadoText, { fontFamily }]}>
                              {cot.estado === 'pendiente' ? 'Pendiente' : cot.estado === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Modal Detalle Cotización */}
      {showCotizacionDetalleModal && cotizacionSeleccionada && (
        <View style={styles.overlay}>
          <View style={[styles.largeModal, { flex: 1, flexDirection: 'column' }]}>
            <View style={styles.largeModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.largeModalTitle, { fontFamily }]}>Detalle de Cotización</Text>
                <Text style={[styles.largeModalSubtitle, { fontFamily }]}>Revisión de cotización</Text>
              </View>
              <TouchableOpacity onPress={() => {
                setShowCotizacionDetalleModal(false);
                setCotizacionSeleccionada(null);
              }} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView style={[styles.listScroll, { flex: 1 }]} showsVerticalScrollIndicator={false}>
              <View style={styles.detailContent}>
                {/* Información del reporte */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { fontFamily }]}>Información del Reporte</Text>
                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily }]}>Equipo/Servicio</Text>
                    <Text style={[styles.detailValue, { fontFamily }]}>{cotizacionSeleccionada.reportes?.equipo_descripcion || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily }]}>Comentario</Text>
                    <Text style={[styles.detailValue, { fontFamily }]}>{cotizacionSeleccionada.reportes?.comentario || 'N/A'}</Text>
                  </View>
                </View>

                {/* Información de la cotización */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { fontFamily }]}>Información de la Cotización</Text>
                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily }]}>Empleado</Text>
                    <Text style={[styles.detailValue, { fontFamily }]}>{cotizacionSeleccionada.empleado_nombre || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily }]}>Análisis General</Text>
                    <Text style={[styles.detailValue, { fontFamily }]}>{cotizacionSeleccionada.analisis_general || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily }]}>Precio Cotizado</Text>
                    <Text style={[styles.detailValue, { fontFamily, fontSize: 18, fontWeight: 'bold', color: '#f59e0b' }]}>
                      ${parseFloat(cotizacionSeleccionada.precio_cotizacion).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={[styles.detailLabel, { fontFamily }]}>Estado</Text>
                    <Text style={[
                      styles.detailValue,
                      { fontFamily, fontWeight: 'bold' },
                      cotizacionSeleccionada.estado === 'pendiente' && { color: '#fbbf24' },
                      cotizacionSeleccionada.estado === 'aceptada' && { color: '#86efac' },
                      cotizacionSeleccionada.estado === 'rechazada' && { color: '#fca5a5' },
                    ]}>
                      {cotizacionSeleccionada.estado === 'pendiente' ? 'Pendiente' : cotizacionSeleccionada.estado === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                    </Text>
                  </View>
                </View>

                {/* Acciones */}
                {cotizacionSeleccionada.estado === 'pendiente' && (
                  <View style={styles.detailActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                      onPress={async () => {
                        // Actualizar el estado del reporte a "en_proceso" (aceptada la cotización)
                        const resultado = await actualizarEstadoReporteAsignado(cotizacionSeleccionada.reporte_id, 'en_proceso');
                        if (resultado.success) {
                          showToast('Cotización aceptada. El reporte está listo para trabajar.', 'success');
                          cargarCotizaciones(usuario?.email);
                          setShowCotizacionDetalleModal(false);
                        }
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text style={[styles.actionButtonText, { fontFamily }]}>Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                      onPress={async () => {
                        // Simplemente cerrar el modal (no hay rechazo en backend actualmente)
                        showToast('Cotización no aceptada', 'info');
                        cargarCotizaciones(usuario?.email);
                        setShowCotizacionDetalleModal(false);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="white" />
                      <Text style={[styles.actionButtonText, { fontFamily }]}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* PASO 4: Modal para Confirmar Finalización del Trabajo */}
      {showConfirmarFinalizacionModal && reporteAConfirmar && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { flex: 1, maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { fontFamily }]}>Confirmar finalización</Text>
                <Text style={[styles.modalSubtitle, { fontFamily }]}>Revisión de trabajo completado</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmarFinalizacionModal(false);
                  setReporteAConfirmar(null);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
                <View style={styles.reportCard}>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ backgroundColor: '#10b98120', borderRadius: 8, padding: 8 }}>
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                    <Text style={[styles.reportTitle, { fontFamily, color: '#10b981', flex: 1 }]}>¡Trabajo finalizado!</Text>
                  </View>
                  <Text style={[styles.modalSubtitle, { fontFamily, color: '#cbd5e1' }]}>El técnico completó el trabajo. Por favor confirma.</Text>
                </View>
                <View style={styles.reportCard}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Técnico: {reporteAConfirmar.empleado_asignado_nombre || 'No asignado'}</Text>
                </View>
                <View style={styles.reportCard}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Equipo: {reporteAConfirmar.equipo_descripcion}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setShowConfirmarFinalizacionModal(false); setReporteAConfirmar(null); }}>
                <Text style={[styles.cancelButtonText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, confirmandoFinalizacion && { opacity: 0.6 }]}
                disabled={confirmandoFinalizacion}
                onPress={async () => {
                  setConfirmandoFinalizacion(true);
                  try {
                    router.push({
                      pathname: '/encuesta',
                      params: {
                        reporteId: reporteAConfirmar.id,
                        clienteEmail: usuario?.email || '',
                        clienteNombre: usuario?.nombre || '',
                        empresa: usuario?.empresa || '',
                        empleadoEmail: reporteAConfirmar.empleado_asignado_email || '',
                        empleadoNombre: reporteAConfirmar.empleado_asignado_nombre || '',
                      },
                    });
                    setShowConfirmarFinalizacionModal(false);
                    setReporteAConfirmar(null);
                  } catch (error) {
                    alert('Error: ' + error);
                  } finally {
                    setConfirmandoFinalizacion(false);
                  }
                }}
              >
                <Text style={[styles.submitButtonText, { fontFamily }]}>Aceptar y continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal Logout */}
      {showLogout && (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutContainer}>
            <View style={styles.logoutHeader}>
              <View style={styles.logoutIcon}>
                <Ionicons name="alert-circle-outline" size={22} color="#f87171" />
              </View>
              <Text style={[styles.logoutTitle, { fontFamily }]}>Cerrar sesión</Text>
            </View>
            <Text style={[styles.logoutMessage, { fontFamily }]}>¿Seguro que deseas salir?</Text>
            <View style={styles.logoutButtons}>
              <TouchableOpacity style={styles.logoutCancelButton} onPress={() => setShowLogout(false)}>
                <Text style={[styles.logoutCancelText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutConfirmButton} onPress={confirmLogout}>
                <Text style={[styles.logoutConfirmText, { fontFamily }]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Toast Personalizado */}
      {toastMessage && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            borderRadius: 12,
            overflow: 'hidden',
            zIndex: 9999,
          }}
        >
          <LinearGradient
            colors={
              toastType === 'success'
                ? ['#10b981', '#059669']
                : toastType === 'error'
                  ? ['#ef4444', '#dc2626']
                  : toastType === 'warning'
                    ? ['#f59e0b', '#d97706']
                    : ['#06b6d4', '#0891b2']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
              gap: 12,
            }}
          >
            <Ionicons
              name={
                toastType === 'success'
                  ? 'checkmark-circle'
                  : toastType === 'error'
                    ? 'alert-circle'
                    : toastType === 'warning'
                      ? 'warning'
                      : 'information-circle'
              }
              size={24}
              color="white"
            />
            <Text
              style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 14,
                flex: 1,
                fontFamily,
              }}
            >
              {toastMessage}
            </Text>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 24,
    maxWidth: 1152,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerMobile: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0891b2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  statusDot: {
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
  headerInfo: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  empresaText: {
    color: '#22d3ee',
    fontWeight: '600',
    fontSize: 14,
  },
  roleText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1e293bcc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1e293bcc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsRow: {
    marginBottom: 32,
    flexDirection: 'row',
    gap: 16,
  },
  statsRowMobile: {
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b66',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#33415580',
    padding: 20,
  },
  statCardMobile: {
    backgroundColor: '#1e293b66',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#33415580',
    padding: 20,
    marginBottom: 12,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadge: {
    backgroundColor: '#33415580',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statBadgeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: 'white',
    fontWeight: '900',
    fontSize: 30,
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#06b6d4',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#0b1626',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  filtroPanel: {
    backgroundColor: '#0b1626',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  filtroPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filtroTitulo: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '700',
  },
  filtroSection: {
    gap: 6,
    marginBottom: 10,
  },
  filtroLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  filtroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#132137',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1f2b3d',
  },
  filtroChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 2,
  },
  filtroChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  filtroChipTextActive: {
    fontWeight: '700',
  },
  limpiarFiltrosButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ef44441a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef44444d',
  },
  limpiarFiltrosTextSmall: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  filtroResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  filtroResumenText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  optionsGrid: {
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  optionsGridMobile: {
    marginBottom: 24,
    gap: 12,
  },
  optionCard: {
    width: 'calc(50% - 8px)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#ffffff1a',
  },
  optionCardMobile: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#ffffff1a',
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionContentMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#ffffff33',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 4,
  },
  optionDescription: {
    color: '#ffffffcc',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000b3',
    zIndex: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 768,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  modalHeaderMobile: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 20,
  },
  modalTitleMobile: {
    fontSize: 18,
    lineHeight: 22,
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  modalSubtitleMobile: {
    fontSize: 13,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderButtonsMobile: {
    width: '100%',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshButtonText: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: '#1e293b66',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  reportCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  reportCardInfo: {
    flex: 1,
  },
  reportCardTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  reportCardDate: {
    color: '#64748b',
    fontSize: 12,
  },
  reportCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eyeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCardComment: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 8,
  },
  reportCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#ef44441a',
    borderWidth: 1,
    borderColor: '#ef44444d',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
  },
  emptyContainer: {
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  demoBox: {
    backgroundColor: '#0f172acc',
    borderWidth: 1,
    borderColor: '#10b9814d',
    borderRadius: 12,
    padding: 16,
  },
  demoTitle: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  reportsList: {
    maxHeight: 420,
  },
  reportsContainer: {
    gap: 12,
  },
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000b3',
    zIndex: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContainer: {
    width: '100%',
    maxWidth: 672,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  detailHeaderText: {
    flex: 1,
  },
  detailTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 18,
  },
  detailScroll: {
    maxHeight: 500,
  },
  detailField: {
    backgroundColor: '#1e293b80',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
  },
  detailFieldSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
  detailCloseButton: {
    flex: 1,
    backgroundColor: '#475569',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  detailCloseButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  detailConfirmButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  detailConfirmButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  detailSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  separatorText: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  successContainer: {
    width: '100%',
    maxWidth: 448,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#22d3ee66',
    borderRadius: 16,
    padding: 20,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  successIcon: {
    backgroundColor: '#22d3ee26',
    borderRadius: 20,
    padding: 10,
  },
  successTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  successMessage: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 16,
  },
  successButton: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22d3ee80',
  },
  successButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  logoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000b3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoutContainer: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 24,
  },
  logoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ef444433',
    borderWidth: 1,
    borderColor: '#f8717180',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoutMessage: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 24,
  },
  logoutButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  logoutCancelText: {
    color: '#e2e8f0',
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  logoutConfirmText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  largeModal: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '85%',
    maxWidth: '95%',
    width: '100%',
    overflow: 'hidden',
  },
  largeModalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  largeModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  largeModalSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  listScroll: {
    flex: 1,
  },
  listSpacing: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportHeaderText: {
    flex: 1,
  },
  reportTitle: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
  },
  reportSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  reportMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 20,
  },
  detailSection: {
    gap: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06b6d4',
    marginBottom: 12,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000b3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#475569',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34d399',
  },
});
