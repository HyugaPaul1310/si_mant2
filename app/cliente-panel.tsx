// @ts-nocheck
import { obtenerReportesPorUsuario } from '@/lib/reportes';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      const { success, data, error } = await obtenerReportesPorUsuario(email);
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

  // Cargar reportes al enfocar el panel
  useFocusEffect(
    useCallback(() => {
      if (usuario?.email) {
        cargarReportes(usuario.email);
      }
    }, [usuario?.email, cargarReportes])
  );

  // Refrescar empresa/apellido si no están en AsyncStorage
  useEffect(() => {
    const refrescarPerfil = async () => {
      if (!usuario?.email) return;
      if (usuario?.empresa && usuario?.apellido) return; // ya lo tenemos completo
      const { data, error } = await supabase
        .from('usuarios')
        .select('empresa, apellido, nombre')
        .eq('email', usuario.email)
        .single();
      if (error || !data) return;
      const actualizado = {
        ...usuario,
        nombre: data.nombre ?? usuario.nombre,
        apellido: data.apellido ?? usuario.apellido,
        empresa: data.empresa ?? usuario.empresa,
      };
      setUsuario(actualizado);
      await AsyncStorage.setItem('user', JSON.stringify(actualizado));
    };
    refrescarPerfil();
  }, [usuario?.email, usuario?.empresa, usuario?.apellido]);

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
  const enProcesoCount = useMemo(
    () => reportes.filter((r) => ((r.estado || '').toLowerCase().replace('_', ' ')) === 'en proceso').length,
    [reportes]
  );
  const resueltosCount = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'terminado').length,
    [reportes]
  );
  const activos = useMemo(() => reportes.filter((r) => (r.estado || '').toLowerCase() !== 'terminado'), [reportes]);
  const activosPorEstado = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    activos.forEach((r) => {
      let key = (r.estado || 'pendiente').toLowerCase();
      if (key === 'en_proceso') key = 'en proceso';
      if (key === 'en_espera') key = 'en espera';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(r);
    });
    return grupos;
  }, [activos]);

  const renderReporteCard = (rep: any, isSample = false) => {
    const estadoBg = '#10b98133';
    const estadoText = '#6ee7b7';
    const estadoBorder = '#10b98166';
    
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
              <Text style={[styles.badgeText, { fontFamily, color: estadoText }]}>
                {isSample
                  ? 'Completado'
                  : ((rep.estado || '').toLowerCase() === 'en_proceso'
                      ? 'en proceso'
                      : (rep.estado || 'terminado'))}
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
      const tieneFinalizados = lista.some((r) => r.estado === 'terminado');
      const yaExisteDemo = lista.some((r) => r.equipo_descripcion === 'Caso demo finalizado');
      if (tieneFinalizados || yaExisteDemo) return;

      const { data, error } = await supabase
        .from('reportes')
        .insert([
          {
            usuario_email: usuario.email,
            usuario_nombre: usuario.nombre || 'Cliente',
            usuario_apellido: usuario.apellido || null,
            empresa: usuario.empresa || null,
            sucursal: 'Sucursal Demo',
            equipo_descripcion: 'Caso demo finalizado',
            comentario: 'Ejemplo de reporte marcado como finalizado.',
            prioridad: 'media',
            estado: 'terminado',
            direccion_sucursal: null,
            ubicacion_maps: null,
            foto_fachada_url: null,
            imagenes_reporte: null,
            video_url: null,
          },
        ])
        .select();

      if (error) return;
      if (data && data.length > 0) {
        setReportes((prev) => [data[0], ...(prev || [])]);
      }
    },
    [usuario]
  );

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
      label: 'Reportes del mes',
      value: reportesDelMes,
      iconBg: 'bg-cyan-500',
      iconName: 'document-text-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-cyan-400',
    },
    {
      label: 'En proceso',
      value: enProcesoCount,
      iconBg: 'bg-amber-500',
      iconName: 'time-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-amber-400',
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
      description: 'Consulta historial y estados',
      gradient: 'from-indigo-600 to-purple-500',
      iconName: 'folder-open-outline',
      onPress: async () => {
        setShowReportModal(true);
        const lista = (await cargarReportes(usuario?.email)) || [];
        await ensureDemoFinalizado(lista);
      },
    },
    {
      title: 'Seguimiento',
      description: 'Revisa el estado de tus casos',
      gradient: 'from-emerald-600 to-teal-500',
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

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={isMobile ? styles.statsRowMobile : styles.statsRow}>
            {stats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                style={isMobile ? styles.statCardMobile : styles.statCard}
              >
                <View style={styles.statCardHeader}>
                  <View style={[styles.statIcon, { backgroundColor: stat.iconBg.replace('bg-', '').includes('cyan') ? '#06b6d4' : stat.iconBg.replace('bg-', '').includes('amber') ? '#f59e0b' : '#10b981' }]}>
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
        </View>
      </ScrollView>

      {showReportModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { fontFamily }]}>Mis reportes</Text>
                <Text style={[styles.modalSubtitle, { fontFamily }]}>
                  Popup de reportes finalizados (se mantienen visibles aunque estén completados).
                </Text>
              </View>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity
                  onPress={() => cargarReportes(usuario?.email)}
                  style={styles.refreshButton}
                >
                  <Text style={[styles.refreshButtonText, { fontFamily }]}>Actualizar</Text>
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
              <ScrollView style={styles.reportsList} showsVerticalScrollIndicator={false}>
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
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { fontFamily }]}>Seguimiento</Text>
                <Text style={[styles.modalSubtitle, { fontFamily }]}>Reportes activos (pendiente, en proceso, etc.).</Text>
              </View>
              <View style={styles.modalHeaderButtons}>
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
              <ScrollView style={styles.reportsList} showsVerticalScrollIndicator={false}>
                <View style={styles.reportsContainer}>
                  {['pendiente', 'en proceso', 'programado', 'asignado', 'pausado']
                    .filter((e) => activosPorEstado[e])
                    .map((estado) => (
                      <View key={estado}>
                        <Text style={[styles.sectionTitle, { fontFamily, marginBottom: 8 }]}>{estado.toUpperCase()}</Text>
                        {activosPorEstado[estado].map((rep) => renderReporteCard(rep))}
                      </View>
                    ))}
                  {Object.keys(activosPorEstado)
                    .filter((e) => !['pendiente', 'en proceso', 'programado', 'asignado', 'pausado'].includes(e))
                    .map((estado) => (
                      <View key={estado}>
                        <Text style={[styles.sectionTitle, { fontFamily, marginBottom: 8 }]}>{estado.toUpperCase()}</Text>
                        {activosPorEstado[estado].map((rep) => renderReporteCard(rep))}
                      </View>
                    ))}
                </View>
              </ScrollView>
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
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                setShowReporteDetail(false);
                setSelectedReporte(null);
              }}
              style={styles.detailCloseButton}
            >
              <Text style={[styles.detailCloseButtonText, { fontFamily }]}>Cerrar</Text>
            </TouchableOpacity>
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

      {showLogout && (
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutContainer}>
            <View style={styles.logoutHeader}>
              <View style={styles.logoutIcon}>
                <Ionicons name="alert-circle-outline" size={22} color="#f87171" />
              </View>
              <Text style={[styles.logoutTitle, { fontFamily }]}>Cerrar sesión</Text>
            </View>
            <Text style={[styles.logoutMessage, { fontFamily }]}>
              ¿Seguro que deseas salir? Se cerrará tu sesión en este dispositivo.
            </Text>
            <View style={styles.logoutButtons}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={() => setShowLogout(false)}
              >
                <Text style={[styles.logoutCancelText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={confirmLogout}
              >
                <Text style={[styles.logoutConfirmText, { fontFamily }]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    color: 'white',
    fontWeight: '900',
    fontSize: 24,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
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
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 20,
  },
  modalSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
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
  detailCloseButton: {
    marginTop: 16,
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
});
