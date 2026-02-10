// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    actualizarReporteBackend,
    apiCall,
    obtenerArchivosReporteBackend,
    obtenerReportesCliente,
    verificarEncuestaExiste
} from '../lib/api-backend';
import { getProxyUrl } from '../lib/cloudflare';
import { obtenerNombreEstado } from '../lib/estado-mapeo';

type Cliente = {
  nombre?: string;
  apellido?: string;
  email?: string;
  empresa?: string;
};

function ClientePanelContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState<any | null>(null);
  const [archivosReporte, setArchivosReporte] = useState<any[]>([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  const [archivoVisualizando, setArchivoVisualizando] = useState<any | null>(null);
  const [showArchivoModal, setShowArchivoModal] = useState(false);
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

  // Estado para TODOS los reportes (sin filtrar) - usado para contadores
  const [todosLosReportes, setTodosLosReportes] = useState<any[]>([]);

  // Estados para cotizaciones
  const [showCotizacionesModal, setShowCotizacionesModal] = useState(false);
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<any | null>(null);
  const [showCotizacionDetalleModal, setShowCotizacionDetalleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [archivoPDFCotizacion, setArchivoPDFCotizacion] = useState<any | null>(null);

  // Estado para rastrear encuestas enviadas (usando localStorage)
  const [encuestasEnviadas, setEncuestasEnviadas] = useState<Set<number>>(new Set());
  // Estado para rastrear encuestas confirmadas en BD
  const [encuestasRespondidas, setEncuestasRespondidas] = useState<Set<number>>(new Set());
  // Cache local para reportes cancelados por segunda cotizacion
  const [canceladosLocal, setCanceladosLocal] = useState<Set<number>>(new Set());
  // Modal de éxito para encuesta
  const [showEncuestaSuccessModal, setShowEncuestaSuccessModal] = useState(false);

  // Efecto para rotar pantalla en móvil al abrir modal de archivo

  // Estado para confirmación de rechazo (custom modal)
  const [showConfirmarRechazoModal, setShowConfirmarRechazoModal] = useState(false);
  const [reporteARechazar, setReporteARechazar] = useState<any | null>(null);
  const [stepRechazo, setStepRechazo] = useState(1); // 1: confirmación, 2: motivo
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [rechazandoReporte, setRechazandoReporte] = useState(false);


  // Cargar encuestas enviadas desde AsyncStorage al iniciar
  useEffect(() => {
    const cargarEncuestasEnviadas = async () => {
      try {
        const stored = await AsyncStorage.getItem('encuestas_enviadas');
        if (stored) {
          const ids = JSON.parse(stored);
          setEncuestasEnviadas(new Set(ids));
        }
      } catch (e) {
        console.error('Error al cargar encuestas enviadas:', e);
      }
    };
    cargarEncuestasEnviadas();
  }, []);

  useEffect(() => {
    const cargarCanceladosLocal = async () => {
      try {
        const stored = await AsyncStorage.getItem('reportes_cancelados_local');
        if (stored) {
          const ids = JSON.parse(stored);
          setCanceladosLocal(new Set(ids));
        }
      } catch (e) {
        console.error('Error al cargar cancelados local:', e);
      }
    };
    cargarCanceladosLocal();
  }, []);


  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          // Validación: solo clientes pueden acceder a este panel
          if (parsedUser.rol !== 'cliente') {
            console.warn(`[SEGURIDAD] Usuario ${parsedUser.email} con rol ${parsedUser.rol} intentó acceder a /cliente-panel. Redirigiendo...`);
            // Redirigir según su rol
            switch (parsedUser.rol) {
              case 'admin':
                router.replace('/admin');
                break;
              case 'empleado':
                router.replace('/empleado-panel');
                break;
              default:
                router.replace('/');
            }
            return;
          }
          setUsuario(parsedUser);
        }
      } catch (error) {
        console.error('[CLIENTE-PANEL] Error al obtener usuario:', error);
      }
    };
    obtenerUsuario();
  }, []);

  // Detectar si se envió una encuesta y mostrar mensaje de agradecimiento
  // Detectar si se envió una encuesta y mostrar mensaje de agradecimiento
  useEffect(() => {
    const checkEncuestaEnviada = async () => {
      // En móvil, obtenemos los parámetros de la navegación o deep linking
      // Para simplificar y mantener compatibilidad web/móvil:
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const reporteId = urlParams.get('reporteId');

        if (urlParams.get('encuestaEnviada') === 'true' && reporteId) {
          try {
            const stored = await AsyncStorage.getItem('encuestas_enviadas');
            const ids = stored ? JSON.parse(stored) : [];
            const reporteIdNum = parseInt(reporteId);

            if (!ids.includes(reporteIdNum)) {
              ids.push(reporteIdNum);
              await AsyncStorage.setItem('encuestas_enviadas', JSON.stringify(ids));
              setEncuestasEnviadas(new Set(ids));
            }

            setTimeout(() => {
              setShowEncuestaSuccessModal(true);
            }, 500);

            window.history.replaceState({}, '', '/cliente-panel');
          } catch (e) {
            console.error('Error al guardar encuesta enviada:', e);
          }
        }
      } else {
        // Lógica para móvil (usando parámetros de ruta)
        const reporteId = params.reporteId as string;
        if (params.encuestaEnviada === 'true' && reporteId) {
          try {
            const stored = await AsyncStorage.getItem('encuestas_enviadas');
            const ids = stored ? JSON.parse(stored) : [];
            const reporteIdNum = parseInt(reporteId);

            if (!ids.includes(reporteIdNum)) {
              ids.push(reporteIdNum);
              await AsyncStorage.setItem('encuestas_enviadas', JSON.stringify(ids));
              setEncuestasEnviadas(new Set(ids));
            }

            setTimeout(() => {
              setShowEncuestaSuccessModal(true);
            }, 500);

            // router.replace('/cliente-panel'); // Comentado para evitar recarga que cierra el modal

          } catch (e) {
            console.error('Error al guardar encuesta enviada (móvil):', e);
          }
        }
      }
    };

    checkEncuestaEnviada();
  }, [params.encuestaEnviada, params.reporteId]);

  // Verificar si existen encuestas para los reportes
  const verificarEncuestas = useCallback(
    async (reportes: any[]) => {
      console.log('[VERIFICAR-ENCUESTAS] Verificando encuestas para', reportes.length, 'reportes');
      const encuestasSet = new Set<number>();

      for (const reporte of reportes) {
        try {
          console.log('[VERIFICAR-ENCUESTAS] Verificando reporte ID:', reporte.id);
          const { success, data } = await verificarEncuestaExiste(reporte.id.toString());
          console.log('[VERIFICAR-ENCUESTAS] Respuesta para reporte', reporte.id, ':', { success, dataLength: data?.length, data });
          if (success && data && data.length > 0) {
            console.log('[VERIFICAR-ENCUESTAS] ✓ Encuesta encontrada para reporte', reporte.id);
            encuestasSet.add(reporte.id);
          }
        } catch (error) {
          console.error(`[CLIENTE-PANEL] Error verificando encuesta para reporte ${reporte.id}:`, error);
        }
      }

      console.log('[VERIFICAR-ENCUESTAS] Total de encuestas encontradas:', encuestasSet.size, 'IDs:', Array.from(encuestasSet));
      setEncuestasRespondidas(encuestasSet);
    },
    [setEncuestasRespondidas]
  );

  const cargarReportes = useCallback(
    async (email?: string, silent: boolean = false) => {
      if (!email) return;
      if (!silent) setLoadingReportes(true);
      setErrorReportes('');
      const { success, data, error } = await obtenerReportesCliente(email);
      console.log('[CLIENTE-PANEL] cargarReportes respuesta:', { success, dataLength: data?.length, firstItem: data?.[0] });
      if (!success) {
        setErrorReportes(error || 'No se pudieron cargar los reportes');
      } else {
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

          const idNum = Number(r.id);
          const estadoOverride = canceladosLocal.has(idNum) ? 'rechazado' : r.estado;

          return {
            ...r,
            estado: estadoOverride,
            equipo_descripcion,
            sucursal,
            comentario: comentario || 'Sin comentarios'
          };
        });

        const reportesActivos = reportesMapeados.filter((r: any) =>
          r.estado !== 'cerrado' && r.estado !== 'cerrado_por_cliente' && r.estado !== 'cancelado' && r.estado !== 'rechazado'
        );
        console.log('[CLIENTE-PANEL] Reportes activos después de filtrar:', reportesActivos.length);
        console.log('[CLIENTE-PANEL] Total de reportes (sin filtrar):', reportesMapeados.length);
        setReportes(reportesActivos);
        setTodosLosReportes(reportesMapeados); // Guardar TODOS los reportes para los contadores

        // Verificar encuestas existentes
        verificarEncuestas(reportesMapeados);
      }
      if (!silent) setLoadingReportes(false);
      return data || [];
    },
    [verificarEncuestas, canceladosLocal]
  );

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const cargarCotizaciones = useCallback(
    async (email?: string, silent: boolean = false) => {
      if (!email) {
        console.log('[CLIENTE-PANEL] No hay email para cargar cotizaciones');
        return;
      }
      console.log('[CLIENTE-PANEL] Cargando cotizaciones para email:', email);
      if (!silent) setLoadingCotizaciones(true);
      try {
        console.log('[CLIENTE-PANEL] Llamando a obtenerReportesCliente');
        const resultado = await obtenerReportesCliente(email);
        console.log('[CLIENTE-PANEL] Resultado completo:', resultado);
        if (resultado.success && resultado.data) {
          console.log('[CLIENTE-PANEL] Datos cargados:', resultado.data.length);
          console.log('[CLIENTE-PANEL] Primeros 3 reportes:', resultado.data.slice(0, 3).map((r: any) => ({
            id: r.id,
            titulo: r.titulo,
            estado: r.estado,
            precio: r.precio_cotizacion,
            analisis: r.analisis_general ? 'SÍ' : 'NO'
          })));

          // Filtrar reportes en proceso de cotización o ya cotizados
          const cotizacionesFiltradas = resultado.data.filter((r: any) => {
            const idNum = Number(r.id);
            if (canceladosLocal.has(idNum)) return false;

            const estadoValido = r.estado === 'cotizado' ||
              r.estado === 'en_espera_confirmacion' ||
              r.estado === 'en_cotizacion' ||
              r.estado === 'cotizacionnueva';

            if (!estadoValido) console.log(`[FILTRO] Reporte ${r.id}: estado inválido (${r.estado})`);

            return estadoValido;
          });

          console.log('[CLIENTE-PANEL] Cotizaciones filtradas:', cotizacionesFiltradas.length);
          console.log('[CLIENTE-PANEL] Detalle cotizaciones:', cotizacionesFiltradas.map((r: any) => ({
            id: r.id,
            titulo: r.titulo,
            estado: r.estado,
            precio: r.precio_cotizacion
          })));

          // Mapear las cotizaciones igual que los reportes para extraer equipo_descripcion
          const cotizacionesMapeadas = cotizacionesFiltradas.map((r: any) => {
            const partes = (r.titulo || '').split(' - ');
            const equipo_descripcion = partes[0] ? partes[0].trim() : 'Equipo / servicio';
            const sucursal = partes.length > 1 ? partes[1].trim() : '';

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

          setCotizaciones(cotizacionesMapeadas);
        } else {
          console.error('[CLIENTE-PANEL] Error en respuesta:', resultado.error);
          setCotizaciones([]);
        }
      } catch (error) {
        console.error('[CLIENTE-PANEL] Exception:', error);
        setCotizaciones([]);
      } finally {
        if (!silent) setLoadingCotizaciones(false);
      }
    },
    [canceladosLocal]
  );

  // PASO 4: Cargar reportes finalizados por técnico (esperando confirmación del cliente)
  const cargarReportesFinalizados = useCallback(
    async (email?: string, silent: boolean = false) => {
      if (!email) {
        console.log('[CLIENTE-CARGAR-FINALIZADOS] Sin email');
        return [];
      }
      console.log('[CLIENTE-CARGAR-FINALIZADOS] Iniciando carga para:', email);
      try {
        const resultado = await obtenerReportesCliente(email);
        console.log('[CLIENTE-CARGAR-FINALIZADOS] Respuesta backend:', { success: resultado.success, totalData: resultado.data?.length });

        if (resultado.success && resultado.data) {
          // FILTRO DEFENSIVO: SOLO cargar reportes que el admin CONFIRMÓ
          // - finalizado_por_tecnico: Admin confirmó en "Confirmar Finalización"
          // - listo_para_encuesta: Cliente confirmó, va a encuesta
          // - encuesta_satisfaccion: Cliente completó encuesta
          // - terminado: Completamente terminado

          // EXCLUIR TODOS los demás:
          // - cerrado_por_cliente: ❌ Técnico completó pero admin NO confirmó aún
          // - cotizado: ❌ Admin aceptó precio pero cliente NO aceptó
          // - pendiente: ❌ Cliente creó
          // - en_proceso: ❌ Admin asignó, técnico trabaja

          // FILTRO: SOLO mostrar reportes cerrados definitivamente
          // - cerrado: Admin confirmó el cierre definitivo del reporte

          const dataConOverride = (resultado.data || []).map((r: any) => {
            const idNum = Number(r.id);
            return canceladosLocal.has(idNum) ? { ...r, estado: 'rechazado' } : r;
          });

          const finalizados = dataConOverride.filter((r: any) =>
            r.estado === 'cerrado' || r.estado === 'cerrado_por_cliente' || r.estado === 'cancelado' || r.estado === 'rechazado'
          );

          console.log('[CLIENTE-CARGAR-FINALIZADOS] Finalizados encontrados:', finalizados.length);
          console.log('[CLIENTE-CARGAR-FINALIZADOS] Detalles:', finalizados.map((r: any) => ({ id: r.id, estado: r.estado, titulo: r.titulo })));

          // Desglosar por estado para debug
          const porConfirmar = finalizados.filter(r => r.estado === 'finalizado_por_tecnico' || r.estado === 'listo_para_encuesta');
          const otros = finalizados.filter(r => r.estado !== 'finalizado_por_tecnico' && r.estado !== 'listo_para_encuesta');
          console.log('[CLIENTE-CARGAR-FINALIZADOS] Por confirmar:', porConfirmar.length, 'Otros:', otros.length);
          if (otros.length > 0) {
            console.log('[CLIENTE-CARGAR-FINALIZADOS] Estados de otros:', otros.map((r: any) => r.estado));
          }

          const finalizadosVisibles = finalizados.map((r: any) => {
            if (r.estado === 'cancelado') {
              return { ...r, estado: 'rechazado', esCancelado: true };
            }
            if (r.estado === 'rechazado') {
              return { ...r, esCancelado: true };
            }
            return r;
          });

          setReportesFinalizados(finalizadosVisibles);
          return finalizadosVisibles;
        } else {
          console.log('[CLIENTE-CARGAR-FINALIZADOS] Error en respuesta:', resultado);
          setReportesFinalizados([]);
          return [];
        }
      } catch (error) {
        console.error('[CLIENTE-CARGAR-FINALIZADOS] Error:', error);
        setReportesFinalizados([]);
        return [];
      }
    },
    [canceladosLocal]
  );

  // Polling para actualización en tiempo real (cada 10 segundos)
  useEffect(() => {
    if (!usuario?.email) return;

    const interval = setInterval(() => {
      console.log('[CLIENTE-POLLING] Actualizando datos (silent)...');
      cargarReportes(usuario.email, true);
      cargarCotizaciones(usuario.email, true);
      cargarReportesFinalizados(usuario.email, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [usuario?.email, cargarReportes, cargarCotizaciones, cargarReportesFinalizados]);

  // Función para generar PDF del reporte
  const generarPDF = async (reporte: any) => {
    if (generandoPDF) return;
    setGenerandoPDF(true);
    try {
      // Extraer información del reporte
      const fullDescripcion = reporte.descripcion || '';
      const modeloMatch = fullDescripcion.match(/Modelo:\s*([^\n]+)/i);
      const serieMatch = fullDescripcion.match(/Serie:\s*([^\n]+)/i);
      const sucursalMatch = fullDescripcion.match(/Sucursal:\s*([^\n]+)/i);
      const comentarioMatch = fullDescripcion.match(/Comentario:\s*([\s\S]+?)(?:\nPrioridad:|$)/i);

      const modeloValue = modeloMatch ? modeloMatch[1].trim() : (reporte.equipo_modelo || 'N/A');
      const serieValue = serieMatch ? serieMatch[1].trim() : (reporte.equipo_serie || 'N/A');
      const sucursalValue = sucursalMatch ? sucursalMatch[1].trim() : (reporte.sucursal || 'N/A');
      const comentarioFinal = comentarioMatch ? comentarioMatch[1].trim() : (reporte.comentario || 'Sin comentarios');

      // Crear HTML para el PDF con diseño SI MANT
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              margin: 10mm 15mm;
              size: A4;
            }
            
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              background: #ffffff;
              color: #2c3e50;
              line-height: 1.6;
              padding: 0 30px;
            }
            
            /* Header solo con logo */
            .header {
              text-align: right;
              padding: 20px 0 30px 0;
              border-bottom: 4px solid #00a8e8;
              margin-bottom: 40px;
            }
            
            .header-title {
              display: none;
            }
            
            .logo-container {
              display: inline-block;
            }
            
            .logo-text {
              font-size: 42px;
              font-weight: 900;
              letter-spacing: 5px;
              line-height: 1;
            }
            
            .logo-si {
              color: #c41e3a;
            }
            
            .logo-mant {
              color: #2c3e50;
            }
            
            .logo-subtitle {
              font-size: 9px;
              color: #6c757d;
              letter-spacing: 3px;
              margin-top: 8px;
              font-weight: 500;
              text-align: right;
            }
            
            /* Contenido con padding lateral */
            .content {
              padding: 0 20px;
            }
            
            /* Secciones con color azul */
            .section {
              margin-bottom: 45px;
              page-break-inside: avoid;
            }
            
            .section-title {
              color: #c41e3a;
              background: #ffffff;
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 25px;
              margin-top: 30px;
              padding: 12px 20px;
              letter-spacing: 1px;
              border-radius: 4px;
              border-left: 5px solid #c41e3a;
              box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            }
            
            /* Primera sección sin margin-top extra */
            .section:first-of-type .section-title {
              margin-top: 0;
            }
            
            /* Grid de campos con cajas */
            .field-row {
              display: flex;
              gap: 25px;
              margin-bottom: 20px;
            }
            
            .field {
              flex: 1;
              margin-bottom: 20px;
              padding: 15px 18px;
              background: #f8f9fa;
              border-left: 4px solid #00a8e8;
              border-radius: 4px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            }
            
            .field-label {
              font-size: 11px;
              color: #0077b6;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              margin-bottom: 8px;
              display: block;
            }
            
            .field-value {
              font-size: 16px;
              color: #2c3e50;
              line-height: 1.6;
              font-weight: 500;
              word-wrap: break-word;
              word-break: break-word;
              overflow-wrap: break-word;
              white-space: pre-wrap;
            }
            
            /* Valores especiales */
            .value-highlight {
              color: #c41e3a;
              font-weight: 700;
              text-transform: capitalize;
            }
            
            .value-price {
              font-size: 32px;
              font-weight: 700;
              color: red;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <div class="header-title"></div>
            <div class="logo-container">
              <div class="logo-text">
                <span class="logo-si">SI</span> <span class="logo-mant">MANT</span>
              </div>
            </div>
          </div>
          
          <!-- Contenido -->
          <div class="content">
            <!-- Datos Generales -->
            <div class="section">
              <div class="section-title">Datos Generales</div>
              
              <div class="field-row">
                <div class="field">
                  <div class="field-label">Modelo:</div>
                  <div class="field-value">${modeloValue}</div>
                </div>
                <div class="field">
                  <div class="field-label">Serie:</div>
                  <div class="field-value">${serieValue}</div>
                </div>
              </div>
              
              <div class="field-row">
                <div class="field">
                  <div class="field-label">Sucursal:</div>
                  <div class="field-value">${sucursalValue}</div>
                </div>
                <div class="field">
                  <div class="field-label">Prioridad:</div>
                  <div class="field-value" style="text-transform: capitalize;">${reporte.prioridad || 'media'}</div>
                </div>
              </div>
              
              <div class="field">
                <div class="field-label">Comentario / Problema:</div>
                <div class="field-value">${comentarioFinal}</div>
              </div>
              
              <div class="field-row">
                <div class="field">
                  <div class="field-label">Prioridad:</div>
                  <div class="field-value" style="text-transform: capitalize;">${reporte.prioridad || 'media'}</div>
                </div>
                <div class="field">
                  <div class="field-label">Estado:</div>
                  <div class="field-value value-highlight">${obtenerNombreEstado(reporte.estado)}</div>
                </div>
              </div>
              
              ${reporte.empresa ? `
              <div class="field">
                <div class="field-label">Empresa:</div>
                <div class="field-value">${reporte.empresa}</div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="field-label">Fecha de creación:</div>
                <div class="field-value">${reporte.created_at ? new Date(reporte.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No disponible'}</div>
              </div>
              
              ${reporte.usuario_nombre ? `
              <div class="field">
                <div class="field-label">Solicitante:</div>
                <div class="field-value">${reporte.usuario_nombre} ${reporte.usuario_apellido || ''}</div>
              </div>
              ` : ''}
            </div>
            
            <!-- Información de Cotización -->
            ${reporte.analisis_general ? `
            <div class="section">
              <div class="section-title">Información de Cotización</div>
              
              ${(reporte.estado === 'cerrado' || reporte.estado === 'cerrado_por_cliente' || reporte.estado === 'terminado') && reporte.precio_cotizacion && reporte.precio_cotizacion > 0 ? `
              <div class="field">
                <div class="field-label">Costo de cotización:</div>
                <div class="field-value value-price">$ ${parseFloat(reporte.precio_cotizacion).toFixed(2)}</div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="field-label">Análisis:</div>
                <div class="field-value">${reporte.analisis_general}</div>
              </div>
            </div>
            ` : ''}
            
            <!-- Trabajo Realizado -->
            ${(reporte.revision || reporte.reparacion || reporte.materiales_refacciones || reporte.recomendaciones) ? `
            <div class="section">
              <div class="section-title">Trabajo Realizado</div>
              
              ${reporte.revision ? `
              <div class="field">
                <div class="field-label">Revisión:</div>
                <div class="field-value">${reporte.revision}</div>
              </div>
              ` : '<div class="field"><div class="field-label">Revisión:</div><div class="field-value">*** Detalles de la revisión o diagnóstico ***</div></div>'}
              
              ${reporte.reparacion ? `
              <div class="field">
                <div class="field-label">Reparación:</div>
                <div class="field-value">${reporte.reparacion}</div>
              </div>
              ` : '<div class="field"><div class="field-label">Reparación:</div><div class="field-value">*** Detalles de las reparaciones realizadas aquí ***</div></div>'}
              
              ${reporte.materiales_refacciones ? `
              <div class="field">
                <div class="field-label">Materiales y Refacciones:</div>
                <div class="field-value">${reporte.materiales_refacciones}</div>
              </div>
              ` : '<div class="field"><div class="field-label">Materiales y Refacciones:</div><div class="field-value">*** Lista de materiales y refacciones utilizados aquí ***</div></div>'}
              
              ${reporte.recomendaciones ? `
              <div class="field">
                <div class="field-label">Recomendaciones:</div>
                <div class="field-value">${reporte.recomendaciones}</div>
              </div>
              ` : '<div class="field"><div class="field-label">Recomendaciones:</div><div class="field-value">*** Recomendaciones adicionales aquí ***</div></div>'}
            </div>
            ` : ''}
          </div>
          
          <!-- Onda inferior -->
          <div class="wave-bottom"></div>
        </body>
        </html>
      `;

      // Generar el PDF
      console.log('[PDF] Iniciando generación de PDF...');
      console.log('[PDF] Platform.OS:', Platform.OS);

      if (Platform.OS === 'web') {
        // En web, enviar al backend para generar PDF
        console.log('[PDF] Modo web detectado, enviando al backend...');
        try {
          console.log('[PDF] Haciendo fetch a backend...');
          const response = await fetch('http://localhost:3001/api/pdf/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: htmlContent })
          });

          console.log('[PDF] Response status:', response.status);

          if (!response.ok) throw new Error('Error al generar PDF');

          console.log('[PDF] Creando blob...');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;
          document.body.appendChild(link);
          console.log('[PDF] Haciendo click en link de descarga...');
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          console.log('[PDF] PDF descargado exitosamente');
          Alert.alert(
            'PDF Descargado',
            'El archivo se ha guardado en tu carpeta de descargas.',
            [{ text: 'OK' }]
          );
        } catch (error) {
          console.error('[PDF] Error:', error);
          Alert.alert('Error', 'No se pudo generar el PDF');
        }
      } else {
        // En mÃ³vil, usar expo-print normalmente
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        console.log('[PDF] PDF generado en:', uri);

        const fileName = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;

        // Android: Usar cacheDirectory es más seguro para compartir (FileProvider)
        // iOS: documentDirectory está bien, pero cache también funciona
        const storageDir = Platform.OS === 'android' ? FileSystem.cacheDirectory : FileSystem.documentDirectory;
        const downloadPath = `${storageDir}${fileName}`;

        await FileSystem.moveAsync({
          from: uri,
          to: downloadPath
        });

        const fileInfo = await FileSystem.getInfoAsync(downloadPath);
        console.log('[PDF] PDF guardado en:', downloadPath, 'Size:', fileInfo.exists ? fileInfo.size : 'UNKNOWN');

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadPath, {
            mimeType: 'application/pdf',
            dialogTitle: 'Abrir PDF de Reporte',
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert(
            'PDF Descargado',
            'El archivo se ha guardado exitosamente.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('[PDF] Error al generar PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerandoPDF(false);
    }
  };


  const cargarArchivosReporte = useCallback(
    async (reporteId: string) => {
      if (!reporteId) {
        setArchivosReporte([]);
        return;
      }
      setLoadingArchivos(true);
      try {
        const { success, data, error } = await obtenerArchivosReporteBackend(reporteId);
        if (success && data) {
          const soloMedia = (data || []).filter((a: any) => a.tipo_archivo !== 'pdf');
          setArchivosReporte(soloMedia);
          console.log('[CLIENTE-PANEL] Archivos cargados:', data?.length);
        } else {
          console.error('[CLIENTE-PANEL] Error cargando archivos:', error);
          setArchivosReporte([]);
        }
      } catch (error) {
        console.error('[CLIENTE-PANEL] Exception cargando archivos:', error);
        setArchivosReporte([]);
      } finally {
        setLoadingArchivos(false);
      }
    },
    []
  );

  // Cargar reportes y cotizaciones al enfocar el panel
  useFocusEffect(
    useCallback(() => {
      if (usuario?.email) {
        console.log('[CLIENTE-PANEL] Panel enfocado, cargando datos...');
        cargarReportes(usuario?.email);
        cargarCotizaciones(usuario?.email);
        // PASO 4: Cargar reportes finalizados por técnico
        cargarReportesFinalizados(usuario?.email);

        // Recargar cada 3 segundos para mantener datos actualizados (aumenté de 5 a 3)
        const interval = setInterval(() => {
          console.log('[CLIENTE-PANEL] Auto-refresh: recargando reportes finalizados');
          cargarReportesFinalizados(usuario?.email);
        }, 3000);

        return () => {
          console.log('[CLIENTE-PANEL] Panel desenfocado, limpiando interval');
          clearInterval(interval);
        };
      }
    }, [usuario?.email, cargarReportes, cargarCotizaciones, cargarReportesFinalizados])
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

  // Recargar cotizaciones cuando se abre el modal
  useEffect(() => {
    if (showCotizacionesModal && usuario?.email) {
      cargarCotizaciones(usuario.email);
    }
  }, [showCotizacionesModal, usuario?.email, cargarCotizaciones]);

  // Animation for refresh
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loadingCotizaciones) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [loadingCotizaciones]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Filtrar reportes que están pendientes de confirmación
  // SOLO cuando admin confirmó (finalizado_por_tecnico) o cliente confirmó (listo_para_encuesta)
  const reportesPorConfirmar = useMemo(
    () => reportesFinalizados.filter(r =>
      r.estado === 'finalizado_por_tecnico' ||
      r.estado === 'listo_para_encuesta' ||
      r.estado === 'encuesta_satisfaccion' ||
      r.estado === 'cerrado'
    ),
    [reportesFinalizados]
  );

  const finalizados = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'terminado'),
    [reportes]
  );
  const ahora = useMemo(() => new Date(), []);
  const reportesDelMes = useMemo(
    () =>
      todosLosReportes.filter((r) => {
        if (!r.created_at) return false;
        const d = new Date(r.created_at);
        return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
      }).length,
    [todosLosReportes, ahora]
  );
  // Contadores individuales por estado
  // Debug: ver qué estados están llegando
  useEffect(() => {
    if (todosLosReportes.length > 0) {
      const estados = todosLosReportes.map(r => r.estado);
      console.log('[CLIENTE-PANEL] Estados de reportes:', estados);
      console.log('[CLIENTE-PANEL] Estados únicos:', [...new Set(estados)]);
    }
  }, [todosLosReportes]);

  const enEsperaCount = useMemo(
    () => todosLosReportes.filter((r) => {
      const st = (r.estado || '').toLowerCase().replace(/\s+/g, '_');
      return st === 'en_espera' || st === 'pendiente' || st === 'en_espera';
    }).length,
    [todosLosReportes]
  );
  const asignadoCount = useMemo(
    () => todosLosReportes.filter((r) => {
      const st = (r.estado || '').toLowerCase().replace(/\s+/g, '_');
      return st === 'asignado';
    }).length,
    [todosLosReportes]
  );
  const enCotizacionCount = useMemo(
    () => todosLosReportes.filter((r) => {
      const st = (r.estado || '').toLowerCase().replace(/\s+/g, '_');
      return st === 'en_cotizacion' || st === 'cotizado' || st === 'en_espera_confirmacion';
    }).length,
    [todosLosReportes]
  );
  const enEjecucionCount = useMemo(
    () => todosLosReportes.filter((r) => {
      const st = (r.estado || '').toLowerCase().replace(/\s+/g, '_');
      return st === 'en_proceso' || st === 'en_ejecucion' || st === 'aceptado_por_cliente';
    }).length,
    [todosLosReportes]
  );
  const cerradoCount = useMemo(
    () => todosLosReportes.filter((r) => {
      const st = (r.estado || '').toLowerCase().replace(/\s+/g, '_');
      return st === 'cerrado' || st === 'cerrado_por_cliente' || st === 'terminado' || st === 'finalizado' || st === 'listo_para_encuesta' || st === 'encuesta_satisfaccion';
    }).length,
    [todosLosReportes]
  );
  const activos = useMemo(() =>
    reportes.filter((r) => {
      const st = (r.estado || '').toLowerCase();
      // Solo quitamos terminado/cerrado definitivamente de la vista principal
      // En cotización debe aparecer en seguimiento
      return st !== 'terminado' && st !== 'cerrado' && st !== 'finalizado';
    }),
    [reportes]
  );

  const normalizeStatus = (estado: string) => {
    const lower = (estado || '').toLowerCase();
    // Mapa de normalización
    if (lower.includes('espera') || lower.includes('pendiente')) return 'en_espera';
    if (lower.includes('asignado')) return 'asignado';
    if (lower.includes('cotiza') || lower.includes('confirmacion')) return 'en_cotizacion';
    if (lower.includes('ejecuci') || lower.includes('proceso') || lower.includes('aceptado')) return 'en_ejecucion';
    if (lower.includes('cerrado') || lower.includes('terminado') || lower.includes('finalizado') || lower.includes('listo') || lower.includes('encuesta')) return 'cerrado';
    return 'en_espera'; // Default
  };

  const activosFiltrados = useMemo(() => {
    let lista = [...activos];

    if (filtroEstado.length > 0) {
      lista = lista.filter((r) => {
        const key = normalizeStatus(r.estado);
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
      const key = normalizeStatus(r.estado);
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(r);
    });
    return grupos;
  }, [activosFiltrados]);

  const renderReporteCard = (rep: any, isSample = false) => {
    // Colores dinámicos según el estado usando el mapeo visual
    const getEstadoStyles = () => {
      const nombreVisual = obtenerNombreEstado(rep.estado);

      const estilos: Record<string, any> = {
        'En espera': { bg: '#f59e0b33', text: '#fcd34d', border: '#f59e0b66' },
        'En asignando': { bg: '#06b6d433', text: '#67e8f9', border: '#06b6d466' },
        'En cotización': { bg: '#ec489933', text: '#f472b6', border: '#ec489966' },
        'En ejecución': { bg: '#10b98133', text: '#6ee7b7', border: '#10b98166' },
        'Cerrado': { bg: '#6366f133', text: '#a5b4fc', border: '#6366f166' },
      };

      return estilos[nombreVisual] || { bg: '#64748b33', text: '#cbd5e1', border: '#64748b66' };
    };

    const estadoStyles = getEstadoStyles();
    const estadoBg = estadoStyles.bg;
    const estadoText = estadoStyles.text;
    const estadoBorder = estadoStyles.border;

    const prioridadBg = (rep.prioridad === 'alta' || rep.prioridad === 'urgente') ? '#ef444433' : rep.prioridad === 'media' ? '#f59e0b33' : '#10b98133';
    const prioridadText = (rep.prioridad === 'alta' || rep.prioridad === 'urgente') ? '#fca5a5' : rep.prioridad === 'media' ? '#fcd34d' : '#6ee7b7';
    const prioridadBorder = (rep.prioridad === 'alta' || rep.prioridad === 'urgente') ? '#ef444466' : rep.prioridad === 'media' ? '#f59e0b66' : '#10b98166';

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
                  : obtenerNombreEstado(rep.estado)}
              </Text>
            </View>
            {!isSample && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedReporte(rep);
                    setShowReporteDetail(true);
                    // Cargar archivos del reporte cuando se abre el detalle
                    cargarArchivosReporte(rep.id);
                  }}
                  style={styles.eyeButton}
                >
                  <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                </TouchableOpacity>
              </View>
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
      label: 'En Espera',
      value: enEsperaCount,
      iconBg: 'bg-yellow-500',
      iconName: 'time-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-yellow-400',
    },
    {
      label: 'Asignado',
      value: asignadoCount,
      iconBg: 'bg-cyan-500',
      iconName: 'person-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-cyan-400',
    },
    {
      label: 'En Cotización',
      value: enCotizacionCount,
      iconBg: 'bg-amber-500',
      iconName: 'calculator-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-amber-400',
    },
    {
      label: 'En Ejecución',
      value: enEjecucionCount,
      iconBg: 'bg-blue-500',
      iconName: 'construct-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-blue-400',
    },
    {
      label: 'Cerrado',
      value: cerradoCount,
      iconBg: 'bg-emerald-500',
      iconName: 'checkmark-circle-outline',
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
      console.log('[WhatsApp] Intentando abrir:', target);
      await Linking.openURL(target);
    } catch (e) {
      console.error('[WhatsApp] Error:', e);
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
      description: 'Historial de todos tus reportes',
      gradient: 'from-indigo-600 to-purple-500',
      iconName: 'folder-open-outline',
      onPress: async () => {
        setShowReportModal(true);
        const lista = (await cargarReportesFinalizados(usuario?.email)) || [];
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

  const handleUpdatePassword = async () => {
    // Reset validations
    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '', general: '' });
    let isValid = true;
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '', general: '' };

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida.';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida.';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Mínimo 6 caracteres.';
      isValid = false;
    } else if (passwordForm.newPassword === passwordForm.currentPassword) {
      newErrors.newPassword = 'Debe ser diferente a la actual.';
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña.';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
      isValid = false;
    }

    if (!isValid) {
      setPasswordErrors(newErrors);
      return;
    }

    setLoadingPassword(true);
    try {
      // Usar apiCall del backend-lib que ya maneja la URL y el token
      const response = await apiCall('/auth/change-password', 'PUT', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        Alert.alert('¡Excelente!', 'Tu contraseña ha sido actualizada correctamente.');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        // Manejo específico de errores del backend
        if (response.error === 'La contraseña actual es incorrecta') {
          setPasswordErrors(prev => ({ ...prev, currentPassword: 'La contraseña actual no es correcta.' }));
        } else {
          setPasswordErrors(prev => ({ ...prev, general: response.error || 'No se pudo actualizar.' }));
        }
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setPasswordErrors(prev => ({ ...prev, general: `Error de conexión: ${errorMessage}` }));
    } finally {
      setLoadingPassword(false);
    }
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
                  Bienvenido {usuario?.nombre ?? 'Usuario'}{usuario?.apellido ? ` ${usuario.apellido}` : ''}
                </Text>
                <Text style={[styles.empresaText, { fontFamily }]}>
                  Empresa {usuario?.empresa ? usuario.empresa : 'Empresa no definida'}
                </Text>
                <Text style={[styles.roleText, { fontFamily }]}>Panel de Cliente</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(true)}
                style={styles.toggleButton}
              >
                <Ionicons name="key-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
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


        </View>
      </ScrollView>

      {showReportModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { flex: 1, flexDirection: 'column', paddingTop: isMobile ? 60 : 20 }]}>
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
                Aquí ves todos tus reportes completados. Los reportes en progreso están en Seguimiento.
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

            {!loadingReportes && !errorReportes && reportesFinalizados.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.reportCard}>
                  <Text style={[styles.emptyText, { fontFamily }]}>Aún no tienes reportes completados.</Text>
                </View>
              </View>
            ) : null}


            {!loadingReportes && !errorReportes && reportesFinalizados.length > 0 ? (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <View style={styles.reportsContainer}>
                  {reportesFinalizados.map((rep) => renderReporteCard(rep))}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {showSeguimientoModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { flex: 1, flexDirection: 'column', paddingTop: isMobile ? 60 : 20 }]}>
            <View style={[styles.modalHeader, isMobile && styles.modalHeaderMobile]}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, isMobile && styles.modalTitleMobile, { fontFamily }]}>Seguimiento</Text>
                <Text style={[styles.modalSubtitle, isMobile && styles.modalSubtitleMobile, { fontFamily }]}>Reportes activos.</Text>
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
                          { value: 'en_espera', label: 'En Espera', icon: 'time-outline', color: '#eab308' },
                          { value: 'asignado', label: 'Asignado', icon: 'person-add-outline', color: '#06b6d4' },
                          { value: 'en_cotizacion', label: 'En Cotización', icon: 'calculator-outline', color: '#f59e0b' },
                          { value: 'en_ejecucion', label: 'En Ejecución', icon: 'construct-outline', color: '#3b82f6' },
                          { value: 'cerrado', label: 'Por Revisar', icon: 'checkmark-circle-outline', color: '#10b981' },
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
                          { value: 'alta', label: 'Urgente', icon: 'chevron-up-outline', color: '#ef4444' },
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
                        {['en_espera', 'asignado', 'en_cotizacion', 'en_ejecucion', 'cerrado']
                          .filter((e) => activosPorEstado[e])
                          .map((estado) => (
                            <View key={estado}>
                              {activosPorEstado[estado].map((rep) => renderReporteCard(rep))}
                            </View>
                          ))}
                        {Object.keys(activosPorEstado)
                          .filter((e) => !['en_espera', 'asignado', 'en_cotizacion', 'en_ejecucion', 'cerrado'].includes(e))
                          .map((estado) => (
                            <View key={estado}>
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

      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            {
              width: isMobile ? '90%' : '400px',
              maxHeight: 'auto',
              backgroundColor: '#0f172a',
              borderWidth: 1,
              borderColor: '#334155',
              padding: 0,
              overflow: 'hidden'
            }
          ]}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={{ width: '100%', padding: 24 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <View>
                  <Text style={[styles.modalTitle, { fontFamily, fontSize: 20, marginBottom: 4 }]}>Cambiar Contraseña</Text>
                  <Text style={[styles.modalSubtitle, { fontFamily, color: '#94a3b8' }]}>Actualiza tu clave de acceso</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '', general: '' });
                  }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {passwordErrors.general ? (
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 10, borderRadius: 8, marginBottom: 10 }}>
                  <Text style={{ color: '#f87171', fontFamily, fontSize: 13, textAlign: 'center' }}>{passwordErrors.general}</Text>
                </View>
              ) : null}

              <View style={{ gap: 20 }}>
                <View>
                  <Text style={[styles.label, { fontFamily, color: '#e2e8f0', marginBottom: 8, fontSize: 14, fontWeight: '500' }]}>Contraseña Actual</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: passwordErrors.currentPassword ? '#ef4444' : '#334155',
                    borderRadius: 8,
                    paddingHorizontal: 12
                  }}>
                    <Ionicons name="lock-closed-outline" size={18} color={passwordErrors.currentPassword ? '#ef4444' : "#64748b"} style={{ marginRight: 8 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        fontFamily,
                        color: 'white',
                        paddingVertical: 12,
                        fontSize: 15
                      }}
                      secureTextEntry
                      value={passwordForm.currentPassword}
                      onChangeText={(text) => {
                        setPasswordForm(prev => ({ ...prev, currentPassword: text }));
                        if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                      }}
                      placeholder="Ingresa tu contraseña actual"
                      placeholderTextColor="#475569"
                    />
                  </View>
                  {passwordErrors.currentPassword ? (
                    <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontFamily, marginLeft: 4 }}>
                      {passwordErrors.currentPassword}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text style={[styles.label, { fontFamily, color: '#e2e8f0', marginBottom: 8, fontSize: 14, fontWeight: '500' }]}>Nueva Contraseña</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: passwordErrors.newPassword ? '#ef4444' : '#334155',
                    borderRadius: 8,
                    paddingHorizontal: 12
                  }}>
                    <Ionicons name="key-outline" size={18} color={passwordErrors.newPassword ? '#ef4444' : "#64748b"} style={{ marginRight: 8 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        fontFamily,
                        color: 'white',
                        paddingVertical: 12,
                        fontSize: 15
                      }}
                      secureTextEntry
                      value={passwordForm.newPassword}
                      onChangeText={(text) => {
                        setPasswordForm(prev => ({ ...prev, newPassword: text }));
                        if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                      }}
                      placeholder="Ingresa la nueva contraseña"
                      placeholderTextColor="#475569"
                    />
                  </View>
                  {passwordErrors.newPassword ? (
                    <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontFamily, marginLeft: 4 }}>
                      {passwordErrors.newPassword}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text style={[styles.label, { fontFamily, color: '#e2e8f0', marginBottom: 8, fontSize: 14, fontWeight: '500' }]}>Confirmar Nueva Contraseña</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1e293b',
                    borderWidth: 1,
                    borderColor: passwordErrors.confirmPassword ? '#ef4444' : '#334155',
                    borderRadius: 8,
                    paddingHorizontal: 12
                  }}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={passwordErrors.confirmPassword ? '#ef4444' : "#64748b"} style={{ marginRight: 8 }} />
                    <TextInput
                      style={{
                        flex: 1,
                        fontFamily,
                        color: 'white',
                        paddingVertical: 12,
                        fontSize: 15
                      }}
                      secureTextEntry
                      value={passwordForm.confirmPassword}
                      onChangeText={(text) => {
                        setPasswordForm(prev => ({ ...prev, confirmPassword: text }));
                        if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                      placeholder="Confirma la nueva contraseña"
                      placeholderTextColor="#475569"
                    />
                  </View>
                  {passwordErrors.confirmPassword ? (
                    <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontFamily, marginLeft: 4 }}>
                      {passwordErrors.confirmPassword}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleUpdatePassword}
                  disabled={loadingPassword}
                  style={{
                    backgroundColor: '#06b6d4',
                    borderRadius: 8,
                    paddingVertical: 14,
                    alignItems: 'center',
                    marginTop: 12,
                    shadowColor: '#06b6d4',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                    opacity: loadingPassword ? 0.7 : 1
                  }}
                >
                  {loadingPassword ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ fontFamily, color: 'white', fontWeight: '600', fontSize: 16 }}>Actualizar Contraseña</Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
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

              {(() => {
                // Usar descripcion que contiene el formato completo: "Modelo: xxx\nSerie: yyy\nSucursal: zzz\nComentario: aaa"
                const fullDescripcion = selectedReporte.descripcion || '';

                // Regex para extraer campos (consistente con admin.tsx)
                const modeloMatch = fullDescripcion.match(/Modelo:\s*([^\n]+)/i);
                const serieMatch = fullDescripcion.match(/Serie:\s*([^\n]+)/i);
                const sucursalMatch = fullDescripcion.match(/Sucursal:\s*([^\n]+)/i);
                const comentarioMatch = fullDescripcion.match(/Comentario:\s*([\s\S]+?)(?:\nPrioridad:|$)/i);

                const modeloValue = modeloMatch ? modeloMatch[1].trim() : (selectedReporte.equipo_modelo || 'N/A');
                const serieValue = serieMatch ? serieMatch[1].trim() : (selectedReporte.equipo_serie || 'N/A');
                const sucursalValue = sucursalMatch ? sucursalMatch[1].trim() : (selectedReporte.sucursal || 'N/A');
                const comentarioFinal = comentarioMatch ? comentarioMatch[1].trim() : (selectedReporte.comentario || 'Sin comentarios');

                return (
                  <>
                    <View style={styles.detailRow}>
                      <View style={[styles.detailField, { flex: 1 }]}>
                        <Text style={[styles.detailLabel, { fontFamily }]}>Modelo</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{modeloValue}</Text>
                      </View>
                      <View style={[styles.detailField, { flex: 1 }]}>
                        <Text style={[styles.detailLabel, { fontFamily }]}>Serie</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{serieValue}</Text>
                      </View>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={[styles.detailLabel, { fontFamily }]}>Sucursal</Text>
                      <Text style={[styles.detailValue, { fontFamily }]}>{sucursalValue}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={[styles.detailLabel, { fontFamily }]}>Comentario / Problema</Text>
                      <Text style={[styles.detailValue, { fontFamily }]}>{comentarioFinal}</Text>
                    </View>
                  </>
                );
              })()}

              <View style={styles.detailRow}>
                <View style={[styles.detailField, { flex: 1 }]}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Prioridad</Text>
                  <Text style={[styles.detailValue, { fontFamily, textTransform: 'capitalize' }]}>{selectedReporte.prioridad || 'media'}</Text>
                </View>

                <View style={[styles.detailField, { flex: 1 }]}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Estado</Text>
                  <Text style={[styles.detailValue, { fontFamily, color: '#6ee7b7', fontWeight: '600', textTransform: 'capitalize' }]}>
                    {obtenerNombreEstado(selectedReporte.estado)}
                  </Text>
                </View>
              </View>

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

              {(selectedReporte.analisis_general || (selectedReporte.precio_cotizacion && selectedReporte.precio_cotizacion > 0)) && (
                <>
                  <View style={[styles.detailSeparator, { marginVertical: 20 }]}>
                    <View style={styles.separatorLine} />
                    <Text style={[styles.separatorText, { fontFamily }]}>Información de Cotización</Text>
                    <View style={styles.separatorLine} />
                  </View>

                  {selectedReporte.analisis_general && (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailLabel, { fontFamily, color: '#f59e0b' }]}>Análisis del técnico</Text>
                      <Text style={[styles.detailValue, { fontFamily }]}>
                        {selectedReporte.analisis_general}
                      </Text>
                    </View>
                  )}

                  {selectedReporte.precio_cotizacion && selectedReporte.precio_cotizacion > 0 && (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailLabel, { fontFamily, color: '#f59e0b' }]}>Costo de Cotización</Text>
                      <Text style={[styles.detailValue, { fontFamily, fontSize: 24, fontWeight: '700', color: '#10b981' }]}>
                        ${parseFloat(selectedReporte.precio_cotizacion).toFixed(2)}
                      </Text>
                    </View>
                  )}
                </>
              )}



              {/* Fase 2: Detalles del Trabajo Realizado (Técnico) - Solo si está finalizado/cerrado */}
              {(
                selectedReporte.estado === 'cerrado' ||
                selectedReporte.estado === 'resuelto' ||
                selectedReporte.estado === 'cerrado_por_cliente' ||
                selectedReporte.estado === 'encuesta_satisfaccion' ||
                selectedReporte.estado === 'terminado' ||
                selectedReporte.estado === 'finalizado' ||
                selectedReporte.estado === 'finalizado_por_tecnico' ||
                selectedReporte.estado === 'listo_para_encuesta'
              ) && (selectedReporte.revision || selectedReporte.reparacion || selectedReporte.recomendaciones || selectedReporte.materiales_refacciones || selectedReporte.recomendaciones_adicionales) && (
                  <>
                    <View style={[styles.detailSeparator, { marginVertical: 20 }]}>
                      <View style={styles.separatorLine} />
                      <Text style={[styles.separatorText, { fontFamily }]}>Trabajo Realizado</Text>
                      <View style={styles.separatorLine} />
                    </View>

                    {selectedReporte.revision ? (
                      <View style={styles.detailField}>
                        <Text style={[styles.detailLabel, { fontFamily, color: '#67e8f9' }]}>Revisión</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.revision}</Text>
                      </View>
                    ) : null}

                    {selectedReporte.reparacion ? (
                      <View style={styles.detailField}>
                        <Text style={[styles.detailLabel, { fontFamily, color: '#67e8f9' }]}>Reparación</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.reparacion}</Text>
                      </View>
                    ) : null}

                    {selectedReporte.materiales_refacciones ? (
                      <View style={styles.detailField}>
                        <Text style={[styles.detailLabel, { fontFamily, color: '#67e8f9' }]}>Materiales y Refacciones</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.materiales_refacciones}</Text>
                      </View>
                    ) : null}

                    {selectedReporte.recomendaciones ? (
                      <View style={styles.detailField}>
                        <Text style={[styles.detailLabel, { fontFamily, color: '#67e8f9' }]}>Recomendaciones</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.recomendaciones}</Text>
                      </View>
                    ) : null}

                    {selectedReporte.recomendaciones_adicionales ? (
                      <View style={styles.detailField}>
                        <Text style={[styles.detailLabel, { fontFamily, color: '#67e8f9' }]}>Recomendaciones Adicionales</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{selectedReporte.recomendaciones_adicionales}</Text>
                      </View>
                    ) : null}
                  </>
                )}
              {loadingArchivos ? (
                <View style={styles.detailField}>
                  <Text style={[styles.detailLabel, { fontFamily }]}>Cargando archivos...</Text>
                </View>
              ) : null}

              {!loadingArchivos && archivosReporte && archivosReporte.length > 0 && (
                <>
                  <View style={[styles.detailSeparator, { marginVertical: 20 }]}>
                    <View style={styles.separatorLine} />
                    <Text style={[styles.separatorText, { fontFamily }]}>Archivos Adjuntos ({archivosReporte.length})</Text>
                    <View style={styles.separatorLine} />
                  </View>
                  <View style={styles.archivosContainer}>
                    {archivosReporte.map((archivo: any, idx: number) => {
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
                </>
              )}
            </ScrollView>

            <View style={[styles.detailFooter, isMobile && { flexDirection: 'column' }]}>
              <TouchableOpacity
                onPress={() => {
                  setShowReporteDetail(false);
                  setSelectedReporte(null);
                }}
                style={[styles.detailCloseButton, isMobile && { flex: 0, width: '100%' }]}
              >
                <Text style={[styles.detailCloseButtonText, { fontFamily }]}>Cerrar</Text>
              </TouchableOpacity>

              {/* Botón Responder Encuesta - solo cuando hubo trabajo y no fue cancelado */}
              {(selectedReporte.estado === 'cerrado' || selectedReporte.estado === 'terminado') &&
                selectedReporte.estado !== 'cancelado' &&
                !selectedReporte.esCancelado &&
                !encuestasEnviadas.has(selectedReporte.id) &&
                !encuestasRespondidas.has(selectedReporte.id) && (
                  <TouchableOpacity
                    onPress={() => {
                      // Abrir la encuesta de satisfacción con todos los datos necesarios
                      router.push({
                        pathname: '/encuesta',
                        params: {
                          reporteId: selectedReporte.id,
                          clienteEmail: usuario?.email || '',
                          clienteNombre: usuario?.nombre || '',
                          empresa: usuario?.empresa || '',
                          empleadoEmail: selectedReporte.empleado_email || '',
                          empleadoNombre: selectedReporte.empleado_nombre || ''
                        }
                      });
                      setShowReporteDetail(false);
                    }}
                    style={{
                      flex: isMobile ? 0 : 1,
                      width: isMobile ? '100%' : 'auto',
                      backgroundColor: '#f59e0b',
                      marginLeft: isMobile ? 0 : 12,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12 // Ensure consistent padding
                    }}
                  >
                    <Text style={[{ color: '#fff', fontSize: 14, fontWeight: '700' }, { fontFamily }]}>
                      📋 Responder Encuesta
                    </Text>
                  </TouchableOpacity>
                )}

              {/* Botón Descargar PDF para reportes cerrados y en cotización */}
              {(selectedReporte.estado === 'cerrado' ||
                selectedReporte.estado === 'cerrado_por_cliente' ||
                selectedReporte.estado === 'terminado' ||
                selectedReporte.estado === 'en_cotizacion' ||
                selectedReporte.estado === 'cotizado' ||
                selectedReporte.estado === 'en_espera_confirmacion') && (
                  <TouchableOpacity
                    disabled={generandoPDF}
                    onPress={() => {
                      generarPDF(selectedReporte);
                    }}
                    style={{
                      flex: isMobile ? 0 : 1,
                      width: isMobile ? '100%' : 'auto',
                      backgroundColor: generandoPDF ? '#9ca3af' : '#ef4444',
                      marginLeft: isMobile ? 0 : 12,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                      paddingVertical: 14 // Match other buttons height
                    }}
                  >
                    {generandoPDF ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="document-text-outline" size={20} color="#fff" />
                    )}
                    <Text style={[{ color: '#fff', fontSize: 14, fontWeight: '700' }, { fontFamily }]}>
                      {generandoPDF ? 'Descargando...' : 'Descargar PDF'}
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>
      )
      }

      {
        showSuccessOverlay && (
          <View style={styles.successOverlay}>
            <View style={[styles.successContainer, {
              backgroundColor: '#d1d1d1ff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }]}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#10b981',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons name="checkmark" size={36} color="#ffffff" />
                </View>
                <Text style={[{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: 8,
                  textAlign: 'center',
                }, { fontFamily }]}>
                  ¡Reporte enviado!
                </Text>
              </View>
              <Text style={[{
                fontSize: 15,
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
              }, { fontFamily }]}>
                Tu reporte se generó exitosamente. El equipo lo revisará en breve.
              </Text>
              <TouchableOpacity
                onPress={() => setShowSuccessOverlay(false)}
                style={{
                  backgroundColor: '#10b981',
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
                activeOpacity={0.8}
              >
                <Text style={[{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: '600',
                }, { fontFamily }]}>
                  Entendido
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      }

      {/* Modal Cotizaciones */}
      {
        showCotizacionesModal && (
          <View style={styles.overlay}>
            <View style={[styles.largeModal, { flex: 1, flexDirection: 'column', paddingTop: isMobile ? 60 : 0 }]}>
              <View style={styles.largeModalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, { fontFamily }]}>Cotizaciones</Text>
                  <Text style={[styles.largeModalSubtitle, { fontFamily }]}>Cotizaciones de tus reportes</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => cargarCotizaciones(usuario?.email)}
                    style={[styles.refreshButton, loadingCotizaciones && styles.refreshButtonDisabled, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                    disabled={loadingCotizaciones}
                  >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="refresh" size={14} color="#67e8f9" />
                    </Animated.View>
                    <Text style={[styles.refreshButtonText, { fontFamily }]}>Actualizar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => {
                    setShowCotizacionesModal(false);
                    setCotizaciones([]);
                  }} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#cbd5e1" />
                  </TouchableOpacity>
                </View>
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
                  <View style={{ alignItems: 'center', marginVertical: 12 }}>
                    <View style={{ backgroundColor: '#10b98120', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}>
                      <Text style={[styles.infoText, { fontFamily, color: '#10b981', fontSize: 13, fontWeight: '600' }]}>
                        Mostrando {cotizaciones.length} cotizacion{cotizaciones.length !== 1 ? 'es' : ''}
                      </Text>
                    </View>
                  </View>
                  <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
                  >
                    {cotizaciones.map((cot: any) => {
                      console.log('[RENDER] Renderizando cotización:', cot.id, cot.estado);
                      return (
                        <View
                          key={cot.id}
                          style={styles.reportCard}
                        >
                          <View style={styles.reportHeader}>
                            <View style={[styles.reportHeaderText, { gap: 6 }]}>
                              {/* 1. Nombre del Equipo */}
                              <Text style={[styles.reportTitle, { fontFamily, fontSize: 16 }]} numberOfLines={1}>
                                {cot.equipo_descripcion || cot.reportes?.equipo_descripcion || 'Equipo'}
                              </Text>

                              {/* 2. Modelo y Serie (extraídos de descripcion) */}
                              {(() => {
                                const desc = cot.descripcion || '';
                                const modeloMatch = desc.match(/Modelo:\s*([^\n]+)/i);
                                const serieMatch = desc.match(/Serie:\s*([^\n]+)/i);
                                const modelo = modeloMatch ? modeloMatch[1].trim() : '';
                                const serie = serieMatch ? serieMatch[1].trim() : '';

                                if (modelo || serie) {
                                  return (
                                    <View style={{ gap: 2 }}>
                                      {modelo && (
                                        <Text style={[styles.reportSubtitle, { fontFamily, color: '#94a3b8' }]} numberOfLines={1}>
                                          Modelo: {modelo}
                                        </Text>
                                      )}
                                      {serie && (
                                        <Text style={[styles.reportSubtitle, { fontFamily, color: '#94a3b8' }]} numberOfLines={1}>
                                          Serie: {serie}
                                        </Text>
                                      )}
                                    </View>
                                  );
                                }
                                return null;
                              })()}

                              {/* Fecha */}
                              <Text style={[styles.reportMeta, { fontFamily }]} numberOfLines={1}>
                                {new Date(cot.created_at).toLocaleDateString('es-ES')}
                              </Text>

                              {/* 4. Precio al final */}
                              <Text style={[styles.reportTitle, { fontFamily, color: '#f59e0b', marginTop: 4, fontSize: 18 }]}>
                                {cot.precio_cotizacion && parseFloat(cot.precio_cotizacion) > 0
                                  ? `$${parseFloat(cot.precio_cotizacion).toFixed(2)}`
                                  : '(esperando respuesta)'}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

                              <TouchableOpacity
                                onPress={async () => {
                                  console.log('[DEBUG] Presionando ojo de cotización:', cot.id);
                                  console.log('[DEBUG] Cotización completa:', JSON.stringify(cot, null, 2));
                                  setCotizacionSeleccionada(cot);
                                  setShowCotizacionDetalleModal(true);

                                  // Buscar si hay un PDF adjunto para esta cotización
                                  const reporteId = cot.reporte_id || cot.id;
                                  console.log('[DEBUG] Buscando archivos para reporteId:', reporteId);

                                  if (reporteId) {
                                    try {
                                      const { success, data, error } = await obtenerArchivosReporteBackend(reporteId);
                                      console.log('[DEBUG] Resultado obtención archivos:', { success, dataLength: data?.length, error });

                                      if (success && data) {
                                        const pdf = data.find((a: any) => a.tipo_archivo === 'pdf');
                                        console.log('[DEBUG] PDF encontrado:', pdf ? pdf.nombre_original : 'NINGUNO');
                                        setArchivoPDFCotizacion(pdf || null);
                                      }
                                    } catch (err) {
                                      console.error('[CLIENTE] Error al buscar PDF de cotización:', err);
                                    }
                                  }
                                }}
                                style={styles.eyeButton}
                              >
                                <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )
      }

      {/* Modal Detalle Cotización */}
      {
        showCotizacionDetalleModal && cotizacionSeleccionada && (
          <View style={styles.overlay}>
            <View style={[styles.largeModal, { flex: 1, flexDirection: 'column', paddingTop: isMobile ? 60 : 0 }]}>
              <View style={styles.largeModalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, { fontFamily }]}>Detalle de Cotización</Text>
                  <Text style={[styles.largeModalSubtitle, { fontFamily }]}>Revisión de cotización</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  setShowCotizacionDetalleModal(false);
                  setCotizacionSeleccionada(null);
                  setArchivoPDFCotizacion(null);
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
                      <Text style={[styles.detailValue, { fontFamily }]}>{cotizacionSeleccionada.equipo_descripcion || 'N/A'}</Text>
                    </View>

                    {/* Parsear descripcion para obtener Modelo, Serie, Sucursal, Prioridad */}
                    {(() => {
                      const desc = cotizacionSeleccionada.descripcion || '';
                      const modeloMatch = desc.match(/Modelo:\s*([^\n]+)/i);
                      const serieMatch = desc.match(/Serie:\s*([^\n]+)/i);
                      const sucursalMatch = desc.match(/Sucursal:\s*([^\n]+)/i);
                      const prioridadMatch = desc.match(/Prioridad:\s*([^\n]+)/i);
                      // El comentario real suele estar después de "Comentario:"
                      const comentarioRealMatch = desc.match(/Comentario:\s*([^\n]+)/i);

                      const modelo = modeloMatch ? modeloMatch[1].trim() : null;
                      const serie = serieMatch ? serieMatch[1].trim() : null;
                      const sucursal = sucursalMatch ? sucursalMatch[1].trim() : null;
                      const prioridad = prioridadMatch ? prioridadMatch[1].trim() : null;
                      const comentarioReal = comentarioRealMatch ? comentarioRealMatch[1].trim() : (cotizacionSeleccionada.comentario || desc);

                      return (
                        <>
                          {modelo && (
                            <View style={styles.detailField}>
                              <Text style={[styles.detailLabel, { fontFamily }]}>Modelo</Text>
                              <Text style={[styles.detailValue, { fontFamily }]}>{modelo}</Text>
                            </View>
                          )}
                          {serie && (
                            <View style={styles.detailField}>
                              <Text style={[styles.detailLabel, { fontFamily }]}>Serie</Text>
                              <Text style={[styles.detailValue, { fontFamily }]}>{serie}</Text>
                            </View>
                          )}
                          {sucursal && (
                            <View style={styles.detailField}>
                              <Text style={[styles.detailLabel, { fontFamily }]}>Sucursal</Text>
                              <Text style={[styles.detailValue, { fontFamily }]}>{sucursal}</Text>
                            </View>
                          )}
                          <View style={styles.detailField}>
                            <Text style={[styles.detailLabel, { fontFamily }]}>Comentario</Text>
                            <Text style={[styles.detailValue, { fontFamily }]}>{comentarioReal || 'N/A'}</Text>
                          </View>
                          {prioridad && (
                            <View style={styles.detailField}>
                              <Text style={[styles.detailLabel, { fontFamily }]}>Prioridad</Text>
                              <Text style={[styles.detailValue, { fontFamily }]}>{prioridad}</Text>
                            </View>
                          )}
                        </>
                      );
                    })()}
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
                        {cotizacionSeleccionada.precio_cotizacion && cotizacionSeleccionada.precio_cotizacion > 0
                          ? `$${parseFloat(cotizacionSeleccionada.precio_cotizacion).toFixed(2)}`
                          : 'Por Cotizar'}
                      </Text>
                    </View>

                    {cotizacionSeleccionada.cotizacion_explicacion && (
                      <View style={styles.detailField}>
                        <Text style={[styles.detailLabel, { fontFamily }]}>Explicación de la Cotización</Text>
                        <Text style={[styles.detailValue, { fontFamily }]}>{cotizacionSeleccionada.cotizacion_explicacion}</Text>
                      </View>
                    )}

                  </View>

                  {/* PDF de la cotización */}
                  {archivoPDFCotizacion && (
                    <View style={[styles.detailSection, { marginTop: 10, borderColor: '#8b5cf6', borderWidth: 1.5, backgroundColor: 'rgba(139, 92, 246, 0.05)' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', padding: 8, borderRadius: 10 }}>
                          <Ionicons name="document-text" size={24} color="#a78bfa" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.detailSectionTitle, { color: '#a78bfa', marginBottom: 2, fontFamily }]}>Cotización Formal (PDF)</Text>
                          <Text style={{ color: '#94a3b8', fontSize: 12, fontFamily }}>Documento adjunto por administración</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={{
                          backgroundColor: '#8b5cf6',
                          borderRadius: 10,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                        }}
                        onPress={() => {
                          const proxyUrl = getProxyUrl(archivoPDFCotizacion.cloudflare_url);
                          Linking.openURL(proxyUrl);
                        }}
                      >
                        <Ionicons name="download-outline" size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 14, fontFamily }}>Ver / Descargar Cotización PDF</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Acciones */}
                  {(cotizacionSeleccionada.estado === 'cotizado' || cotizacionSeleccionada.estado === 'en_espera_confirmacion' || cotizacionSeleccionada.estado === 'cotizacionnueva') && (
                    <View style={styles.detailActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                        onPress={async () => {
                          try {
                            // Cuando el cliente acepta, cambiar estado a 'aceptado_por_cliente'
                            // Esto permite que el empleado trabaje pero que no aparezca en Cotizaciones
                            console.log('[CLIENTE] Aceptando cotización, cambiando a aceptado_por_cliente');

                            const resultado = await actualizarReporteBackend(cotizacionSeleccionada.id, {
                              estado: 'aceptado_por_cliente'
                            });

                            if (!resultado.success) {
                              showToast('Error al aceptar cotización', 'error');
                              return;
                            }

                            // Remover de la lista local inmediatamente
                            setCotizaciones((prev) =>
                              prev.filter((c) => c.id !== cotizacionSeleccionada.id)
                            );

                            // Cerrar el modal inmediatamente
                            setShowCotizacionDetalleModal(false);

                            showToast('Cotización aceptada. El técnico puede comenzar el trabajo.', 'success');

                            // Recargar cotizaciones en background sin bloquear
                            setTimeout(() => {
                              cargarCotizaciones(usuario?.email);
                            }, 500);
                          } catch (error) {
                            console.error('[CLIENTE] Error:', error);
                            showToast('Error al aceptar cotización', 'error');
                          }
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={[styles.actionButtonText, { fontFamily }]}>Aceptar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                        onPress={() => {
                          setReporteARechazar(cotizacionSeleccionada);
                          setReporteARechazar(cotizacionSeleccionada);
                          setStepRechazo(1);
                          setMotivoRechazo('');
                          setShowConfirmarRechazoModal(true);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="white" />
                        <Text style={[styles.actionButtonText, { fontFamily }]}>Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Acciones para trabajo finalizado por técnico */}
                  {cotizacionSeleccionada.estado === 'finalizado_por_tecnico' && (
                    <View style={styles.detailActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                        onPress={async () => {
                          // Preparar datos del reporte para la encuesta
                          setReporteAConfirmar({
                            id: cotizacionSeleccionada.id,
                            equipo_descripcion: cotizacionSeleccionada.equipo_descripcion,
                            empleado_asignado_email: cotizacionSeleccionada.empleado_email,
                            empleado_asignado_nombre: cotizacionSeleccionada.empleado_nombre,
                          });
                          setShowCotizacionDetalleModal(false);
                          setShowConfirmarFinalizacionModal(true);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={[styles.actionButtonText, { fontFamily }]}>Confirmar Finalización</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                        onPress={async () => {
                          showToast('Trabajo no confirmado', 'info');
                          setShowCotizacionDetalleModal(false);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="white" />
                        <Text style={[styles.actionButtonText, { fontFamily }]}>Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Botón de Descargar PDF - Disponible siempre */}
                  <View style={[styles.detailSection, { marginTop: 20, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 }]}>
                    <TouchableOpacity
                      disabled={generandoPDF}
                      onPress={() => {
                        generarPDF(cotizacionSeleccionada);
                      }}
                      style={{
                        backgroundColor: generandoPDF ? '#9ca3af' : '#ef4444',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        paddingVertical: 14,
                        paddingHorizontal: 20
                      }}
                    >
                      {generandoPDF ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="document-text-outline" size={20} color="#fff" />
                      )}
                      <Text style={[{ color: '#fff', fontSize: 14, fontWeight: '700' }, { fontFamily }]}>
                        {generandoPDF ? 'Descargando...' : 'Descargar PDF'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )
      }

      {/* Modal para visualizar archivo completo */}
      {
        showArchivoModal && archivoVisualizando && (
          <View style={[styles.modalOverlay, isMobile && styles.modalOverlayMobile, { zIndex: 70 }]}>
            <View style={[styles.archivoModalContent, { flex: 1, flexDirection: 'column', justifyContent: 'center' }]}>
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
        )
      }


      {/* Modal Logout */}
      {
        showLogout && (
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
        )
      }

      {/* Toast Personalizado */}
      {
        toastMessage && (
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
        )
      }
      {/* Modal de Confirmación de Rechazo (Custom) */}
      {showConfirmarRechazoModal && (
        <View style={[styles.modalOverlay, { zIndex: 9999 }]}>
          <View style={[
            styles.modalContainer,
            {
              width: isMobile ? '90%' : '400px',
              maxHeight: 'auto',
              backgroundColor: '#0f172a',
              borderWidth: 1,
              borderColor: '#334155',
              padding: 0,
              overflow: 'hidden'
            }
          ]}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={{ width: '100%', padding: 24 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 10, borderRadius: 12 }}>
                  <Ionicons name="alert-circle" size={28} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { fontFamily, fontSize: 18 }]}>Cancelar Reporte</Text>
                </View>
              </View>

              {reporteARechazar?.estado === 'cotizacionnueva' ? (
                <Text style={{ fontFamily, color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
                  Al cancelar, el reporte quedará en estado cancelado y ya no aparecerá en seguimiento. Esta acción no se puede deshacer.
                </Text>
              ) : stepRechazo === 1 ? (
                <Text style={{ fontFamily, color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
                  ¿Estás seguro de que deseas cancelar este reporte? Esta acción no se puede deshacer y el reporte se eliminará de su seguimiento.
                </Text>
              ) : (
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontFamily, color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>
                    Por favor, indícanos el motivo del rechazo:
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.4)',
                      borderWidth: 1,
                      borderColor: '#334155',
                      borderRadius: 10,
                      padding: 14,
                      color: '#f8fafc',
                      fontFamily,
                      fontSize: 14,
                      minHeight: 100,
                      textAlignVertical: 'top'
                    }}
                    placeholder="Escribe aquí el motivo..."
                    placeholderTextColor="#64748b"
                    multiline
                    value={motivoRechazo}
                    onChangeText={setMotivoRechazo}
                    autoFocus
                  />
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#334155',
                    backgroundColor: 'transparent',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setShowConfirmarRechazoModal(false);
                    setReporteARechazar(null);
                    setMotivoRechazo('');
                    setStepRechazo(1);
                  }}
                >
                  <Text style={{ fontFamily, color: '#e2e8f0', fontWeight: '600' }}>No, Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: '#ef4444',
                    alignItems: 'center',
                    shadowColor: '#ef4444',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={async () => {
                    if (!reporteARechazar) return;
                    const esSegundaCotizacion = reporteARechazar.estado === 'cotizacionnueva';

                    if (stepRechazo === 1 && !esSegundaCotizacion) {
                      setStepRechazo(2);
                      return;
                    }

                    if (!esSegundaCotizacion && !motivoRechazo.trim()) {
                      showToast('Por favor ingresa un motivo', 'warning');
                      return;
                    }

                    setRechazandoReporte(true);
                    try {
                      console.log('[CLIENTE] Cancelando reporte (rechazando cotización), cambiando a rechazado');
                      const estadoRechazo = 'rechazado';
                      const payload: any = {
                        estado: estadoRechazo,
                        precio_cotizacion: 0
                      };
                      if (esSegundaCotizacion) {
                        payload.motivo_cancelacion = 'Rechazo de cotizacion nueva';
                      } else {
                        payload.motivo_cancelacion = motivoRechazo.trim();
                      }
                      const resultado = await actualizarReporteBackend(reporteARechazar.id, payload);

                      if (!resultado.success) {
                        showToast(resultado.error || 'Error al rechazar', 'error');
                        setRechazandoReporte(false);
                        return;
                      }

                      showToast('Reporte cancelado exitosamente', 'success');
                      setShowConfirmarRechazoModal(false);
                      setReporteARechazar(null);
                      setMotivoRechazo('');
                      setStepRechazo(1);

                      // Recargar datos
                      cargarReportes(usuario?.email);
                      cargarCotizaciones(usuario?.email);
                      if (esSegundaCotizacion) {
                        setCanceladosLocal((prev) => {
                          const next = new Set(prev);
                          next.add(Number(reporteARechazar.id));
                          AsyncStorage.setItem('reportes_cancelados_local', JSON.stringify(Array.from(next)));
                          return next;
                        });
                        setCotizaciones((prev) => prev.filter((c) => c.id !== reporteARechazar.id));
                        setReportesFinalizados((prev) => [
                          { ...reporteARechazar, estado: 'rechazado', esCancelado: true },
                          ...prev.filter((r) => r.id !== reporteARechazar.id)
                        ]);
                      }
                      setShowCotizacionDetalleModal(false);

                    } catch (error) {
                      console.error('[CLIENTE] Error al rechazar:', error);
                      showToast('Error inesperado al rechazar', 'error');
                    } finally {
                      setRechazandoReporte(false);
                    }
                  }}
                  disabled={rechazandoReporte}
                >
                  <Text style={{ fontFamily, color: '#e2e8f0', fontWeight: '600' }}>
                    {rechazandoReporte
                      ? 'Procesando...'
                      : (reporteARechazar?.estado === 'cotizacionnueva'
                        ? 'Sí, cancelar'
                        : (stepRechazo === 1 ? 'Sí, continuar' : 'Confirmar Cancelación'))}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Modal de Éxito al Responder Encuesta */}
      <Modal
        visible={showEncuestaSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEncuestaSuccessModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="checkmark-circle" size={40} color="#10b981" />
            </View>

            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 8, textAlign: 'center', fontFamily }}>
              ¡Gracias por tu tiempo!
            </Text>

            <Text style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 24, lineHeight: 22, fontFamily }}>
              Tu opinión es muy valiosa para nosotros. El reporte ha sido cerrado exitosamente.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setShowEncuestaSuccessModal(false);
                // Limpiar parámetros al cerrar
                if (Platform.OS !== 'web') {
                  router.replace('/cliente-panel');
                } else {
                  window.history.replaceState({}, '', '/cliente-panel');
                }
              }}
              style={{ backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, width: '100%', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, fontFamily }}>
                Entendido
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView >
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
    zIndex: 50,
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
    zIndex: 60,
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
    flexWrap: 'wrap',
    flexShrink: 1,
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
  archivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
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
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    borderWidth: 0,
    padding: 0,
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
  archivoModalName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  archivoModalNameMobile: {
    fontSize: 12,
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
});

// Estilo especial para el overlay del modal de archivo (debe estar por encima)
const archivoOverlayStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000000b3',
  zIndex: 50, // Mayor que detailOverlay (40)
  paddingHorizontal: 16,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export default function ClientePanel() {
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
        if (parsedUser.rol !== 'cliente') {
          console.warn(`[SEGURIDAD] Usuario ${parsedUser.email} con rol ${parsedUser.rol} intentó acceder a /cliente-panel`);
          switch (parsedUser.rol) {
            case 'admin':
              router.replace('/admin');
              break;
            case 'empleado':
              router.replace('/empleado-panel');
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

  return <ClientePanelContent />;
}
