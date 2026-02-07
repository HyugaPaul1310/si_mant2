// @ts-nocheck
import {
  actualizarEstadoReporteAsignado,
  actualizarEstadoTareaBackend,
  obtenerArchivosReporteBackend,
  obtenerInventarioEmpleadoBackend,
  obtenerReportesAsignados,
  obtenerTareasEmpleadoBackend
} from '@/lib/api-backend';
import { getProxyUrl } from '@/lib/cloudflare';
import { obtenerColorEstado, obtenerNombreEstado } from '@/lib/estado-mapeo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  rol?: string;
};

function EmpleadoPanelContent() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fontFamily = Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif';
  const [usuario, setUsuario] = useState<Empleado | null>(null);
  const [tareas, setTareas] = useState(0);
  const [reportes, setReportes] = useState(0);
  const [herramientas, setHerramientas] = useState(0);
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
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [listaHerramientas, setListaHerramientas] = useState<any[]>([]);
  const [loadingHerramientas, setLoadingHerramientas] = useState(false);
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
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [showConfirmarAnalisis, setShowConfirmarAnalisis] = useState(false);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          // Validación: solo empleados pueden acceder a este panel
          if (userData.rol !== 'empleado') {
            console.warn(`[SEGURIDAD] Usuario ${userData.email} con rol ${userData.rol} intentó acceder a /empleado-panel. Redirigiendo...`);
            // Redirigir según su rol
            switch (userData.rol) {
              case 'admin':
                router.replace('/admin');
                break;
              case 'cliente':
                router.replace('/cliente-panel');
                break;
              default:
                router.replace('/');
            }
            return;
          }
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
        cargarHerramientas();
      }

      // Cerrar todos los modales si viene el parámetro closeModals
      if (params?.closeModals === 'true') {
        setShowTareasModal(false);
        setShowTareaDetalle(false);
        setShowHistorialTareasModal(false);
        setShowReportesModal(false);
        setShowReporteDetalle(false);
        setShowHistorialReportesModal(false);
        setShowInventarioModal(false);
        setShowArchivoModal(false);
        setShowCotizarModal(false);
        setShowLogout(false);
      }
    }, [usuario?.email, params?.closeModals])
  );

  // Función para limpiar todos los estados de Fase 2 y cerrar modal
  const cerrarModalReporteDetalle = () => {
    setShowReporteDetalle(false);
    setReporteSeleccionado(null);
    setArchivosReporte([]);
    // Limpiar estados de Fase 2
    setRevision('');
    setRecomendaciones('');
    setReparacion('');
    setRecomendacionesAdicionales('');
    setMaterialesRefacciones('');
    setDescripcionTrabajo(''); // Limpiar análisis al cerrar
  };

  // Cargar datos de Fase 2 cuando se selecciona un reporte
  useEffect(() => {
    if (reporteSeleccionado) {
      console.log('[EMPLEADO-FASE2-LOAD] Reporte seleccionado:', reporteSeleccionado);
      console.log('[EMPLEADO-FASE2-LOAD] Campos Fase 2:', {
        revision: reporteSeleccionado.revision,
        recomendaciones: reporteSeleccionado.recomendaciones,
        reparacion: reporteSeleccionado.reparacion,
        recomendaciones_adicionales: reporteSeleccionado.recomendaciones_adicionales,
        materiales_refacciones: reporteSeleccionado.materiales_refacciones
      });

      // Cargar datos de Fase 2 si existen
      setRevision(reporteSeleccionado.revision || '');
      setRecomendaciones(reporteSeleccionado.recomendaciones || '');
      setReparacion(reporteSeleccionado.reparacion || '');
      setRecomendacionesAdicionales(reporteSeleccionado.recomendaciones_adicionales || '');
      setMaterialesRefacciones(reporteSeleccionado.materiales_refacciones || '');
      setDescripcionTrabajo(reporteSeleccionado.analisis_general || '');
    }
  }, [reporteSeleccionado]);


  const cargarHerramientas = async () => {
    if (!usuario?.id) return;
    setLoadingHerramientas(true);
    try {
      const { success, data } = await obtenerInventarioEmpleadoBackend(usuario.id.toString());
      if (success) {
        setListaHerramientas(data || []);
        setHerramientas(data?.length || 0);
      }
    } catch (error) {
      console.error('Error cargando herramientas:', error);
    } finally {
      setLoadingHerramientas(false);
    }
  };

  const cargarTareas = async () => {
    if (!usuario?.email) return;
    setLoadingTareas(true);
    try {
      const { success, data } = await obtenerTareasEmpleadoBackend(usuario.email);
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
      const { success } = await actualizarEstadoTareaBackend(tareaSeleccionada.id, 'completada');
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
      const { success, data } = await obtenerTareasEmpleadoBackend(usuario.email);
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
        // Mapear los datos para extraer equipo_descripcion y comentario
        const reportesMapeados = (data || []).map((r: any) => {
          // El titulo tiene formato: "equipo_descripcion - sucursal"
          const partes = (r.titulo || '').split(' - ');
          const equipo_descripcion = partes[0] ? partes[0].trim() : 'Equipo / servicio';
          const sucursal = partes.length > 1 ? partes[1].trim() : '';

          // La descripcion tiene formato: "Modelo: xxx\nSerie: yyy\nSucursal: zzz\nComentario: aaa\nPrioridad: bbb"
          let comentario = '';
          const desc = r.descripcion || '';
          const comentarioMatch = desc.match(/Comentario:\s*([^\n]+)/i);
          if (comentarioMatch) comentario = comentarioMatch[1].trim();

          return {
            ...r,
            equipo_descripcion,
            sucursal,
            comentario: comentario || 'Sin comentarios'
          };
        });

        // Mostrar reportes asignados, pendientes, cotizados, en_cotizacion, en_proceso, aceptado_por_cliente, finalizado_por_tecnico y en_espera_confirmacion (excluir cerrados)
        const reportesActivos = reportesMapeados.filter((r: any) =>
          r.estado === 'asignado' ||
          r.estado === 'en_cotizacion' ||
          r.estado === 'pendiente' ||
          r.estado === 'cotizado' ||
          r.estado === 'aceptado_por_cliente' ||
          r.estado === 'en_proceso' ||
          r.estado === 'finalizado_por_tecnico' ||
          r.estado === 'en_espera_confirmacion'
        ) || [];
        setListaReportes(reportesActivos);
        const pendientes = reportesActivos.length;
        const terminados = reportesMapeados.filter((r: any) =>
          r.estado === 'finalizado_por_tecnico' ||
          r.estado === 'cerrado_por_cliente' ||
          r.estado === 'listo_para_encuesta' ||
          r.estado === 'encuesta_satisfaccion' ||
          r.estado === 'terminado' ||
          r.estado === 'rechazado'
        ).length || 0;
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
        // Mapear los datos para extraer equipo_descripcion y comentario
        const reportesMapeados = (data || []).map((r: any) => {
          // El titulo tiene formato: "equipo_descripcion - sucursal"
          const partes = (r.titulo || '').split(' - ');
          const equipo_descripcion = partes[0] ? partes[0].trim() : 'Equipo / servicio';
          const sucursal = partes.length > 1 ? partes[1].trim() : '';

          // La descripcion tiene formato: "Modelo: xxx\nSerie: yyy\nSucursal: zzz\nComentario: aaa\nPrioridad: bbb"
          let comentario = '';
          const desc = r.descripcion || '';
          const comentarioMatch = desc.match(/Comentario:\s*([^\n]+)/i);
          if (comentarioMatch) comentario = comentarioMatch[1].trim();

          return {
            ...r,
            equipo_descripcion,
            sucursal,
            comentario: comentario || 'Sin comentarios'
          };
        });

        // Mostrar reportes finalizados: finalizado_por_tecnico, cerrado_por_cliente, listo_para_encuesta, encuesta_satisfaccion, terminado
        const terminados = reportesMapeados.filter((r: any) =>
          r.estado === 'finalizado_por_tecnico' ||
          r.estado === 'cerrado_por_cliente' ||
          r.estado === 'listo_para_encuesta' ||
          r.estado === 'encuesta_satisfaccion' ||
          r.estado === 'terminado'
        ) || [];
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

        const pendientes = reportesActualizados.filter((r: any) =>
          r.estado === 'pendiente' ||
          r.estado === 'cotizado' ||
          r.estado === 'en_proceso' ||
          r.estado === 'finalizado_por_tecnico' ||
          r.estado === 'en_cotizacion' ||
          r.estado === 'en_espera_confirmacion'
        ).length;
        const terminados = reportesActualizados.filter((r: any) =>
          r.estado === 'finalizado_por_tecnico' ||
          r.estado === 'cerrado_por_cliente' ||
          r.estado === 'listo_para_encuesta' ||
          r.estado === 'encuesta_satisfaccion' ||
          r.estado === 'terminado'
        ).length;
        setReportes(pendientes);
        setReportesTerminados(terminados);

        cerrarModalReporteDetalle();
        setReporteSeleccionado(null);
        setArchivosReporte([]);
      }
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
    } finally {
      setActualizandoReporte(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const confirmarEnvioAnalisis = () => {
    if (!descripcionTrabajo.trim()) {
      showToast('Por favor ingresa un análisis general', 'warning');
      return;
    }
    setShowConfirmarAnalisis(true);
  };

  const guardarCotizacion = async () => {
    if (!reporteSeleccionado?.id) return;

    setGuardandoCotizacion(true);
    setShowConfirmarAnalisis(false); // Cerrar modal de confirmación
    try {
      console.log('[EMPLEADO-ANALISIS] Enviando análisis:', {
        reporteId: reporteSeleccionado.id,
        estado: 'en_cotizacion',
        analisis: descripcionTrabajo.trim()
      });

      // Actualizar el estado del reporte a 'en_cotizacion' solo con el análisis (SIN PRECIO)
      // El precio lo agregará el admin después en "Cotizaciones Pendientes"
      const respuesta = await actualizarEstadoReporteAsignado(
        reporteSeleccionado.id,
        'en_cotizacion',
        descripcionTrabajo.trim()
      );

      console.log('[EMPLEADO-ANALISIS] Respuesta del servidor:', respuesta);

      if (respuesta.success) {
        // Actualizar lista de reportes localmente
        const reportesActualizados = listaReportes.map((r: any) =>
          r.id === reporteSeleccionado.id ? { ...r, estado: 'en_cotizacion', analisis_general: descripcionTrabajo.trim() } : r
        );
        setListaReportes(reportesActualizados);

        // Actualizar también el reporte seleccionado
        if (reporteSeleccionado) {
          setReporteSeleccionado({
            ...reporteSeleccionado,
            estado: 'en_cotizacion',
            analisis_general: descripcionTrabajo.trim()
          });
        }

        const pendientes = reportesActualizados.filter((r: any) =>
          r.estado === 'pendiente' ||
          r.estado === 'cotizado' ||
          r.estado === 'en_cotizacion' ||
          r.estado === 'en_espera_confirmacion'
        ).length;
        setReportes(pendientes);

        // Limpiar estados y cerrar modal
        setShowCotizarModal(false);
        setDescripcionTrabajo('');
        cerrarModalReporteDetalle(); // Cerrar el modal de detalle del reporte

        showToast('Análisis enviado exitosamente. El reporte ahora está En Cotización.', 'success');
      } else {
        console.error('[EMPLEADO-ANALISIS] Error en respuesta:', respuesta);
        showToast('Error al enviar análisis', 'error');
      }
    } catch (error) {
      console.error('Error al guardar análisis:', error);
      showToast('Error al guardar la cotización', 'error');
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
    {
      label: 'Herramientas',
      value: herramientas,
      iconBg: '#be185d',
      iconName: 'construct-outline' as const,
      accent: '#ec4899',
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
      title: 'Inventario',
      description: 'Ver mis herramientas asignadas',
      gradientStart: '#be185d',
      gradientEnd: '#db2777',
      iconName: 'construct' as const,
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
    } else if (title === 'Inventario') {
      cargarHerramientas();
      setShowInventarioModal(true);
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

      {showConfirmarAnalisis && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(217, 119, 6, 0.2)', borderColor: 'rgba(217, 119, 6, 0.5)' }]}>
                <Ionicons name="send-outline" size={22} color="#d97706" />
              </View>
              <Text style={[styles.modalTitle, { fontFamily }]}>Confirmar envío</Text>
            </View>
            <Text style={[styles.modalBodyText, { fontFamily }]}>¿Estás seguro de enviar este análisis? El reporte pasará a estado "En Cotización".</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setShowConfirmarAnalisis(false)}>
                <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={['#d97706', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalPrimary}
              >
                <TouchableOpacity onPress={guardarCotizacion} activeOpacity={0.85} disabled={guardandoCotizacion}>
                  <Text style={[styles.modalPrimaryText, { fontFamily }]}>{guardandoCotizacion ? 'Enviando...' : 'Enviar Análisis'}</Text>
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
                            {reporte.usuario_nombre}
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
                            const resultado = await obtenerArchivosReporteBackend(reporte.id);
                            if (resultado.success) {
                              const soloMedia = (resultado.data || []).filter((a: any) => a.tipo_archivo !== 'pdf');
                              setArchivosReporte(soloMedia);
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
                        <View style={[styles.statusBadge, {
                          backgroundColor: `${obtenerColorEstado(reporte.estado)}25`,
                          borderColor: `${obtenerColorEstado(reporte.estado)}50`
                        }]}>
                          <Text style={[styles.statusBadgeText, {
                            color: obtenerColorEstado(reporte.estado),
                            fontFamily
                          }]}>
                            {obtenerNombreEstado(reporte.estado)}
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
              <TouchableOpacity onPress={() => cerrarModalReporteDetalle()} activeOpacity={0.7}>
                <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Aviso prominente cuando el cliente aceptó la cotización */}
            {reporteSeleccionado.estado === 'aceptado_por_cliente' && !(reporteSeleccionado.revision || reporteSeleccionado.reparacion) && (
              <View style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderBottomWidth: 3,
                borderBottomColor: '#10b981',
                padding: 16,
                marginHorizontal: isMobile ? 16 : 24,
                marginTop: 12,
                borderRadius: 12
              }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: '#10b981',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ fontSize: 15, fontWeight: '800', color: '#10b981', marginBottom: 4 }, { fontFamily }]}>
                      ✅ Cliente aceptó la cotización
                    </Text>
                    <Text style={[{ fontSize: 13, color: '#6ee7b7', lineHeight: 18 }, { fontFamily }]}>
                      Ahora puedes completar los campos de Revisión, Recomendaciones y Reparación abajo.
                    </Text>
                  </View>
                </View>
              </View>
            )}

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
                        {obtenerNombreEstado(reporteSeleccionado.estado)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Sección de Análisis para el Técnico */}
                {reporteSeleccionado.estado === 'asignado' ? (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { marginTop: 16 }]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily, color: '#f59e0b', fontWeight: 'bold' }]}>
                      ANÁLISIS GENERAL (Reporte de fallas) *
                    </Text>
                    <TextInput
                      style={[styles.textInputArea, isMobile && styles.textInputAreaMobile, { fontFamily, minHeight: 100 }]}
                      placeholder="Reporta aquí qué partes del equipo no están funcionando o qué análisis realizaste..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={4}
                      value={descripcionTrabajo}
                      onChangeText={setDescripcionTrabajo}
                      textAlignVertical="top"
                    />
                  </View>
                ) : (reporteSeleccionado.analisis_general && (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { marginTop: 16 }]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily, color: '#f59e0b', fontWeight: 'bold' }]}>
                      ANÁLISIS REALIZADO
                    </Text>
                    <View style={[styles.detailValueBox, isMobile && styles.detailValueBoxMobile]}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {reporteSeleccionado.analisis_general}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Campos Fase 2 (cuando cliente aceptó: aceptado_por_cliente o cotizado, o cuando admin confirmó: finalizado_por_tecnico) */}
                {(reporteSeleccionado.estado === 'cotizado' || reporteSeleccionado.estado === 'aceptado_por_cliente' || reporteSeleccionado.estado === 'finalizado_por_tecnico') && (
                  <>
                    <View style={{ height: 1, backgroundColor: '#1f2937', marginVertical: 16 }} />

                    {/* Mensaje cuando el trabajo ya fue enviado */}
                    {reporteSeleccionado.estado === 'finalizado_por_tecnico' && (
                      <View style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        borderLeftWidth: 4,
                        borderLeftColor: '#3b82f6',
                        padding: 14,
                        borderRadius: 8,
                        marginBottom: 16
                      }}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                          <Ionicons name="checkmark-done-circle" size={22} color="#60a5fa" />
                          <View style={{ flex: 1 }}>
                            <Text style={[{ fontSize: 13, fontWeight: '700', color: '#60a5fa', marginBottom: 2 }, { fontFamily }]}>
                              Trabajo enviado
                            </Text>
                            <Text style={[{ fontSize: 12, color: '#93c5fd', lineHeight: 16 }, { fontFamily }]}>
                              El trabajo fue finalizado y está esperando confirmación del administrador.
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

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
                        editable={reporteSeleccionado.estado !== 'finalizado_por_tecnico' && !guardandoFase2}
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
                        editable={reporteSeleccionado.estado !== 'finalizado_por_tecnico' && !guardandoFase2}
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
                        editable={reporteSeleccionado.estado !== 'finalizado_por_tecnico' && !guardandoFase2}
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
                        value={reporteSeleccionado.estado === 'finalizado_por_tecnico' && !recomendacionesAdicionales ? 'N/A' : recomendacionesAdicionales}
                        onChangeText={setRecomendacionesAdicionales}
                        editable={reporteSeleccionado.estado !== 'finalizado_por_tecnico' && !guardandoFase2}
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
                        value={reporteSeleccionado.estado === 'finalizado_por_tecnico' && !materialesRefacciones ? 'N/A' : materialesRefacciones}
                        onChangeText={setMaterialesRefacciones}
                        editable={reporteSeleccionado.estado !== 'finalizado_por_tecnico' && !guardandoFase2}
                      />
                    </View>
                  </>
                )}

                {/* Fotos y Videos - MOVIDO AL FINAL */}
                {cargandoArchivos ? (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { marginTop: 20 }]}>
                    <Text style={[styles.detailFieldLabel, isMobile && styles.detailFieldLabelMobile, { fontFamily }]}>Cargando archivos...</Text>
                  </View>
                ) : null}

                {!cargandoArchivos && archivosReporte.length > 0 && (
                  <View style={[styles.detailFieldGroup, isMobile && styles.detailFieldGroupMobile, { marginTop: 20 }]}>
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

              </View>
            </ScrollView>


            <View style={[styles.detailFooter, isMobile && styles.detailFooterMobile]}>
              <TouchableOpacity
                style={styles.detailCloseButton}
                onPress={() => cerrarModalReporteDetalle()}
                activeOpacity={0.7}
              >
                <Text style={[styles.detailCloseButtonText, { fontFamily }]}>Cerrar</Text>
              </TouchableOpacity>

              {reporteSeleccionado.estado === 'asignado' && (
                <LinearGradient
                  colors={['#d97706', '#f59e0b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.detailActionButton}
                >
                  <TouchableOpacity
                    onPress={confirmarEnvioAnalisis}
                    disabled={guardandoCotizacion}
                    activeOpacity={0.85}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={[styles.detailActionButtonText, { fontFamily }]}>
                      {guardandoCotizacion ? 'Enviando...' : 'Enviar Análisis'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}

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
                      Enviar Análisis
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}

              {reporteSeleccionado.estado === 'en_proceso' && !reporteSeleccionado.analisis_general && (
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
                      Enviar Análisis
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}

              {reporteSeleccionado.estado === 'aceptado_por_cliente' && (
                <LinearGradient
                  colors={['#10b981', '#06b6d4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.detailActionButton}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      if (!revision.trim() || !recomendaciones.trim() || !reparacion.trim()) {
                        showToast('Por favor completa los campos obligatorios: Revisión, Recomendaciones y Reparación', 'warning');
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

                      console.log('[EMPLEADO-FASE2] Enviando datos de Fase 2:', fase2Data);

                      // Actualizar el reporte con datos de Fase 2 y cambiar estado a finalizado_por_tecnico
                      const updateResult = await actualizarEstadoReporteAsignado(
                        reporteSeleccionado.id,
                        'finalizado_por_tecnico', // Cambiar estado a finalizado por técnico
                        undefined, // descripcionTrabajo (ya fue enviado en Fase 1)
                        undefined, // precioCotizacion
                        fase2Data  // Datos completos de Fase 2
                      );

                      if (!updateResult.success) {
                        console.error('[EMPLEADO-FASE2] Error al guardar:', updateResult.error);
                        showToast('Error al guardar el trabajo: ' + updateResult.error, 'error');
                        return;
                      }

                      // Éxito: mostrar mensaje y recargar
                      console.log('[EMPLEADO-FASE2] ✓ Trabajo guardado exitosamente');
                      showToast('Trabajo guardado. El admin debe confirmar para finalizar oficialmente.', 'success');

                      // Limpiar y cerrar modal
                      cerrarModalReporteDetalle();

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
                            {reporte.usuario_nombre}
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
                            const resultado = await obtenerArchivosReporteBackend(reporte.id);
                            if (resultado.success) {
                              const soloMedia = (resultado.data || []).filter((a: any) => a.tipo_archivo !== 'pdf');
                              setArchivosReporte(soloMedia);
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

      {showInventarioModal && (
        <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile]}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 8 : 12, flex: 1 }}>
                <View style={{ backgroundColor: '#be185d', borderRadius: 12, padding: isMobile ? 8 : 10 }}>
                  <Ionicons name="construct-outline" size={isMobile ? 20 : 24} color="#ec4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]} numberOfLines={1}>Mis Herramientas</Text>
                  <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Herramientas asignadas a tu cargo</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={cargarHerramientas} style={styles.refreshButton} activeOpacity={0.7}>
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowInventarioModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={isMobile ? 20 : 24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingHerramientas ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando herramientas...</Text>
              </View>
            ) : listaHerramientas.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="construct" size={56} color="#94a3b8" style={{ marginBottom: 16, opacity: 0.4 }} />
                <Text style={[{ color: '#cbd5e1', fontSize: 15, textAlign: 'center', fontWeight: '600' }, { fontFamily }]}>
                  No tienes herramientas asignadas
                </Text>
              </View>
            ) : (
              <ScrollView style={[styles.modalList, isMobile && styles.modalListMobile]} showsVerticalScrollIndicator={false}>
                {listaHerramientas.map((herramienta: any, index: number) => (
                  <View key={index} style={[styles.cardContainer, isMobile && styles.cardContainerMobile]}>
                    <View style={[styles.cardAccentLeft, { backgroundColor: '#ec4899' }]} />
                    <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardMainTitle, { fontFamily }]} numberOfLines={1}>{herramienta.herramienta_nombre || herramienta.nombre}</Text>
                          <Text style={[styles.cardUserInfo, { fontFamily }]} numberOfLines={1}>Categoría: {herramienta.categoria || 'General'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.cardDescription, { fontFamily }]} numberOfLines={2}>{herramienta.observaciones || 'Sin observaciones'}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={[styles.cardDate, { fontFamily }]}>
                          Asignada: {herramienta.created_at ? new Date(herramienta.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Fecha desconocida'}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#be185d25', borderColor: '#be185d50' }]}>
                          <Text style={[styles.statusBadgeText, { color: '#ec4899', fontFamily }]}>Asignada</Text>
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
                <Text style={[styles.detailModalTitle, isMobile && styles.detailModalTitleMobile, { fontFamily }]} numberOfLines={1}>Enviar Análisis</Text>
                <Text style={[styles.detailModalSubtitle, isMobile && styles.detailModalSubtitleMobile, { fontFamily }]} numberOfLines={1}>Completa el análisis del reporte</Text>
              </View>
              <TouchableOpacity onPress={() => {
                setShowCotizarModal(false);
                setShowReporteDetalle(true);
                setDescripcionTrabajo('');
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
              </View>
            </ScrollView>

            <View style={[styles.detailFooter, isMobile && styles.detailFooterMobile]}>
              <TouchableOpacity
                style={styles.detailCloseButton}
                onPress={() => {
                  setShowCotizarModal(false);
                  setShowReporteDetalle(true);
                  setDescripcionTrabajo('');
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
                    {guardandoCotizacion ? 'Enviando...' : 'Enviar Análisis'}
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

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              {archivoVisualizando.tipo === 'foto' ? (
                <Image
                  source={{ uri: archivoVisualizando.url }}
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  resizeMode="contain"
                />
              ) : Platform.OS === 'web' ? (
                <video
                  src={archivoVisualizando.url}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#000'
                  }}
                />
              ) : (
                <Video
                  source={{ uri: archivoVisualizando.url }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  useNativeControls
                  style={{ width: '100%', height: '100%' }}
                />
              )}
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

export default function EmpleadoPanel() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (!user) {
          router.replace('/');
          return;
        }
        const parsedUser = JSON.parse(user);
        if (parsedUser.rol !== 'empleado') {
          console.warn(`[SEGURIDAD] Usuario ${parsedUser.email} con rol ${parsedUser.rol} intentó acceder a /empleado-panel`);
          switch (parsedUser.rol) {
            case 'admin':
              router.replace('/admin');
              break;
            case 'cliente':
              router.replace('/cliente-panel');
              break;
            default:
              router.replace('/');
          }
          return;
        }
        setAuthorized(true);
      } catch (error) {
        router.replace('/');
      } finally {
        setChecking(false);
      }
    };
    verificarAcceso();
  }, [router]);

  if (checking) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (!authorized) {
    return null;
  }

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
    maxWidth: '95%',
    maxHeight: '95%',
    width: '90%',
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexDirection: 'column',
  },
  archivoModalContentMobile: {
    borderRadius: 12,
    padding: 16,
    width: '95%',
    height: '90%',
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

