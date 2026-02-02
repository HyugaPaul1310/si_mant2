// @ts-nocheck
import { actualizarEstadoReporteAsignado, actualizarReporteBackend, actualizarUsuarioBackend, asignarHerramientaAEmpleadoManualBackend, asignarReporteAEmpleadoBackend, cambiarRolUsuarioBackend, crearHerramientaBackend, crearTareaBackend, eliminarUsuarioBackend, marcarHerramientaComoDevueltaBackend, marcarHerramientaComoPerdidaBackend, obtenerArchivosReporteBackend, obtenerInventarioEmpleadoBackend, obtenerReportesBackend, obtenerTareasBackend, obtenerUsuariosBackend, registerBackend } from '@/lib/api-backend';
import { getProxyUrl } from '@/lib/cloudflare';
import { formatDateToLocal } from '@/lib/date-utils';
import { obtenerEmpresas, type Empresa } from '@/lib/empresas';
import { obtenerColorEstado, obtenerNombreEstado } from '@/lib/estado-mapeo';
import { obtenerTodasLasEncuestas } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Admin = {
  nombre?: string;
  email?: string;
};


function AdminPanelContent() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fontFamily = Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif';

  // SISTEMA DE TABS - Nueva estructura
  const [activeTab, setActiveTab] = useState<'inicio' | 'reportes' | 'encuestas' | 'tareas' | 'inventario' | 'usuarios'>('inicio');

  const [usuario, setUsuario] = useState<Admin | null>(null);
  // Contadores dinámicos basados en los reportes
  const [showLogout, setShowLogout] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newUserCompany, setNewUserCompany] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [passwordFieldKey, setPasswordFieldKey] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserBirth, setNewUserBirth] = useState('');
  const [newUserCity, setNewUserCity] = useState('');
  const [newUserState, setNewUserState] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [showEmpresaPicker, setShowEmpresaPicker] = useState(false);
  const [reportes, setReportes] = useState<any[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [errorReportes, setErrorReportes] = useState('');

  // PASO 6: Estados para reportes finalizados y cerrados
  const [reportesFinalizados, setReportesFinalizados] = useState<any[]>([]);
  const [reportesCerrados, setReportesCerrados] = useState<any[]>([]);
  const [loadingFinalizados, setLoadingFinalizados] = useState(false);
  const [loadingCerrados, setLoadingCerrados] = useState(false);
  const [showFinalizadosModal, setShowFinalizadosModal] = useState(false);
  const [showCerradosModal, setShowCerradosModal] = useState(false);
  const [selectedReporteDetail, setSelectedReporteDetail] = useState<any | null>(null);
  const [showReporteDetailModal, setShowReporteDetailModal] = useState(false);
  const [archivosReporte, setArchivosReporte] = useState<any[]>([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const [showArchivoModal, setShowArchivoModal] = useState(false);
  const [archivoVisualizando, setArchivoVisualizando] = useState<any | null>(null);
  const [showTareasModal, setShowTareasModal] = useState(false);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState<string>('');
  const [tareasDescripcion, setTareasDescripcion] = useState('');
  const [creandoTarea, setCreandoTarea] = useState(false);
  const [tareasError, setTareasError] = useState<string | null>(null);
  const [showEmpleadoDropdown, setShowEmpleadoDropdown] = useState(false);
  const [tareasExito, setTareasExito] = useState(false);
  const [showAsignarEmpleadoModal, setShowAsignarEmpleadoModal] = useState(false);
  const [reporteAAsignar, setReporteAAsignar] = useState<any>(null);
  const [selectedEmpleadoReporte, setSelectedEmpleadoReporte] = useState<string>('');
  const [showEmpleadoDropdownReporte, setShowEmpleadoDropdownReporte] = useState(false);
  const [asignandoReporte, setAsignandoReporte] = useState(false);
  const [asignarError, setAsignarError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [filtrosEstado, setFiltrosEstado] = useState<string[]>([]);
  const [filtrosPrioridad, setFiltrosPrioridad] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estados para historial y terminados
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showTerminadosModal, setShowTerminadosModal] = useState(false);

  // Estados para reportes finalizados por empleado (Fase 2 completada)
  const [showFinalizadosPorEmpleadoModal, setShowFinalizadosPorEmpleadoModal] = useState(false);
  const [reportesFinalizadosPorEmpleado, setReportesFinalizadosPorEmpleado] = useState<any[]>([]);
  const [loadingFinalizadosPorEmpleado, setLoadingFinalizadosPorEmpleado] = useState(false);
  const [errorFinalizadosPorEmpleado, setErrorFinalizadosPorEmpleado] = useState('');
  const [finalizadosCount, setFinalizadosCount] = useState(0);

  // Animación para botón actualizar
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loadingFinalizadosPorEmpleado) {
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
  }, [loadingFinalizadosPorEmpleado]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Estados para cotizaciones pendientes
  const [showCotizacionesModal, setShowCotizacionesModal] = useState(false);
  const [reportesCotizaciones, setReportesCotizaciones] = useState<any[]>([]);
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(false);
  const [errorCotizaciones, setErrorCotizaciones] = useState('');

  // Estados para modal de cotización (ingresar precio)
  const [showCotizarReporteModal, setShowCotizarReporteModal] = useState(false);
  const [reporteACotizar, setReporteACotizar] = useState<any | null>(null);
  const [precioCotizacion, setPrecioCotizacion] = useState('');
  const [cotizando, setCotizando] = useState(false);
  const [cotizarError, setCotizarError] = useState<string | null>(null);
  const [showConfirmarCotizacionModal, setShowConfirmarCotizacionModal] = useState(false);
  const [archivoCotizacion, setArchivoCotizacion] = useState<any | null>(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  // Estados para encuestas
  const [encuestas, setEncuestas] = useState<any[]>([]);
  const [loadingEncuestas, setLoadingEncuestas] = useState(false);
  const [errorEncuestas, setErrorEncuestas] = useState('');
  const [showEncuestasModal, setShowEncuestasModal] = useState(false);
  const [selectedEncuesta, setSelectedEncuesta] = useState<any | null>(null);
  const [showEncuestaDetailModal, setShowEncuestaDetailModal] = useState(false);

  // Estados para tareas historial
  const [tareas, setTareas] = useState<any[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [errorTareas, setErrorTareas] = useState('');
  const [showTareasHistorialModal, setShowTareasHistorialModal] = useState(false);

  // Estados para inventario
  const [empleadosInventario, setEmpleadosInventario] = useState<any[]>([]);
  const [loadingEmpleadosInventario, setLoadingEmpleadosInventario] = useState(false);
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [empleadoSelectedInventario, setEmpleadoSelectedInventario] = useState<any | null>(null);
  const [inventarioEmpleado, setInventarioEmpleado] = useState<any[]>([]);
  const [loadingInventarioEmpleado, setLoadingInventarioEmpleado] = useState(false);
  const [showAsignarHerramientaModal, setShowAsignarHerramientaModal] = useState(false);
  const [herramientaNombreInput, setHerramientaNombreInput] = useState('');
  const [cantidadHerramienta, setCantidadHerramienta] = useState('1');
  const [observacionesHerramienta, setObservacionesHerramienta] = useState('');
  const [asignandoHerramienta, setAsignandoHerramienta] = useState(false);
  const [errorAsignacion, setErrorAsignacion] = useState<string | null>(null);
  const [showInventarioEmpleadoDropdown, setShowInventarioEmpleadoDropdown] = useState(false);
  const [showCrearHerramientaModal, setShowCrearHerramientaModal] = useState(false);
  const [nuevaHerramientaNombre, setNuevaHerramientaNombre] = useState('');
  const [nuevaHerramientaDescripcion, setNuevaHerramientaDescripcion] = useState('');
  const [nuevaHerramientaCategoria, setNuevaHerramientaCategoria] = useState('');
  const [crearHerramientaLoading, setCrearHerramientaLoading] = useState(false);
  const [crearHerramientaError, setCrearHerramientaError] = useState<string | null>(null);

  const cotizacionesPendientesCount = useMemo(() => {
    return reportes.filter((r: any) =>
      r.estado === 'en_cotizacion' &&
      r.analisis_general &&
      r.analisis_general.trim() !== '' &&
      (!r.precio_cotizacion || r.precio_cotizacion === 0)
    ).length;
  }, [reportes]);

  // Estados para gestión de usuarios
  const [showGestionUsuariosModal, setShowGestionUsuariosModal] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [filtroCorreo, setFiltroCorreo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editCiudad, setEditCiudad] = useState('');
  const [editEmpresa, setEditEmpresa] = useState('');
  const [editRol, setEditRol] = useState<'cliente' | 'empleado' | 'admin'>('cliente');
  const [editEstado, setEditEstado] = useState<'activo' | 'inactivo'>('activo');
  const [showRolPicker, setShowRolPicker] = useState(false);
  const [showEstadoPicker, setShowEstadoPicker] = useState(false);
  const [showEmpresaPickerEdit, setShowEmpresaPickerEdit] = useState(false);
  const [actualizandoUsuario, setActualizandoUsuario] = useState(false);
  const [errorUsuario, setErrorUsuario] = useState<string | null>(null);
  const [exitoUsuario, setExitoUsuario] = useState(false);

  // Estados para confirmación de cierre de reporte
  const [showConfirmarCierreModal, setShowConfirmarCierreModal] = useState(false);
  const [reporteACerrar, setReporteACerrar] = useState<any | null>(null);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setNewUserPhone(digits);
  };

  const handleBirthChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (!digits) {
      setNewUserBirth('');
      return;
    }
    if (digits.length <= 4) {
      setNewUserBirth(digits);
      return;
    }
    if (digits.length <= 6) {
      setNewUserBirth(`${digits.slice(0, 4)}-${digits.slice(4)}`);
      return;
    }
    setNewUserBirth(`${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`);
  };

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          // Validación: solo admins pueden acceder a este panel
          if (parsedUser.rol !== 'admin') {
            console.warn(`[SEGURIDAD] Usuario ${parsedUser.email} con rol ${parsedUser.rol} intentó acceder a /admin. Redirigiendo...`);
            // Redirigir según su rol
            switch (parsedUser.rol) {
              case 'empleado':
                router.replace('/empleado-panel');
                break;
              default:
                router.replace('/cliente-panel');
            }
            return;
          }
          setUsuario(parsedUser);
        } else {
          router.replace('/');
        }
      } catch (error) {
        router.replace('/');
      }
    };
    obtenerUsuario();
    cargarEmpresas();
  }, [router]);

  const cargarEmpresas = async () => {
    const res = await obtenerEmpresas();
    if (res.success && res.data) {
      setEmpresas(res.data);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      setLoadingReportes(true);
      setErrorReportes('');
      const { success, data, error } = await obtenerReportesBackend();
      if (!success) setErrorReportes(error || 'No se pudieron cargar los reportes');
      else setReportes(data || []);
      setLoadingReportes(false);
    };
    cargar();
  }, []);

  // Recargar reportes cuando se abre el modal historial
  useEffect(() => {
    if (showHistorialModal) {
      const cargar = async () => {
        setLoadingReportes(true);
        setErrorReportes('');
        const { success, data, error } = await obtenerReportesBackend();
        if (!success) setErrorReportes(error || 'No se pudieron cargar los reportes');
        else setReportes(data || []);
        setLoadingReportes(false);
      };
      cargar();
    }
  }, [showHistorialModal]);

  // Auto-refresh counters (Cotizaciones Pendientes y Finalizados)
  useEffect(() => {
    const fetchCounts = async () => {
      const { success, data } = await obtenerReportesBackend();
      if (success && data) {
        // Actualizar lista principal para que cotizacionesPendientesCount se actualice solo
        setReportes(data);

        // Actualizar conteo de finalizados
        const finalizados = data.filter((r: any) =>
          r.estado === 'finalizado_por_tecnico' ||
          (r.estado === 'aceptado_por_cliente' && (r.revision || r.reparacion))
        );
        setFinalizadosCount(finalizados.length);

        // Si el modal de finalizados está abierto, actualizar su lista también
        if (showFinalizadosPorEmpleadoModal) {
          setReportesFinalizadosPorEmpleado(finalizados);
        }
      }
    };

    fetchCounts(); // Initial fetch
    const interval = setInterval(fetchCounts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [showFinalizadosPorEmpleadoModal]);

  // PASO 6: Cargar reportes finalizados por técnico
  useEffect(() => {
    const cargarFinalizados = async () => {
      setLoadingFinalizados(true);
      try {
        // Filtrar reportes con estado "finalizado_por_tecnico"
        const { success, data } = await obtenerReportesBackend();
        if (success && data) {
          const finalizados = data.filter((r: any) =>
            r.estado === 'finalizado_por_tecnico' ||
            (r.estado === 'aceptado_por_cliente' && (r.revision || r.reparacion))
          );
          setReportesFinalizados(finalizados);
        } else {
          setReportesFinalizados([]);
        }
      } catch (error) {
        console.error('Error cargando reportes finalizados:', error);
        setReportesFinalizados([]);
      } finally {
        setLoadingFinalizados(false);
      }
    };
    cargarFinalizados();
  }, []);

  // PASO 6: Cargar reportes cerrados por cliente
  useEffect(() => {
    const cargarCerrados = async () => {
      setLoadingCerrados(true);
      try {
        // Filtrar reportes con estado "cerrado_por_cliente"
        const { success, data } = await obtenerReportesBackend();
        if (success && data) {
          const cerrados = data.filter((r: any) => r.estado === 'cerrado_por_cliente');
          setReportesCerrados(cerrados);
        } else {
          setReportesCerrados([]);
        }
      } catch (error) {
        console.error('Error cargando reportes cerrados:', error);
        setReportesCerrados([]);
      } finally {
        setLoadingCerrados(false);
      }
    };
    cargarCerrados();
  }, []);

  // PASO 7: Cargar reportes con análisis completado (Cotizaciones Pendientes)
  useEffect(() => {
    if (showCotizacionesModal) {
      const cargarCotizaciones = async () => {
        setLoadingCotizaciones(true);
        setErrorCotizaciones('');
        try {
          console.log('[ADMIN-COTIZACIONES] Iniciando carga de cotizaciones pendientes...');
          // Recargar todos los reportes para asegurar que tenemos los últimos cambios
          const respuesta = await obtenerReportesBackend();
          console.log('[ADMIN-COTIZACIONES] Respuesta del backend:', respuesta);
          console.log('[ADMIN-COTIZACIONES] Total reportes obtenidos:', respuesta.data?.length);

          if (respuesta.success && respuesta.data) {
            console.log('[ADMIN-COTIZACIONES] Primeros 3 reportes recibidos:', respuesta.data.slice(0, 3).map((r: any) => ({
              id: r.id,
              titulo: r.titulo,
              estado: r.estado,
              analisis: r.analisis_general ? r.analisis_general.substring(0, 30) + '...' : 'SIN ANÁLISIS',
              precio: r.precio_cotizacion
            })));

            // Filtrar: estado = 'en_cotizacion' + analisis_general completo + sin precio_cotizacion
            const cotizacionesPendientes = respuesta.data.filter((r: any) => {
              const pasaEstado = r.estado === 'en_cotizacion';
              const pasaAnalisis = r.analisis_general && r.analisis_general.trim() !== '';
              const pasaPrecio = !r.precio_cotizacion || r.precio_cotizacion === 0;

              if (!pasaEstado) console.log(`[FILTRO] Reporte ${r.id}: falla estado (${r.estado})`);
              if (!pasaAnalisis) console.log(`[FILTRO] Reporte ${r.id}: falla análisis (${r.analisis_general})`);
              if (!pasaPrecio) console.log(`[FILTRO] Reporte ${r.id}: falla precio (${r.precio_cotizacion})`);

              return pasaEstado && pasaAnalisis && pasaPrecio;
            });

            console.log('[ADMIN-COTIZACIONES] Cotizaciones pendientes encontradas:', cotizacionesPendientes.length);
            console.log('[ADMIN-COTIZACIONES] Detalles:', cotizacionesPendientes.map((r: any) => ({
              id: r.id,
              titulo: r.titulo,
              estado: r.estado,
              analisis: r.analisis_general ? 'SÍ' : 'NO'
            })));
            setReportesCotizaciones(cotizacionesPendientes);
          } else {
            console.error('[ADMIN-COTIZACIONES] Error en respuesta:', respuesta);
            setReportesCotizaciones([]);
            setErrorCotizaciones(respuesta?.error || 'Error al cargar cotizaciones');
          }
        } catch (error) {
          console.error('Error cargando cotizaciones pendientes:', error);
          setReportesCotizaciones([]);
          setErrorCotizaciones('Error al cargar las cotizaciones');
        } finally {
          setLoadingCotizaciones(false);
        }
      };
      cargarCotizaciones();
    }
  }, [showCotizacionesModal]);

  // Cargar reportes finalizados por empleado (Fase 2 completada)
  useEffect(() => {
    if (showFinalizadosPorEmpleadoModal) {
      const cargarFinalizados = async () => {
        setLoadingFinalizadosPorEmpleado(true);
        setErrorFinalizadosPorEmpleado('');
        try {
          console.log('[ADMIN-FINALIZADOS] Iniciando carga de reportes finalizados por empleado...');
          const respuesta = await obtenerReportesBackend();
          console.log('[ADMIN-FINALIZADOS] Respuesta del backend:', respuesta);

          if (respuesta.success && respuesta.data) {
            // Filtrar: estado = 'finalizado_por_tecnico' (empleado completó Fase 2)
            // Filtrar: estado = 'finalizado_por_tecnico' O (estado = 'aceptado_por_cliente' Y tiene datos de Fase 2)
            const finalizadosPorEmpleado = respuesta.data.filter((r: any) =>
              r.estado === 'finalizado_por_tecnico' ||
              (r.estado === 'aceptado_por_cliente' && (r.revision || r.reparacion))
            );

            console.log('[ADMIN-FINALIZADOS] Reportes finalizados encontrados:', finalizadosPorEmpleado.length);
            setReportesFinalizadosPorEmpleado(finalizadosPorEmpleado);
          } else {
            console.error('[ADMIN-FINALIZADOS] Error en respuesta:', respuesta);
            setReportesFinalizadosPorEmpleado([]);
            setErrorFinalizadosPorEmpleado(respuesta?.error || 'Error al cargar reportes finalizados');
          }
        } catch (error) {
          console.error('Error cargando reportes finalizados por empleado:', error);
          setReportesFinalizadosPorEmpleado([]);
          setErrorFinalizadosPorEmpleado('Error al cargar los reportes');
        } finally {
          setLoadingFinalizadosPorEmpleado(false);
        }
      };
      cargarFinalizados();
    }
  }, [showFinalizadosPorEmpleadoModal]);

  const cargarEncuestasData = async () => {
    setLoadingEncuestas(true);
    setErrorEncuestas('');
    try {
      const resultado = await obtenerTodasLasEncuestas();
      if (resultado.success && resultado.data) {
        setEncuestas(resultado.data);
      } else {
        setErrorEncuestas(resultado.error || 'Error al cargar encuestas');
      }
    } catch (error: any) {
      console.error('Error cargando encuestas:', error);
      setErrorEncuestas(error.message || 'Error desconocido');
    } finally {
      setLoadingEncuestas(false);
    }
  };

  // Cargar encuestas al montar
  useEffect(() => {
    cargarEncuestasData();
  }, []);

  // Recargar encuestas al cambiar de pestaña
  useEffect(() => {
    if (activeTab === 'encuestas') {
      cargarEncuestasData();
    }
  }, [activeTab]);

  // Cargar empleados para inventario cuando se activa la tab
  useEffect(() => {
    if (activeTab === 'inventario') {
      cargarEmpleadosInventario();
    }
  }, [activeTab]);

  const cargarEmpleadosInventario = async () => {
    setLoadingEmpleadosInventario(true);
    try {
      const { success, data } = await obtenerUsuariosBackend();
      if (success && data) {
        // Filtramos solo empleados
        const emps = data.filter((u: any) => u.rol === 'empleado');
        setEmpleadosInventario(emps);
      }
    } catch (error) {
      console.error('Error cargando empleados para inventario:', error);
    } finally {
      setLoadingEmpleadosInventario(false);
    }
  };

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const { success, data } = await obtenerUsuariosBackend();
        if (success && data) {
          // Cargar lista completa de usuarios
          setUsuarios(data);
          // Filtrar solo empleados
          const empleadosFiltrados = data.filter((user: any) => user.rol === 'empleado');
          setEmpleados(empleadosFiltrados);
        } else {
          setUsuarios([]);
          setEmpleados([]);
        }
      } catch (error) {
        console.error('Error en cargarEmpleados:', error);
        setUsuarios([]);
        setEmpleados([]);
      }
    };
    cargarEmpleados();
  }, []);

  useEffect(() => {
    const cargarTareasData = async () => {
      setLoadingTareas(true);
      setErrorTareas('');
      const { success, data, error } = await obtenerTareasBackend();
      if (!success) setErrorTareas(error || 'No se pudieron cargar las tareas');
      else setTareas(data || []);
      setLoadingTareas(false);
    };
    cargarTareasData();
  }, []);

  useEffect(() => {
    const cargarInventario = async () => {
      setLoadingEmpleadosInventario(true);
      try {
        const { success, data } = await obtenerUsuariosBackend();
        if (success && data) {
          // Filtrar solo empleados
          const empleadosFiltrados = data.filter((user: any) => user.rol === 'empleado');
          setEmpleadosInventario(empleadosFiltrados);
        } else {
          setEmpleadosInventario([]);
        }
      } catch (error) {
        console.error('Error cargando empleados inventario:', error);
        setEmpleadosInventario([]);
      }
      setLoadingEmpleadosInventario(false);
    };
    cargarInventario();
  }, []);

  const hoy = useMemo(() => new Date(), []);
  // Reportes pedidos = reportes en historial (no terminados)
  const reportesPedidos = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() !== 'terminado').length,
    [reportes]
  );
  // Pendientes específicamente
  const reportesPendiente = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'pendiente').length,
    [reportes]
  );
  // En proceso
  const reportesEnProceso = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'en_proceso').length,
    [reportes]
  );
  // En espera
  const reportesEnEspera = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'en espera').length,
    [reportes]
  );
  const reportesTerminadosCount = useMemo(
    () => reportes.filter((r) => {
      const st = (r.estado || '').toLowerCase();
      return st === 'terminado' || st === 'rechazado' || st === 'cerrado';
    }).length,
    [reportes]
  );
  // Por Revisar (contador) - reportes finalizados por técnico
  const reportesPorRevisarCount = useMemo(
    () => reportes.filter((r) =>
      r.estado === 'finalizado_por_tecnico' ||
      (r.estado === 'aceptado_por_cliente' && (r.revision || r.reparacion))
    ).length,
    [reportes]
  );

  const initials = useMemo(() => {
    const nombre = usuario?.nombre?.trim();
    if (!nombre) return 'AD';
    return nombre
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }, [usuario?.nombre]);

  const estadosDisponibles: { value: EstadoReporte; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En proceso' },
    { value: 'en espera', label: 'En espera' },
    { value: 'terminado', label: 'Terminado' },
  ];

  const reportesPendientes = useMemo(
    () => reportes.filter((r) => {
      const st = (r.estado || '').toLowerCase();
      return st !== 'terminado' && st !== 'rechazado' && st !== 'cerrado';
    }),
    [reportes]
  );

  const reportesTerminados = useMemo(
    () => reportes.filter((r) => {
      const st = (r.estado || '').toLowerCase();
      return st === 'terminado' || st === 'rechazado' || st === 'cerrado';
    }),
    [reportes]
  );

  const reportesFiltrados = useMemo(() => {
    let filtrados = reportesPendientes;

    // Filtrar por estado
    if (filtrosEstado.length > 0) {
      filtrados = filtrados.filter((r) => {
        const estado = (r.estado || '').toLowerCase();
        return filtrosEstado.some(f => {
          if (f === 'en_proceso') return estado === 'en_proceso';
          if (f === 'en espera') return estado === 'en espera';
          return estado === f;
        });
      });
    }

    // Filtrar por prioridad
    if (filtrosPrioridad.length > 0) {
      filtrados = filtrados.filter((r) => {
        const prioridad = (r.prioridad || 'media').toLowerCase();
        return filtrosPrioridad.includes(prioridad);
      });
    }

    return filtrados;
  }, [reportesPendientes, filtrosEstado, filtrosPrioridad]);

  const toggleFiltroEstado = (estado: string) => {
    setFiltrosEstado(prev =>
      prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]
    );
  };

  const toggleFiltroPrioridad = (prioridad: string) => {
    setFiltrosPrioridad(prev =>
      prev.includes(prioridad) ? prev.filter(p => p !== prioridad) : [...prev, prioridad]
    );
  };

  const limpiarFiltros = () => {
    setFiltrosEstado([]);
    setFiltrosPrioridad([]);
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoReporte) => {
    setUpdatingId(id);
    const { success, error } = await actualizarReporteBackend(id, { estado: nuevoEstado });
    if (!success) {
      setErrorReportes(error || 'No se pudo actualizar el estado');
    } else {
      setReportes((prev) => prev.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r)));
    }
    setUpdatingId(null);
  };

  const seleccionarArchivoPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('[PDF-COTIZACION] Archivo seleccionado:', file);
        setArchivoCotizacion(file);
        setCotizarError(null);
      }
    } catch (error) {
      console.error('Error al seleccionar archivo PDF:', error);
      setCotizarError('Error al seleccionar el archivo');
    }
  };


  const handleCotizarReporte = async () => {
    if (!reporteACotizar) return;
    if (!precioCotizacion.trim()) {
      setCotizarError('Por favor ingresa el precio');
      return;
    }

    const precioNumerico = parseFloat(precioCotizacion);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      setCotizarError('Por favor ingresa un precio válido');
      return;
    }

    // Si aún no se ha mostrado el modal de confirmación, mostrarlo
    if (!showConfirmarCotizacionModal) {
      setShowConfirmarCotizacionModal(true);
      return;
    }

    setCotizando(true);
    setCotizarError(null);
    setShowConfirmarCotizacionModal(false); // Cerrar el modal de confirmación antes de la llamada
    try {
      const { success, error } = await actualizarReporteBackend(reporteACotizar.id, {
        estado: 'en_espera_confirmacion',
        precioCotizacion: precioNumerico,
      });

      if (!success) {
        setCotizarError(error || 'No se pudo cotizar el reporte');
      } else {
        // Actualizar lista de cotizaciones
        setReportesCotizaciones((prev) =>
          prev.filter((r) => r.id !== reporteACotizar.id)
        );

        // Cerrar modal
        setShowCotizarReporteModal(false);
        setReporteACotizar(null);
        setPrecioCotizacion('');
        setArchivoCotizacion(null);
      }
    } catch (error) {
      console.error('Error al cotizar reporte:', error);
      setCotizarError('Error al cotizar el reporte');
    } finally {
      setCotizando(false);
    }
  };

  // Mostrar el nombre del usuario junto a "Bienvenido"

  const stats = [
    {
      label: 'Reportes pedidos',
      value: reportesPedidos,
      iconBg: '#3b82f6',
      iconName: 'notifications-outline',
      accent: '#60a5fa',
    },
    {
      label: 'Pendientes',
      value: reportesPendiente,
      iconBg: '#f59e0b',
      iconName: 'time-outline',
      accent: '#fbbf24',
    },
    {
      label: 'En proceso',
      value: reportesEnProceso,
      iconBg: '#3b82f6',
      iconName: 'hourglass-outline',
      accent: '#93c5fd',
    },
    {
      label: 'En espera',
      value: reportesEnEspera,
      iconBg: '#eab308',
      iconName: 'pause-circle-outline',
      accent: '#facc15',
    },
    {
      label: 'Terminados',
      value: reportesTerminadosCount,
      iconBg: '#10b981',
      iconName: 'checkmark-circle-outline',
      accent: '#34d399',
    },
    {
      label: 'Por Revisar',
      value: reportesPorRevisarCount,
      iconBg: '#8b5cf6',
      iconName: 'checkbox-outline',
      accent: '#a78bfa',
    },
  ];

  const mainOptions = useMemo(() => [
    {
      title: 'Historial de Reportes',
      description: 'Ver seguimiento de reportes',
      gradient: ['#2563eb', '#3b82f6'] as const,
      iconName: 'document-text-outline',
    },
    {
      title: 'Reportes Finalizados (Empleado)',
      description: 'Revisar trabajos completados por técnicos',
      gradient: ['#ec4899', '#f472b6'] as const,
      iconName: 'checkbox-outline',
      badge: finalizadosCount, // Badge dinámico
    },
    {
      title: 'Cotizaciones Pendientes',
      description: 'Cotizar reportes con análisis completado',
      gradient: ['#f59e0b', '#f97316'] as const,
      iconName: 'pricetag-outline',
      badge: cotizacionesPendientesCount,
    },
    {
      title: 'Reportes Terminados',
      description: 'Ver reportes terminados',
      gradient: ['#7c3aed', '#8b5cf6'] as const,
      iconName: 'checkmark-circle-outline',
    },
    {
      title: 'Gestion de Usuarios',
      description: 'Administrar permisos de usuarios',
      gradient: ['#06b6d4', '#0ea5e9'] as const,
      iconName: 'people-outline',
    },
    {
      title: 'Gestion de Empresas',
      description: 'Administrar empresas y sucursales',
      gradient: ['#7c3aed', '#8b5cf6'] as const,
      iconName: 'business-outline',
    },
    {
      title: 'Generar Tareas',
      description: 'Crear nuevas tareas para el equipo',
      gradient: ['#ea580c', '#f97316'] as const,
      iconName: 'create-outline',
    },
    {
      title: 'Generar Correo Electrónico',
      description: 'Redactar y enviar correos',
      gradient: ['#7c3aed', '#8b5cf6'] as const,
      iconName: 'mail-outline',
    },
    {
      title: 'Historial de Tareas',
      description: 'Ver historial de tareas asignadas',
      gradient: ['#3b82f6', '#2563eb'] as const,
      iconName: 'list-outline',
    },
  ], [finalizadosCount, cotizacionesPendientesCount]);

  const estadoBadgeStyle = (estado: string) => {
    const color = obtenerColorEstado(estado);
    return {
      bg: `${color}20`,
      border: `${color}40`,
      text: color
    };
  };

  const estadoBotonStyle = (active: boolean) =>
    active
      ? { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)', text: '#bbf7d0' }
      : { bg: '#334155', border: '#475569', text: '#e2e8f0' };

  const estadoDisplay = (estado?: string) => {
    return obtenerNombreEstado(estado || '');
  };

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    const resultado = await obtenerUsuariosBackend();
    if (resultado.success && resultado.data) {
      setUsuarios(resultado.data);
    }
    setLoadingUsuarios(false);
  };

  const handleEditarUsuario = (user: any) => {
    setUsuarioEditando(user);
    setEditNombre(user.nombre || '');
    setEditApellido(user.apellido || '');
    setEditEmail(user.email || '');
    setEditTelefono(user.telefono || '');
    setEditCiudad(user.ciudad || '');
    setEditEmpresa(user.empresa || '');
    setEditRol(user.rol || 'cliente');
    setEditEstado(user.estado || 'activo');
    setErrorUsuario(null);
    setExitoUsuario(false);
    setShowEditUserModal(true);
  };

  const handleActualizarUsuario = async () => {
    if (!usuarioEditando) return;

    setActualizandoUsuario(true);
    setErrorUsuario(null);
    setExitoUsuario(false);

    // Actualizar datos del usuario
    const resultadoDatos = await actualizarUsuarioBackend(usuarioEditando.id, {
      nombre: editNombre,
      apellido: editApellido,
      email: editEmail,
      telefono: editTelefono,
      ciudad: editCiudad,
      empresa: editEmpresa,
    });

    if (!resultadoDatos.success) {
      setErrorUsuario(resultadoDatos.error || 'Error al actualizar datos');
      setActualizandoUsuario(false);
      return;
    }

    // Actualizar rol si cambió
    if (editRol !== usuarioEditando.rol) {
      const resultadoRol = await cambiarRolUsuarioBackend(usuarioEditando.id, editRol);
      if (!resultadoRol.success) {
        setErrorUsuario(resultadoRol.error || 'Error al actualizar rol');
        setActualizandoUsuario(false);
        return;
      }
    }

    // Actualizar estado si cambió
    if (editEstado !== usuarioEditando.estado) {
      if (editEstado === 'inactivo') {
        const resultadoEstado = await eliminarUsuarioBackend(usuarioEditando.id);
        if (!resultadoEstado.success) {
          setErrorUsuario(resultadoEstado.error || 'Error al actualizar estado');
          setActualizandoUsuario(false);
          return;
        }
      }
    }

    setActualizandoUsuario(false);
    setExitoUsuario(true);
    setTimeout(() => {
      setShowEditUserModal(false);
      setExitoUsuario(false);
      cargarUsuarios(); // Recargar lista
    }, 1500);
  };

  const handleEliminarUsuario = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente este usuario? Esta acción no se puede deshacer.')) return;

    const resultado = await eliminarUsuarioBackend(userId);
    if (resultado.success) {
      cargarUsuarios(); // Recargar lista
    }
  };

  const openEmailModalIfOption = (title: string) => {
    if (title === 'Historial de Reportes') {
      setShowHistorialModal(true);
    } else if (title === 'Cotizaciones Pendientes') {
      setShowCotizacionesModal(true);
    } else if (title === 'Reportes Terminados') {
      setShowTerminadosModal(true);
    } else if (title === 'Gestion de Usuarios') {
      cargarUsuarios();
      setShowGestionUsuariosModal(true);
    } else if (title === 'Gestion de Empresas') {
      router.push('/gestion-empresas');
    } else if (title === 'Generar Tareas') {
      setSelectedEmpleado('');
      setTareasDescripcion('');
      setTareasError(null);
      setShowTareasModal(true);
    } else if (title === 'Generar Correo Electrónico') {
      // Reset all fields each time modal opens
      setNewUserCompany('');
      setNewUserName('');
      setNewUserLastName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserPhone('');
      setNewUserBirth('');
      setNewUserCity('');
      setNewUserCity('');
      setNewUserState('');
      setShowStatePicker(false);
      setShowNewPassword(false);
      setCreateError(null);
      setPasswordFieldKey((k) => k + 1);
      setShowEmailModal(true);
    } else if (title === 'Reportes Finalizados (Empleado)') {
      setShowFinalizadosPorEmpleadoModal(true);
    } else if (title === 'Historial de Tareas') {
      setShowTareasHistorialModal(true);
    }
  };

  const handleCrearTarea = async () => {
    if (!selectedEmpleado || !tareasDescripcion.trim()) {
      setTareasError('Por favor completa todos los campos');
      return;
    }

    setCreandoTarea(true);
    setTareasError(null);

    try {
      const empleadoData = empleados.find(e => e.email === selectedEmpleado);

      // Obtener ID del empleado
      const [empleado] = await Promise.all([
        obtenerUsuariosBackend()
      ]);

      let empleadoId = null;
      if (empleado.success && empleado.data) {
        const emp = empleado.data.find((e: any) => e.email === selectedEmpleado);
        empleadoId = emp?.id;
      }

      const result = await crearTareaBackend({
        titulo: 'Tarea del administrador',
        descripcion: tareasDescripcion.trim(),
        usuario_id: empleadoId,
        admin_email: usuario?.email || '',
        admin_nombre: usuario?.nombre || '',
        empleado_email: selectedEmpleado,
      });

      if (result.success) {
        setTareasExito(true);
        // Recargar tareas
        const tareasActualizadas = await obtenerTareasBackend();
        if (tareasActualizadas.success) {
          setTareas(tareasActualizadas.data || []);
        }

        setTimeout(() => {
          setShowTareasModal(false);
          setSelectedEmpleado('');
          setTareasDescripcion('');
          setTareasExito(false);
        }, 1500);
      } else {
        setTareasError(result.error || 'Error al crear la tarea');
      }
    } catch (error) {
      console.error('Error en handleCrearTarea:', error);
      setTareasError('Error al crear la tarea. Intenta de nuevo.');
    } finally {
      setCreandoTarea(false);
    }
  };

  const handleAsignarReporte = async () => {
    console.log('[ADMIN] handleAsignarReporte - selectedEmpleadoReporte:', selectedEmpleadoReporte);
    console.log('[ADMIN] handleAsignarReporte - reporteAAsignar:', reporteAAsignar?.id);

    // Validar que selectedEmpleadoReporte no esté vacío y que reporteAAsignar tenga un id válido (puede ser 0)
    if (!selectedEmpleadoReporte || reporteAAsignar?.id === null || reporteAAsignar?.id === undefined) {
      console.error('[ADMIN] Error: selectedEmpleadoReporte es vacío o reporteAAsignar sin id');
      setAsignarError('Por favor selecciona un empleado');
      return;
    }

    setAsignandoReporte(true);
    setAsignarError(null);

    try {
      // Obtener ID del empleado
      console.log('[ADMIN] Obteniendo usuarios...');
      const usuariosResult = await obtenerUsuariosBackend();
      console.log('[ADMIN] usuariosResult:', usuariosResult);
      let empleadoId = null;
      if (usuariosResult.success && usuariosResult.data) {
        const emp = usuariosResult.data.find((e: any) => e.email === selectedEmpleadoReporte);
        console.log('[ADMIN] Empleado encontrado:', emp);
        empleadoId = emp?.id;
      }

      if (!empleadoId) {
        console.error('[ADMIN] Empleado no encontrado para:', selectedEmpleadoReporte);
        setAsignarError('Empleado no encontrado');
        setAsignandoReporte(false);
        return;
      }

      console.log('[ADMIN] Asignando reporte', reporteAAsignar.id, 'a empleado', empleadoId);
      const result = await asignarReporteAEmpleadoBackend(reporteAAsignar.id, empleadoId);
      console.log('[ADMIN] Resultado de asignación:', result);

      if (result.success) {
        console.log('[ADMIN] ✓ Reporte asignado exitosamente');

        // AUTOMATIZACIÓN: Cambiar el estado del reporte a 'asignado'
        console.log('[ADMIN] Automatizando cambio de estado a "asignado" para reporte:', reporteAAsignar.id);
        const updateStatusResult = await actualizarEstadoReporteAsignado(
          reporteAAsignar.id,
          'asignado'
        );

        if (updateStatusResult.success) {
          console.log('[ADMIN] ✓ Estado del reporte actualizado a "asignado"');
        } else {
          console.warn('[ADMIN] ⚠️ No se pudo actualizar el estado a "asignado":', updateStatusResult.error);
        }

        // Actualizar la lista de reportes
        const reportesActualizados = await obtenerReportesBackend();
        if (reportesActualizados.success) {
          setReportes(reportesActualizados.data || []);
        }

        // Cerrar ambos modales para volver al panel principal
        setShowAsignarEmpleadoModal(false);
        setShowHistorialModal(false);
        setReporteAAsignar(null);
        setSelectedEmpleadoReporte('');
      } else {
        console.error('[ADMIN] Error en asignación:', result.error);
        setAsignarError(result.error || 'Error al asignar reporte');
      }
    } catch (error) {
      console.error('Error en handleAsignarReporte:', error);
      setAsignarError('Error al asignar reporte. Intenta de nuevo.');
    } finally {
      setAsignandoReporte(false);
    }
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/');
  };

  const handleLogout = () => {
    setShowLogout(true);
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
                <Text style={[styles.welcomeSubtitle, { fontFamily }]}>Panel de Administrador</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowStats(!showStats)} style={styles.toggleButton} activeOpacity={0.8}>
                <Ionicons name={showStats ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* SISTEMA DE TABS - NAVEGACIÓN */}
          <View style={[styles.tabsNavigationContainer, isMobile && styles.tabsNavigationContainerMobile]}>
            {[
              { id: 'inicio', label: 'Inicio', icon: 'home-outline' },
              { id: 'encuestas', label: 'Encuestas', icon: 'clipboard-outline' },
              { id: 'inventario', label: 'Inventario', icon: 'cube-outline' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  isMobile && styles.tabButtonMobile,
                  activeTab === tab.id && styles.tabButtonActive,
                  isMobile && activeTab === tab.id && styles.tabButtonActiveMobile
                ]}
                onPress={() => setActiveTab(tab.id as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={isMobile ? 18 : 20}
                  color={activeTab === tab.id ? '#06b6d4' : '#64748b'}
                />
                {!isMobile && (
                  <Text style={[
                    styles.tabButtonText,
                    { fontFamily },
                    activeTab === tab.id && styles.tabButtonTextActive
                  ]}>
                    {tab.label}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* CONTENIDO DE LAS TABS */}
          {activeTab === 'inicio' && (
            <View style={styles.tabContent}>

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
                <Text style={[styles.sectionSubtitle, { fontFamily }]}>Accede a las herramientas del sistema</Text>
              </View>

              <View style={[styles.optionsGrid, isMobile && styles.optionsGridMobile]}>
                {mainOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    style={[styles.optionTouchable, isMobile && styles.optionTouchableMobile]}
                    onPress={() => openEmailModalIfOption(option.title)}
                  >
                    <LinearGradient
                      colors={option.gradient}
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

                      {/* Badge de Notificación para Cotizaciones Pendientes */}
                      {/* Badge de Notificación Genérico */}
                      {!!option.badge && option.badge > 0 && (
                        <View style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: '#ef4444',
                          minWidth: 26,
                          height: 26,
                          borderRadius: 13,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 6,
                          borderWidth: 3,
                          borderColor: '#0b1220', // Combina con el fondo del panel oscuro
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.4,
                          shadowRadius: 4,
                          elevation: 8,
                          zIndex: 10
                        }}>
                          <Text style={[{ color: '#fff', fontSize: 12, fontWeight: '900' }, { fontFamily }]}>
                            {option.badge}
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}


          {/* TAB 3: ENCUESTAS */}
          {activeTab === 'encuestas' && (
            <View style={styles.tabContent}>
              <View style={[styles.sectionHeader, isMobile && styles.sectionHeaderMobile]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile, { fontFamily }]}>Encuestas</Text>
                  <Text style={[styles.sectionSubtitle, { fontFamily }]}>Estadísticas de satisfacción</Text>
                </View>
                <TouchableOpacity
                  onPress={cargarEncuestasData}
                  style={{
                    backgroundColor: '#1e293b',
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#334155'
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={20} color="#22d3ee" />
                </TouchableOpacity>
              </View>

              {loadingEncuestas && (
                <View style={styles.infoBox}>
                  <Text style={[styles.infoText, { fontFamily }]}>Cargando encuestas...</Text>
                </View>
              )}

              {!loadingEncuestas && errorEncuestas ? (
                <View style={styles.errorPanel}>
                  <Text style={[styles.errorPanelText, { fontFamily }]}>{errorEncuestas}</Text>
                </View>
              ) : null}

              {!loadingEncuestas && !errorEncuestas && encuestas.length === 0 ? (
                <View style={styles.noResultadosContainer}>
                  <Ionicons name="clipboard-outline" size={48} color="#475569" />
                  <Text style={[styles.noResultadosTitle, { fontFamily }]}>
                    No hay encuestas registradas
                  </Text>
                  <Text style={[styles.noResultadosText, { fontFamily }]}>
                    No hay encuestas de satisfacción en este momento.
                  </Text>
                </View>
              ) : null}

              {!loadingEncuestas && !errorEncuestas && encuestas.length > 0 ? (
                <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                  <View style={styles.listSpacing}>
                    {encuestas.map((encuesta: any) => (
                      <TouchableOpacity
                        key={encuesta.id}
                        style={styles.reportCard}
                        onPress={() => {
                          setSelectedEncuesta(encuesta);
                          setShowEncuestaDetailModal(true);
                        }}
                      >
                        {/* En Web: Mostrar todo, En Mobile: Solo lo esencial */}
                        {!isMobile ? (
                          <>
                            <View style={[styles.reportHeader, isMobile && styles.reportHeaderMobile]}>
                              <View style={styles.reportHeaderText}>
                                <Text style={[styles.reportTitle, isMobile && styles.reportTitleMobile, { fontFamily }]} numberOfLines={1}>
                                  {encuesta.reporte_titulo || encuesta.titulo || 'Encuesta de Satisfacción'}
                                </Text>
                                <Text style={[styles.reportSubtitle, isMobile && styles.reportSubtitleMobile, { fontFamily }]} numberOfLines={1}>
                                  {encuesta.cliente_email || 'Sin cliente'} · {encuesta.empresa || 'Sin empresa'}
                                </Text>
                                <Text style={[styles.reportMeta, isMobile && styles.reportMetaMobile, { fontFamily }]} numberOfLines={1}>
                                  Calificación: {encuesta.satisfaccion || 'N/A'} / 5
                                </Text>
                              </View>
                              <View style={[styles.reportActions, isMobile && styles.reportActionsMobile]}>
                                <TouchableOpacity
                                  onPress={() => {
                                    setSelectedEncuesta(encuesta);
                                    setShowEncuestaDetailModal(true);
                                  }}
                                  style={styles.eyeCard}
                                >
                                  <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View style={{ marginTop: 12, gap: 8 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="person-outline" size={14} color="#94a3b8" />
                                <Text style={[{ color: '#cbd5e1', fontSize: 12 }, { fontFamily }]}>
                                  Realizado por: {encuesta.empleado_nombre || 'Sin nombre'}
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="business-outline" size={14} color="#94a3b8" />
                                <Text style={[{ color: '#cbd5e1', fontSize: 12 }, { fontFamily }]}>
                                  Empresa: {encuesta.empresa || 'Sin empresa'}
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                <Text style={[{ color: '#cbd5e1', fontSize: 12 }, { fontFamily }]}>
                                  {formatDateToLocal(encuesta.created_at)}
                                </Text>
                              </View>
                            </View>
                          </>
                        ) : (
                          <>
                            {/* Vista Mobile: Solo lo esencial */}
                            <View style={{ gap: 10 }}>
                              <View style={{ gap: 6 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <Ionicons name="business-outline" size={16} color="#06b6d4" />
                                  <Text style={[{ color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 }, { fontFamily }]} numberOfLines={1}>
                                    {encuesta.empresa || 'Sin empresa'}
                                  </Text>
                                </View>
                              </View>

                              <View style={{ gap: 4, paddingLeft: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <Ionicons name="person-outline" size={14} color="#94a3b8" />
                                  <Text style={[{ color: '#cbd5e1', fontSize: 11 }, { fontFamily }]} numberOfLines={1}>
                                    Realizó: {encuesta.empleado_nombre || 'Sin nombre'}
                                  </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <Ionicons name="person-circle-outline" size={14} color="#94a3b8" />
                                  <Text style={[{ color: '#cbd5e1', fontSize: 11 }, { fontFamily }]} numberOfLines={1}>
                                    Cliente: {encuesta.cliente_nombre || 'Sin nombre'}
                                  </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                  <Text style={[{ color: '#cbd5e1', fontSize: 11 }, { fontFamily }]}>
                                    {formatDateToLocal(encuesta.created_at)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              ) : null}
            </View>
          )}


          {/* TAB 5: INVENTARIO */}
          {activeTab === 'inventario' && (
            <View style={styles.tabContent}>
              <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                <View style={[styles.listSpacing, { paddingTop: 0 }]}>
                  <View style={[styles.sectionHeader, isMobile && styles.sectionHeaderMobile, { marginBottom: 24 }]}>
                    <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile, { fontFamily }]}>Inventario</Text>
                    <Text style={[styles.sectionSubtitle, { fontFamily }]}>Gestión de herramientas asignadas</Text>
                  </View>

                  {/* BOTONES DE ACCIÓN DE INVENTARIO */}
                  <View style={{ gap: 12, marginBottom: 24 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowCrearHerramientaModal(true);
                      }}
                      style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        borderWidth: 1,
                        borderColor: '#8b5cf6',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={24} color="#8b5cf6" />
                      <View style={{ flex: 1 }}>
                        <Text style={[{ color: '#fff', fontSize: 16, fontWeight: '700' }, { fontFamily }]}>Crear Nueva Herramienta</Text>
                        <Text style={[{ color: '#d8b4fe', fontSize: 12, marginTop: 2 }, { fontFamily }]}>Agregar herramienta al inventario</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        if (empleadosInventario.length === 0) {
                          alert('No hay empleados disponibles para asignar herramientas');
                          return;
                        }
                        if (empleadosInventario.length === 1) {
                          setEmpleadoSelectedInventario(empleadosInventario[0]);
                          setShowAsignarHerramientaModal(true);
                        } else {
                          // Si hay múltiples empleados, mostrar lista de selección
                          alert('Por favor selecciona un empleado primero desde la lista inferior');
                        }
                      }}
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        borderWidth: 1,
                        borderColor: '#22c55e',
                        borderRadius: 12,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12
                      }}
                    >
                      <Ionicons name="link-outline" size={24} color="#22c55e" />
                      <View style={{ flex: 1 }}>
                        <Text style={[{ color: '#fff', fontSize: 16, fontWeight: '700' }, { fontFamily }]}>Asignar Herramienta</Text>
                        <Text style={[{ color: '#86efac', fontSize: 12, marginTop: 2 }, { fontFamily }]}>Asignar herramienta a empleado</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {loadingEmpleadosInventario ? (
                    <View style={styles.infoBox}>
                      <Text style={[styles.infoText, { fontFamily }]}>Cargando inventario...</Text>
                    </View>
                  ) : empleadosInventario.length === 0 ? (
                    <View style={styles.noResultadosContainer}>
                      <Ionicons name="cube-outline" size={64} color="#334155" />
                      <Text style={[styles.noResultadosTitle, { fontFamily, marginTop: 16 }]}>No hay inventario asignado</Text>
                      <Text style={[styles.noResultadosText, { fontFamily }]}>Aún no hay herramientas asignadas a empleados</Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={[{ color: '#cbd5e1', fontSize: 12, fontWeight: '600', marginBottom: 12 }, { fontFamily }]}>
                        {empleadosInventario.length} {empleadosInventario.length === 1 ? 'empleado' : 'empleados'} con herramientas
                      </Text>
                      {empleadosInventario.map((empleado: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={{
                            backgroundColor: '#1e293b',
                            borderColor: '#334155',
                            borderWidth: 1,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          onPress={async () => {
                            setEmpleadoSelectedInventario(empleado);
                            setLoadingInventarioEmpleado(true);
                            const { success, data } = await obtenerInventarioEmpleadoBackend(empleado.id);
                            if (success) {
                              setInventarioEmpleado(data || []);
                            }
                            setLoadingInventarioEmpleado(false);
                            setShowInventarioModal(true);
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[{ color: '#f0f9ff', fontWeight: '600', fontSize: 16 }, { fontFamily }]} numberOfLines={1}>
                              {empleado.nombre}
                            </Text>
                            <Text style={[{ color: '#94a3b8', fontSize: 13, marginTop: 4 }, { fontFamily }]}>
                              {empleado.email}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: '#06b6d4',
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: 12,
                            }}
                          >
                            <Ionicons name="eye-outline" size={20} color="white" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}


        </View>
      </ScrollView>

      {/* Todos los modales y overlays van aquí */}

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

      {showEmailModal && (
        <View style={styles.overlay}>
          <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(139, 92, 246, 0.2)', borderColor: 'rgba(139, 92, 246, 0.5)' }]}>
                <Ionicons name="mail-outline" size={22} color="#a78bfa" />
              </View>
              <Text style={[styles.modalTitle, { fontFamily }]}>Generar cuenta</Text>
            </View>

            {createError ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, { fontFamily }]}>{createError}</Text>
              </View>
            ) : null}
            <ScrollView
              style={styles.modalFormScroll}
              contentContainerStyle={styles.modalFormContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Empresa</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="business-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TouchableOpacity
                    style={styles.selectInputPro}
                    onPress={() => setShowEmpresaPicker(!showEmpresaPicker)}
                    disabled={creatingUser}
                  >
                    <Text style={[styles.selectInputText, { fontFamily, color: empresaSeleccionada ? '#e5e7eb' : '#64748b' }]}>
                      {empresaSeleccionada?.nombre || 'Selecciona empresa'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
                {showEmpresaPicker && (
                  <ScrollView style={styles.selectDropdown} scrollEnabled={true} nestedScrollEnabled={true}>
                    {empresas.length === 0 ? (
                      <View style={styles.selectItem}>
                        <Text style={[styles.selectItemText, { fontFamily, color: '#94a3b8' }]}>No hay empresas</Text>
                      </View>
                    ) : (
                      empresas.map((emp) => (
                        <TouchableOpacity
                          key={emp.id}
                          style={[
                            styles.selectItem,
                            empresaSeleccionada?.id === emp.id && { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderLeftWidth: 3, borderLeftColor: '#2563eb' }
                          ]}
                          onPress={() => {
                            setEmpresaSeleccionada(emp);
                            setNewUserCompany(emp.nombre);
                            setShowEmpresaPicker(false);
                          }}
                        >
                          <Text style={[styles.selectItemText, empresaSeleccionada?.id === emp.id && styles.selectItemTextHighlight, { fontFamily }]}>{emp.nombre}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Nombre</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.formInputPro, { fontFamily }]}
                    value={newUserName}
                    onChangeText={setNewUserName}
                    placeholder="Nombre completo"
                    placeholderTextColor="#6b7280"
                    editable={!creatingUser}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Apellido</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.formInputPro, { fontFamily }]}
                    value={newUserLastName}
                    onChangeText={setNewUserLastName}
                    placeholder="Apellido"
                    placeholderTextColor="#6b7280"
                    editable={!creatingUser}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Correo electrónico</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.formInputPro, { fontFamily }]}
                    value={newUserEmail}
                    onChangeText={setNewUserEmail}
                    placeholder="usuario@correo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    placeholderTextColor="#6b7280"
                    editable={!creatingUser}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Teléfono</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.formInputPro, { fontFamily }]}
                    value={newUserPhone}
                    onChangeText={handlePhoneChange}
                    placeholder="1234567890"
                    keyboardType="phone-pad"
                    placeholderTextColor="#6b7280"
                    editable={!creatingUser}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Fecha de nacimiento (opcional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.formInputPro, { fontFamily }]}
                    value={newUserBirth}
                    onChangeText={handleBirthChange}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6b7280"
                    editable={!creatingUser}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Ciudad (opcional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.formInputPro, { fontFamily }]}
                    value={newUserCity}
                    onChangeText={setNewUserCity}
                    placeholder="Ciudad"
                    placeholderTextColor="#6b7280"
                    editable={!creatingUser}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Estado (Opcional)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="map-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TouchableOpacity
                    style={styles.selectInputPro}
                    onPress={() => setShowStatePicker(!showStatePicker)}
                    disabled={creatingUser}
                  >
                    <Text style={[styles.selectInputText, { fontFamily, color: newUserState ? '#e5e7eb' : '#64748b' }]}>
                      {newUserState || 'Selecciona estado'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
                {showStatePicker && (
                  <ScrollView style={styles.selectDropdown} scrollEnabled={true} nestedScrollEnabled={true}>
                    {['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'].map((estado) => (
                      <TouchableOpacity
                        key={estado}
                        style={[
                          styles.selectItem,
                          newUserState === estado && { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderLeftWidth: 3, borderLeftColor: '#2563eb' }
                        ]}
                        onPress={() => {
                          setNewUserState(estado);
                          setShowStatePicker(false);
                        }}
                      >
                        <Text style={[styles.selectItemText, newUserState === estado && styles.selectItemTextHighlight, { fontFamily }]}>
                          {estado}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    key={`pwd-${passwordFieldKey}`}
                    style={[styles.formInputPro, { fontFamily }]}
                    value={newUserPassword}
                    onChangeText={setNewUserPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showNewPassword}
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    placeholderTextColor="#6b7280"
                    editable={!creatingUser}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword((v) => !v)} disabled={creatingUser}>
                    <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalActions, isMobile && styles.modalActionsMobile]}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => {
                  setShowEmailModal(false);
                  setNewUserCompany('');
                  setNewUserName('');
                  setNewUserLastName('');
                  setNewUserEmail('');
                  setNewUserPassword('');
                  setNewUserPhone('');
                  setNewUserBirth('');
                  setNewUserCity('');
                  setNewUserState('');
                  setShowStatePicker(false);
                  setShowNewPassword(false);
                  setCreateError(null);
                  setEmpresaSeleccionada(null);
                  setShowEmpresaPicker(false);
                }}
              >
                <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={creatingUser ? ['#6b7280', '#6b7280'] : ['#8b5cf6', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalPrimary}
              >
                <TouchableOpacity
                  disabled={creatingUser}
                  onPress={async () => {
                    if (creatingUser) return;
                    setCreateError(null);
                    const name = newUserName.trim();
                    const email = newUserEmail.trim().toLowerCase();
                    const pwd = newUserPassword.trim();
                    const phone = newUserPhone.trim();
                    const birth = newUserBirth.trim();
                    const city = newUserCity.trim();
                    const company = newUserCompany.trim();
                    const state = newUserState.trim();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!name || !email || !pwd) {
                      setCreateError('Completa nombre, correo y contraseña.');
                      return;
                    }
                    if (!emailRegex.test(email)) {
                      setCreateError('Correo inválido.');
                      return;
                    }
                    if (pwd.length < 6) {
                      setCreateError('La contraseña debe tener al menos 6 caracteres.');
                      return;
                    }
                    if (phone && phone.length !== 10) {
                      setCreateError('El teléfono debe tener 10 dígitos numéricos.');
                      return;
                    }
                    if (birth && !/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
                      setCreateError('La fecha debe tener el formato AAAA-MM-DD.');
                      return;
                    }
                    setCreatingUser(true);
                    try {
                      const res = await registerBackend({
                        nombre: name,
                        apellido: newUserLastName.trim() || undefined,
                        email,
                        contraseña: pwd,
                        telefono: phone || undefined,
                        fecha_nacimiento: birth || undefined,
                        ciudad: (() => {
                          const parts = [] as string[];
                          if (state) parts.push(state);
                          if (city) parts.push(city);
                          return parts.length ? parts.join(', ') : undefined;
                        })(),
                        empresa: company || undefined,
                        empresa_id: empresaSeleccionada?.id || undefined,
                      });
                      if (!res.success) {
                        setCreateError(res.error || 'No se pudo crear la cuenta');
                      } else {
                        setShowEmailModal(false);
                        setNewUserCompany('');
                        setNewUserName('');
                        setNewUserLastName('');
                        setNewUserEmail('');
                        setNewUserPassword('');
                        setNewUserPhone('');
                        setNewUserBirth('');
                        setNewUserCity('');
                        setNewUserState('');
                      }
                    } catch (e: any) {
                      setCreateError(e?.message || 'Error inesperado');
                    } finally {
                      setCreatingUser(false);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modalPrimaryText, { fontFamily }]}>
                    {creatingUser ? 'Generando…' : 'Generar'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      )}

      {showAsignarEmpleadoModal && reporteAAsignar && (
        <View style={styles.overlay}>
          <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.5)' }]}>
                <Ionicons name="person-add-outline" size={22} color="#3b82f6" />
              </View>
              <Text style={[styles.modalTitle, { fontFamily }]}>Asignar Reporte a Empleado</Text>
            </View>

            {asignarError ? (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, { fontFamily }]}>{asignarError}</Text>
              </View>
            ) : null}

            <View style={styles.modalForm}>
              {/* Reporte Info */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Equipo/Servicio</Text>
                <View style={[styles.formInputDisabled, { paddingHorizontal: 12, justifyContent: 'center' }]}>
                  <Text style={[styles.formInputText, { color: '#9ca3af' }]}>{reporteAAsignar.equipo_descripcion}</Text>
                </View>
              </View>

              {/* Usuario que reportó */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Reportado por</Text>
                <View style={[styles.formInputDisabled, { paddingHorizontal: 12, justifyContent: 'center' }]}>
                  <Text style={[styles.formInputText, { color: '#9ca3af' }]}>
                    {reporteAAsignar.usuario_nombre} {reporteAAsignar.usuario_apellido || ''}
                  </Text>
                </View>
              </View>

              {/* Empleado Selector */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { fontFamily }]}>Asignar a empleado*</Text>
                <TouchableOpacity
                  style={[styles.formInput, { paddingRight: 12 }]}
                  onPress={() => setShowEmpleadoDropdownReporte(!showEmpleadoDropdownReporte)}
                >
                  <Text style={[styles.formInputText, { color: selectedEmpleadoReporte ? '#f0f9ff' : '#9ca3af' }]}>
                    {selectedEmpleadoReporte
                      ? empleados.find(e => e.email === selectedEmpleadoReporte)?.nombre + ' (' + selectedEmpleadoReporte + ')'
                      : 'Selecciona un empleado'
                    }
                  </Text>
                  <Ionicons name={showEmpleadoDropdownReporte ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
                </TouchableOpacity>

                {showEmpleadoDropdownReporte && (
                  <View style={[styles.dropdownList, { maxHeight: 250 }]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {empleados.length === 0 ? (
                        <View style={styles.dropdownItem}>
                          <Text style={[styles.dropdownItemText, { color: '#9ca3af' }]}>
                            No hay empleados disponibles
                          </Text>
                        </View>
                      ) : (
                        empleados.map((empleado, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.dropdownItem,
                              selectedEmpleadoReporte === empleado.email && { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
                            ]}
                            onPress={() => {
                              console.log('[ADMIN] Seleccionando empleado:', empleado.email);
                              setSelectedEmpleadoReporte(empleado.email);
                              console.log('[ADMIN] selectedEmpleadoReporte establecido a:', empleado.email);
                              setShowEmpleadoDropdownReporte(false);
                            }}
                          >
                            <Text style={[styles.dropdownItemText, { color: '#f0f9ff' }]}>
                              {empleado.nombre} ({empleado.email})
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => {
                  setShowAsignarEmpleadoModal(false);
                  setReporteAAsignar(null);
                  setSelectedEmpleadoReporte('');
                }}
                disabled={asignandoReporte}
              >
                <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={['#3b82f6', '#1e40af']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalPrimary}
              >
                <TouchableOpacity
                  onPress={handleAsignarReporte}
                  disabled={asignandoReporte}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modalPrimaryText, { fontFamily }]}>
                    {asignandoReporte ? 'Asignando...' : 'Asignar Reporte'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      )}

      {showHistorialModal && (
        <View style={styles.overlayHeavy}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]}>Historial de Reportes</Text>
                <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]}>Todos los reportes y su estado</Text>
              </View>
              <View style={styles.largeModalActions}>
                <TouchableOpacity
                  onPress={async () => {
                    setLoadingReportes(true);
                    const { success, data, error } = await obtenerReportesBackend();
                    if (!success) setErrorReportes(error || 'No se pudieron cargar los reportes');
                    else setReportes(data || []);
                    setLoadingReportes(false);
                  }}
                  style={styles.refreshButton}
                >
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowHistorialModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filtros */}
            <View style={[styles.filtrosContainer, isMobile && styles.filtrosContainerMobile]}>
              <TouchableOpacity
                style={styles.filtrosHeader}
                onPress={() => setMostrarFiltros(!mostrarFiltros)}
                activeOpacity={0.7}
              >
                <View style={styles.filtrosHeaderLeft}>
                  <Ionicons name="filter-outline" size={18} color="#22d3ee" />
                  <Text style={[styles.filtrosTitle, { fontFamily }]}>Filtros</Text>
                  {(filtrosEstado.length > 0 || filtrosPrioridad.length > 0) && (
                    <View style={styles.filtrosActiveBadge}>
                      <Text style={[styles.filtrosActiveBadgeText, { fontFamily }]}>
                        {filtrosEstado.length + filtrosPrioridad.length}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {(filtrosEstado.length > 0 || filtrosPrioridad.length > 0) && (
                    <TouchableOpacity onPress={limpiarFiltros} style={styles.limpiarFiltrosButtonSmall}>
                      <Ionicons name="close-circle" size={16} color="#f87171" />
                      <Text style={[styles.limpiarFiltrosTextSmall, { fontFamily }]}>Limpiar</Text>
                    </TouchableOpacity>
                  )}
                  <Ionicons
                    name={mostrarFiltros ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#22d3ee"
                  />
                </View>
              </TouchableOpacity>

              {mostrarFiltros && (
                <>
                  <View style={styles.filtroSection}>
                    <Text style={[styles.filtroLabel, { fontFamily }]}>
                      <Ionicons name="flag-outline" size={14} color="#94a3b8" /> Estado
                    </Text>
                    <View style={styles.filtroChips}>
                      {[
                        { value: 'pendiente', label: 'En espera', icon: 'time-outline', color: '#f59e0b' },
                        { value: 'en_proceso', label: 'En proceso', icon: 'hourglass-outline', color: '#3b82f6' },
                      ].map((estado) => {
                        const isActive = filtrosEstado.includes(estado.value);
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
                    <Text style={[styles.filtroLabel, { fontFamily }]}>
                      <Ionicons name="alert-circle-outline" size={14} color="#94a3b8" /> Prioridad
                    </Text>
                    <View style={styles.filtroChips}>
                      {[
                        { value: 'baja', label: 'Baja', icon: 'chevron-down-outline', color: '#10b981' },
                        { value: 'media', label: 'Media', icon: 'remove-outline', color: '#f59e0b' },
                        { value: 'urgente', label: 'Urgente', icon: 'chevron-up-outline', color: '#ef4444' },
                      ].map((prioridad) => {
                        const isActive = filtrosPrioridad.includes(prioridad.value);
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

                  {!loadingReportes && (
                    <View style={styles.filtrosResultados}>
                      <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
                      <Text style={[styles.filtrosResultadosText, { fontFamily }]}>
                        Mostrando {reportesFiltrados.length} de {reportesPendientes.length} reportes
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {loadingReportes && (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>Cargando reportes...</Text>
              </View>
            )}

            {!loadingReportes && errorReportes ? (
              <View style={styles.errorPanel}>
                <Text style={[styles.errorPanelText, { fontFamily }]}>{errorReportes}</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesFiltrados.length === 0 ? (
              <View style={styles.noResultadosContainer}>
                <Ionicons name="search-outline" size={48} color="#475569" />
                <Text style={[styles.noResultadosTitle, { fontFamily }]}>
                  {reportesPendientes.length === 0 ? 'No hay reportes' : 'No se encontraron resultados'}
                </Text>
                <Text style={[styles.noResultadosText, { fontFamily }]}>
                  {reportesPendientes.length === 0
                    ? 'No hay reportes pendientes en este momento.'
                    : 'Intenta ajustar los filtros para ver más resultados.'}
                </Text>
                {(filtrosEstado.length > 0 || filtrosPrioridad.length > 0) && reportesPendientes.length > 0 && (
                  <TouchableOpacity onPress={limpiarFiltros} style={styles.limpiarFiltrosButtonLarge}>
                    <Ionicons name="refresh-outline" size={18} color="#fff" />
                    <Text style={[styles.limpiarFiltrosTextLarge, { fontFamily }]}>Limpiar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesFiltrados.length > 0 ? (
              <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                <View style={styles.listSpacing}>
                  {reportesFiltrados.map((rep) => {
                    const badge = estadoBadgeStyle(rep.estado);
                    return (
                      <View key={rep.id} style={styles.reportCard}>
                        <View style={[styles.reportHeader, isMobile && styles.reportHeaderMobile]}>
                          <View style={styles.reportHeaderText}>
                            <Text style={[styles.reportTitle, isMobile && styles.reportTitleMobile, { fontFamily }]} numberOfLines={1}>
                              {rep.equipo_descripcion || 'Equipo / servicio'}
                            </Text>
                            <Text style={[styles.reportSubtitle, isMobile && styles.reportSubtitleMobile, { fontFamily }]} numberOfLines={1}>
                              {rep.usuario_nombre} {rep.usuario_apellido} · {rep.usuario_email}
                            </Text>
                            <Text style={[styles.reportMeta, isMobile && styles.reportMetaMobile, { fontFamily }]} numberOfLines={1}>
                              {rep.empresa || 'Sin empresa'} • {rep.sucursal || 'Sin sucursal'}
                            </Text>
                          </View>
                          <View style={[styles.reportActions, isMobile && styles.reportActionsMobile]}>
                            <TouchableOpacity
                              onPress={async () => {
                                setSelectedReporteDetail(rep);
                                setShowReporteDetailModal(true);
                                setCargandoArchivos(true);
                                console.log(`[ADMIN] Cargando archivos para reporte: ${rep.id}`);
                                const resultado = await obtenerArchivosReporteBackend(rep.id);
                                console.log(`[ADMIN] Resultado obtenerArchivosReporte:`, resultado);
                                if (resultado.success) {
                                  console.log(`[ADMIN] Archivos encontrados: ${resultado.data?.length || 0}`);
                                  setArchivosReporte(resultado.data || []);
                                } else {
                                  console.log(`[ADMIN] Error al obtener archivos: ${resultado.error}`);
                                }
                                setCargandoArchivos(false);
                              }}
                              style={styles.eyeCard}
                            >
                              <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                            </TouchableOpacity>
                            <View style={[styles.estadoBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                              <Text style={[styles.estadoBadgeText, { fontFamily, color: badge.text }]}>{estadoDisplay(rep.estado)}</Text>
                            </View>
                          </View>
                        </View>

                        <Text style={[styles.reportComment, { fontFamily }]} numberOfLines={2}>
                          {rep.comentario || 'Sin comentarios'}
                        </Text>

                        {/* Removidos botones de cambio manual de estado para automatización */}

                        {(rep.estado === 'pendiente' || !rep.estado) && (
                          <TouchableOpacity
                            onPress={() => {
                              setReporteAAsignar(rep);
                              setSelectedEmpleadoReporte('');
                              setAsignarError(null);
                              setShowHistorialModal(false);
                              setShowAsignarEmpleadoModal(true);
                            }}
                            style={{
                              marginTop: 12,
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              borderColor: '#3b82f6',
                              borderWidth: 1,
                              borderRadius: 8,
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <Ionicons name="person-add-outline" size={16} color="#3b82f6" />
                            <Text style={[{ color: '#3b82f6', fontWeight: '600', fontSize: 13 }, { fontFamily }]}>
                              Asignar a empleado
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {showTerminadosModal && (
        <View style={styles.overlayHeavy}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]}>Reportes Terminados</Text>
                <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]}>Todos los reportes completados</Text>
              </View>
              <View style={styles.largeModalActions}>
                <TouchableOpacity
                  onPress={async () => {
                    setLoadingReportes(true);
                    const { success, data, error } = await obtenerReportesBackend();
                    if (!success) setErrorReportes(error || 'No se pudieron cargar los reportes');
                    else setReportes(data || []);
                    setLoadingReportes(false);
                  }}
                  style={styles.refreshButton}
                >
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTerminadosModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingReportes && (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>Cargando reportes...</Text>
              </View>
            )}

            {!loadingReportes && errorReportes ? (
              <View style={styles.errorPanel}>
                <Text style={[styles.errorPanelText, { fontFamily }]}>{errorReportes}</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesTerminados.length === 0 ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>No hay reportes terminados.</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesTerminados.length > 0 ? (
              <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                <View style={styles.listSpacing}>
                  {reportesTerminados.map((rep) => (
                    <View key={rep.id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <View style={styles.reportHeaderText}>
                          <Text style={[styles.reportTitle, { fontFamily }]} numberOfLines={1}>
                            {rep.equipo_descripcion || 'Equipo / servicio'}
                          </Text>
                          <Text style={[styles.reportSubtitle, { fontFamily }]} numberOfLines={1}>
                            {rep.usuario_nombre} {rep.usuario_apellido} · {rep.usuario_email}
                          </Text>
                          <Text style={[styles.reportMeta, { fontFamily }]} numberOfLines={1}>
                            {rep.empresa || 'Sin empresa'} • {rep.sucursal || 'Sin sucursal'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            setSelectedReporteDetail(rep);
                            setShowReporteDetailModal(true);
                            setCargandoArchivos(true);
                            console.log(`[ADMIN-HISTORIAL] Cargando archivos para reporte: ${rep.id}`);
                            const resultado = await obtenerArchivosReporteBackend(rep.id);
                            console.log(`[ADMIN-HISTORIAL] Resultado obtenerArchivosReporte:`, resultado);
                            if (resultado.success) {
                              console.log(`[ADMIN-HISTORIAL] Archivos encontrados: ${resultado.data?.length || 0}`);
                              setArchivosReporte(resultado.data || []);
                            } else {
                              console.log(`[ADMIN-HISTORIAL] Error al obtener archivos: ${resultado.error}`);
                            }
                            setCargandoArchivos(false);
                          }}
                          style={styles.eyeCard}
                        >
                          <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.reportComment, { fontFamily }]} numberOfLines={2}>
                        {rep.comentario || 'Sin comentarios'}
                      </Text>

                      <View style={styles.estadoSoloBadge}>
                        <Text style={[styles.estadoSoloText, { fontFamily }]}>{estadoDisplay(rep.estado)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {/* Modal de Cotizaciones Pendientes */}
      {showCotizacionesModal && (
        <View style={styles.overlayHeavy}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]}>Cotizaciones Pendientes</Text>
                <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]}>Reportes con análisis completado, pendientes de cotización</Text>
              </View>
              <View style={styles.largeModalActions}>
                <TouchableOpacity
                  onPress={async () => {
                    setLoadingCotizaciones(true);
                    const { success, data } = await obtenerReportesBackend();
                    if (success && data) {
                      const cotizacionesPendientes = data.filter((r: any) =>
                        r.estado === 'en_cotizacion' &&
                        r.analisis_general &&
                        r.analisis_general.trim() !== '' &&
                        (!r.precio_cotizacion || r.precio_cotizacion === 0)
                      );
                      setReportesCotizaciones(cotizacionesPendientes);
                    }
                    setLoadingCotizaciones(false);
                  }}
                  style={styles.refreshButton}
                >
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCotizacionesModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingCotizaciones && (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>Cargando cotizaciones pendientes...</Text>
              </View>
            )}

            {!loadingCotizaciones && errorCotizaciones ? (
              <View style={styles.errorPanel}>
                <Text style={[styles.errorPanelText, { fontFamily }]}>{errorCotizaciones}</Text>
              </View>
            ) : null}

            {!loadingCotizaciones && !errorCotizaciones && reportesCotizaciones.length === 0 ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>No hay cotizaciones pendientes.</Text>
              </View>
            ) : null}

            {!loadingCotizaciones && !errorCotizaciones && reportesCotizaciones.length > 0 ? (
              <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                <View style={styles.listSpacing}>
                  {reportesCotizaciones.map((rep) => (
                    <View key={rep.id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <View style={styles.reportHeaderText}>
                          <Text style={[styles.reportTitle, { fontFamily }]} numberOfLines={1}>
                            {rep.equipo_descripcion || 'Equipo / servicio'}
                          </Text>
                          <Text style={[styles.reportSubtitle, { fontFamily }]} numberOfLines={1}>
                            {rep.usuario_nombre} {rep.usuario_apellido} · {rep.usuario_email}
                          </Text>
                          <Text style={[styles.reportMeta, { fontFamily }]} numberOfLines={1}>
                            {rep.empresa || 'Sin empresa'} • {rep.sucursal || 'Sin sucursal'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            setSelectedReporteDetail(rep);
                            setShowReporteDetailModal(true);
                            setCargandoArchivos(true);
                            const resultado = await obtenerArchivosReporteBackend(rep.id);
                            if (resultado.success) {
                              setArchivosReporte(resultado.data || []);
                            }
                            setCargandoArchivos(false);
                          }}
                          style={styles.eyeCard}
                        >
                          <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.reportComment, { fontFamily }]} numberOfLines={2}>
                        {rep.comentario || 'Sin comentarios'}
                      </Text>

                      <View style={{ marginTop: 12, padding: 10, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeftWidth: 3, borderLeftColor: '#f59e0b', borderRadius: 6 }}>
                        <Text style={[{ fontSize: 11, color: '#f59e0b', fontWeight: '600' }, { fontFamily }]}>ANÁLISIS DEL EMPLEADO:</Text>
                        <Text style={[{ fontSize: 12, color: '#fbbf24', marginTop: 6, lineHeight: 18 }, { fontFamily }]} numberOfLines={3}>
                          {rep.analisis_general || 'Sin análisis'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setReporteACotizar(rep);
                          setPrecioCotizacion('');
                          setCotizarError(null);
                          setShowCotizarReporteModal(true);
                        }}
                        style={{
                          marginTop: 12,
                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                          borderColor: '#f59e0b',
                          borderWidth: 1,
                          borderRadius: 8,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 6,
                        }}
                      >
                        <Ionicons name="pricetag-outline" size={16} color="#f59e0b" />
                        <Text style={[{ color: '#fbbf24', fontSize: 13, fontWeight: '600' }, { fontFamily }]}>Cotizar Reporte</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {/* Modal para Cotizar Reporte */}
      {showCotizarReporteModal && reporteACotizar && (
        <View style={styles.overlayHeavy}>
          <View style={[styles.detailModal, isMobile && styles.detailModalMobile, { backgroundColor: '#0f172a', borderColor: '#1e293b' }]}>
            {/* Header Rediseñado */}
            <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                  <Ionicons name="pricetag" size={20} color="#f59e0b" />
                </View>
                <View>
                  <Text style={[{ color: '#fff', fontSize: isMobile ? 18 : 20, fontWeight: '800' }, { fontFamily }]}>
                    Cotizar Reporte
                  </Text>
                  <Text style={[{ color: '#64748b', fontSize: isMobile ? 12 : 13, marginTop: 2 }, { fontFamily }]}>
                    Define el costo del servicio técnico
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowCotizarReporteModal(false);
                  setReporteACotizar(null);
                  setPrecioCotizacion('');
                  setCotizarError(null);
                }}
                style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(30, 41, 59, 0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400, marginBottom: 20 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 20 }}>
                {/* Información del Equipo */}
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="cube-outline" size={14} color="#94a3b8" />
                    <Text style={[{ fontSize: 11, color: '#94a3b8', fontWeight: '700', letterSpacing: 0.5 }, { fontFamily }]}>EQUIPO / SERVICIO</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b' }}>
                    <Text style={[{ fontSize: isMobile ? 14 : 15, color: '#fff', fontWeight: '600' }, { fontFamily }]}>
                      {reporteACotizar.equipo_descripcion || 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Información del Cliente */}
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="person-outline" size={14} color="#94a3b8" />
                    <Text style={[{ fontSize: 11, color: '#94a3b8', fontWeight: '700', letterSpacing: 0.5 }, { fontFamily }]}>CLIENTE</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b' }}>
                    <Text style={[{ fontSize: isMobile ? 14 : 15, color: '#fff', fontWeight: '500' }, { fontFamily }]}>
                      {reporteACotizar.usuario_nombre} {reporteACotizar.usuario_apellido}
                    </Text>
                  </View>
                </View>

                {/* Análisis Técnico */}
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="document-text-outline" size={14} color="#06b6d4" />
                    <Text style={[{ fontSize: 11, color: '#06b6d4', fontWeight: '700', letterSpacing: 0.5 }, { fontFamily }]}>ANÁLISIS DEL EMPLEADO</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.05)', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)', borderLeftWidth: 4, borderLeftColor: '#06b6d4' }}>
                    <Text style={[{ fontSize: isMobile ? 13 : 14, color: '#e2e8f0', lineHeight: 20 }, { fontFamily }]}>
                      {reporteACotizar.analisis_general || 'Sin análisis'}
                    </Text>
                  </View>
                </View>

                {/* Campo para subir PDF de cotización */}
                <View style={{ gap: 10, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="document-attach-outline" size={14} color="#8b5cf6" />
                    <Text style={[{ fontSize: 12, color: '#8b5cf6', fontWeight: '800', letterSpacing: 0.5 }, { fontFamily }]}>ARCHIVO PDF (OPCIONAL)</Text>
                  </View>

                  {!archivoCotizacion ? (
                    <TouchableOpacity
                      onPress={seleccionarArchivoPDF}
                      style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        borderWidth: 1.5,
                        borderColor: '#8b5cf6',
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        borderStyle: 'dashed'
                      }}
                    >
                      <Ionicons name="cloud-upload-outline" size={24} color="#a78bfa" />
                      <Text style={[{ fontSize: 14, color: '#a78bfa', fontWeight: '600' }, { fontFamily }]}>
                        Seleccionar archivo PDF
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderWidth: 1,
                      borderColor: '#8b5cf6',
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Ionicons name="document-text" size={24} color="#a78bfa" />
                        <View style={{ flex: 1 }}>
                          <Text style={[{ fontSize: 13, color: '#e2e8f0', fontWeight: '600' }, { fontFamily }]} numberOfLines={1}>
                            {archivoCotizacion.name}
                          </Text>
                          <Text style={[{ fontSize: 11, color: '#94a3b8', marginTop: 2 }, { fontFamily }]}>
                            {(archivoCotizacion.size / 1024).toFixed(1)} KB
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => setArchivoCotizacion(null)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          borderRadius: 8,
                          padding: 8
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Campo de Precio */}
                <View style={{ gap: 10, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="cash-outline" size={14} color="#f59e0b" />
                    <Text style={[{ fontSize: 12, color: '#f59e0b', fontWeight: '800', letterSpacing: 0.5 }, { fontFamily }]}>PRECIO DEL SERVICIO *</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderWidth: 1.5, borderColor: '#f59e0b', borderRadius: 12, paddingHorizontal: 16, height: 56 }}>
                    <Text style={[{ fontSize: 20, color: '#fbbf24', fontWeight: '700', marginRight: 8 }, { fontFamily }]}>$</Text>
                    <TextInput
                      style={[{ flex: 1, color: '#fff', fontSize: 18, fontWeight: '600' }, { fontFamily }]}
                      value={precioCotizacion}
                      onChangeText={setPrecioCotizacion}
                      placeholder="0.00"
                      placeholderTextColor="#475569"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {cotizarError && (
                    <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeftWidth: 3, borderLeftColor: '#ef4444', padding: 12, borderRadius: 8, marginTop: 4 }}>
                      <Text style={[{ fontSize: 12, color: '#fca5a5', fontWeight: '500' }, { fontFamily }]}>{cotizarError}</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Acciones */}
            <View style={{ flexDirection: 'row', gap: 12, paddingTop: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowCotizarReporteModal(false);
                  setReporteACotizar(null);
                  setPrecioCotizacion('');
                  setCotizarError(null);
                  setArchivoCotizacion(null);
                }}
                style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' }}
              >
                <Text style={[{ color: '#94a3b8', fontSize: 14, fontWeight: '700' }, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCotizarReporte}
                disabled={cotizando}
                activeOpacity={0.8}
                style={{ flex: 1.5, overflow: 'hidden', borderRadius: 12 }}
              >
                <LinearGradient
                  colors={cotizando ? ['#fbbf2450', '#f59e0b50'] : ['#fbbf24', '#f59e0b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={[{ color: cotizando ? '#94a3b8' : '#000', fontSize: 14, fontWeight: '800' }, { fontFamily }]}>
                    {cotizando ? 'Cotizando...' : 'Confirmar Cotización'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal de Confirmación Secundaria */}
      {showConfirmarCotizacionModal && reporteACotizar && (
        <View style={[styles.overlayHeavy, { zIndex: 1100 }]}>
          <View style={[styles.detailModal, isMobile && styles.detailModalMobile, { maxWidth: 400, backgroundColor: '#0f172a', borderColor: '#1e293b' }]}>
            <View style={{ alignItems: 'center', gap: 16, paddingVertical: 10 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(245, 158, 11, 0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <Ionicons name="alert-circle-outline" size={36} color="#f59e0b" />
              </View>

              <View style={{ alignItems: 'center', gap: 6 }}>
                <Text style={[{ color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' }, { fontFamily }]}>
                  ¿Confirmar Envío?
                </Text>
                <Text style={[{ color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 20 }, { fontFamily }]}>
                  Estás por enviar una cotización de:
                </Text>
              </View>

              <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 30, width: '100%', alignItems: 'center' }}>
                <Text style={[{ color: '#fbbf24', fontSize: 32, fontWeight: '800' }, { fontFamily }]}>
                  ${parseFloat(precioCotizacion).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[{ color: '#f59e0b', fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 1 }, { fontFamily }]}>MXN TOTAL</Text>
              </View>

              <View style={{ width: '100%', gap: 12, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={handleCotizarReporte}
                  activeOpacity={0.8}
                  style={{ width: '100%', overflow: 'hidden', borderRadius: 12 }}
                >
                  <LinearGradient
                    colors={['#fbbf24', '#f59e0b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 16, alignItems: 'center' }}
                  >
                    <Text style={[{ color: '#000', fontSize: 15, fontWeight: '800' }, { fontFamily }]}>
                      SÍ, ENVIAR COTIZACIÓN
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowConfirmarCotizacionModal(false)}
                  style={{ width: '100%', backgroundColor: 'transparent', paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={[{ color: '#64748b', fontSize: 14, fontWeight: '600' }, { fontFamily }]}>Revisar precio de nuevo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* PASO 6: Modal de Reportes Finalizados por Técnico */}
      {showFinalizadosModal && (
        <View style={styles.overlayHeavy}>
          <View style={[styles.detailModal, isMobile && styles.detailModalMobile]}>
            <View style={[styles.detailHeader, isMobile && styles.detailHeaderMobile]}>
              <View style={[styles.detailHeaderText, isMobile && styles.detailHeaderTextMobile]}>
                <Text style={[styles.detailTitle, isMobile && styles.detailTitleMobile, { fontFamily }]}>Reportes Finalizados por Técnico</Text>
                <Text style={[styles.detailSubtitle, isMobile && styles.detailSubtitleMobile, { fontFamily }]}>Esperando confirmación del cliente</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFinalizadosModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            {loadingFinalizados ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>Cargando reportes finalizados...</Text>
              </View>
            ) : null}

            {!loadingFinalizados && reportesFinalizados.length === 0 ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>No hay reportes finalizados por técnico.</Text>
              </View>
            ) : null}

            {!loadingFinalizados && reportesFinalizados.length > 0 ? (
              <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                <View style={styles.listSpacing}>
                  {reportesFinalizados.map((rep) => (
                    <View key={rep.id} style={styles.reportCard}>
                      <View style={styles.reportHeader}>
                        <View style={styles.reportHeaderText}>
                          <Text style={[styles.reportTitle, { fontFamily }]} numberOfLines={1}>
                            {rep.equipo_descripcion || 'Equipo / servicio'}
                          </Text>
                          <Text style={[styles.reportSubtitle, { fontFamily }]} numberOfLines={1}>
                            {rep.usuario_nombre} {rep.usuario_apellido} · {rep.usuario_email}
                          </Text>
                          <Text style={[styles.reportMeta, { fontFamily }]} numberOfLines={1}>
                            {rep.empresa || 'Sin empresa'} • {rep.sucursal || 'Sin sucursal'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            setSelectedReporteDetail(rep);
                            setShowReporteDetailModal(true);
                            setCargandoArchivos(true);
                            const resultado = await obtenerArchivosReporteBackend(rep.id);
                            if (resultado.success) {
                              setArchivosReporte(resultado.data || []);
                            }
                            setCargandoArchivos(false);
                          }}
                          style={styles.eyeCard}
                        >
                          <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.reportComment, { fontFamily }]} numberOfLines={2}>
                        {rep.comentario || 'Sin comentarios'}
                      </Text>

                      <View style={{ backgroundColor: '#fef3c7', borderRadius: 8, padding: 10, marginTop: 10 }}>
                        <Text style={{ color: '#92400e', fontSize: 12, fontWeight: '600' }}>
                          ⏳ Esperando confirmación del cliente
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {/* Modal de Reportes Finalizados por Empleado (Fase 2 Completada) */}
      {showFinalizadosPorEmpleadoModal && (
        <View style={styles.overlayHeavy}>
          <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
            <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]}>Reportes Finalizados por Empleado</Text>
                <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]}>Confirmación de Fase 2 completada</Text>
              </View>
              <View style={styles.largeModalActions}>
                <TouchableOpacity
                  onPress={async () => {
                    setLoadingFinalizadosPorEmpleado(true);
                    const { success, data } = await obtenerReportesBackend();
                    if (success && data) {
                      const finalizadosPorEmpleado = data.filter((r: any) =>
                        r.estado === 'finalizado_por_tecnico'
                      );
                      setReportesFinalizadosPorEmpleado(finalizadosPorEmpleado);
                    }
                    setLoadingFinalizadosPorEmpleado(false);
                  }}
                  style={[styles.refreshButton, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                >
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="refresh" size={16} color="#67e8f9" />
                  </Animated.View>
                  <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowFinalizadosPorEmpleadoModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingFinalizadosPorEmpleado && (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>Cargando reportes finalizados...</Text>
              </View>
            )}

            {!loadingFinalizadosPorEmpleado && errorFinalizadosPorEmpleado ? (
              <View style={styles.errorPanel}>
                <Text style={[styles.errorPanelText, { fontFamily }]}>{errorFinalizadosPorEmpleado}</Text>
              </View>
            ) : null}

            {!loadingFinalizadosPorEmpleado && !errorFinalizadosPorEmpleado && reportesFinalizadosPorEmpleado.length === 0 ? (
              <View style={styles.infoBox}>
                <Text style={[styles.infoText, { fontFamily }]}>No hay reportes finalizados por empleado.</Text>
              </View>
            ) : null}

            {!loadingFinalizadosPorEmpleado && !errorFinalizadosPorEmpleado && reportesFinalizadosPorEmpleado.length > 0 ? (
              <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                <View style={styles.listSpacing}>
                  {reportesFinalizadosPorEmpleado.map((rep) => {
                    const desc = rep.comentario || '';
                    const modeloMatch = desc.match(/Modelo:\s*([^\n]+)/i);
                    const serieMatch = desc.match(/Serie:\s*([^\n]+)/i);
                    // Sucursal suele venir del backend, pero si no, intentamos extraerla
                    const sucursalMatch = desc.match(/Sucursal:\s*([^\n]+)/i);

                    const modelo = modeloMatch ? modeloMatch[1].trim() : null;
                    const serie = serieMatch ? serieMatch[1].trim() : null;
                    const sucursal = rep.sucursal || (sucursalMatch ? sucursalMatch[1].trim() : null);

                    return (
                      <View key={rep.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                          <View style={styles.reportHeaderText}>
                            {/* Nombre del Cliente y Empresa */}
                            <Text style={[styles.reportTitle, { fontFamily, fontSize: 16, color: '#f8fafc' }]}>
                              {rep.usuario_nombre} {rep.usuario_apellido} <Text style={{ color: '#94a3b8', fontWeight: '400', fontSize: 14 }}>| {rep.empresa || 'Sin empresa'}</Text>
                            </Text>

                            {/* Metadatos: Modelo, Serie, Sucursal */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                              {modelo ? (
                                <Text style={[{ fontSize: 12, color: '#64748b' }, { fontFamily }]}>
                                  Modelo: <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>{modelo}</Text>
                                </Text>
                              ) : null}

                              {serie ? (
                                <Text style={[{ fontSize: 12, color: '#64748b' }, { fontFamily }]}>
                                  Serie: <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>{serie}</Text>
                                </Text>
                              ) : null}

                              {sucursal ? (
                                <Text style={[{ fontSize: 12, color: '#64748b' }, { fontFamily }]}>
                                  Sucursal: <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>{sucursal}</Text>
                                </Text>
                              ) : null}
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={async () => {
                              setSelectedReporteDetail(rep);
                              setShowReporteDetailModal(true);
                              setCargandoArchivos(true);
                              const resultado = await obtenerArchivosReporteBackend(rep.id);
                              if (resultado.success) {
                                setArchivosReporte(resultado.data || []);
                              }
                              setCargandoArchivos(false);
                            }}
                            style={[styles.eyeCard, { backgroundColor: '#1e293b', borderWidth: 0 }]}
                          >
                            <Ionicons name="eye-outline" size={20} color="#94a3b8" />
                          </TouchableOpacity>
                        </View>

                        {/* Trabajo Completado (Fase 2) */}
                        <View style={{ marginTop: 12, padding: 12, backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', gap: 8 }}>
                          <Text style={[{ fontSize: 11, color: '#06b6d4', fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 }, { fontFamily }]}>TRABAJO COMPLETADO</Text>

                          {rep.revision ? (
                            <Text style={[{ fontSize: 13, color: '#e2e8f0', lineHeight: 19 }, { fontFamily }]}>
                              <Text style={{ color: '#67e8f9', fontWeight: '600' }}>Revisión: </Text>{rep.revision}
                            </Text>
                          ) : null}

                          {rep.reparacion ? (
                            <Text style={[{ fontSize: 13, color: '#e2e8f0', lineHeight: 19 }, { fontFamily }]}>
                              <Text style={{ color: '#67e8f9', fontWeight: '600' }}>Reparación: </Text>{rep.reparacion}
                            </Text>
                          ) : null}

                          {rep.recomendaciones ? (
                            <Text style={[{ fontSize: 13, color: '#e2e8f0', lineHeight: 19 }, { fontFamily }]}>
                              <Text style={{ color: '#67e8f9', fontWeight: '600' }}>Recomendaciones: </Text>{rep.recomendaciones}
                            </Text>
                          ) : null}

                          {(!rep.revision && !rep.reparacion && !rep.recomendaciones) && (
                            <Text style={[{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }, { fontFamily }]}>Sin detalles registrados.</Text>
                          )}
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            setReporteACerrar(rep);
                            setShowConfirmarCierreModal(true);
                          }}
                          style={{
                            marginTop: 12,
                            backgroundColor: '#15803d', // Verde mate (green-700)
                            borderRadius: 6,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 8,
                          }}
                          activeOpacity={0.9}
                        >
                          <Ionicons name="checkmark-circle" size={18} color="#fff" />
                          <Text style={[{ color: '#fff', fontSize: 13, fontWeight: '700' }, { fontFamily }]}>Confirmar Finalización</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )
      }

      {/* Modal de Confirmación de Cierre */}
      {showConfirmarCierreModal && reporteACerrar && (
        <View style={styles.overlayHeavy}>
          <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)' }]}>
                <Ionicons name="warning-outline" size={22} color="#ef4444" />
              </View>
              <Text style={[styles.modalTitle, { fontFamily }]}>Confirmar Cierre de Reporte</Text>
            </View>

            <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
              <Text style={[{ fontSize: 14, color: '#cbd5e1', lineHeight: 22 }, { fontFamily }]}>
                ¿Estás seguro de que deseas cerrar este reporte?
              </Text>
              <Text style={[{ fontSize: 13, color: '#94a3b8', marginTop: 8, lineHeight: 20 }, { fontFamily }]}>
                El reporte se marcará como <Text style={{ color: '#10b981', fontWeight: '600' }}>cerrado</Text> y se moverá a la sección de reportes terminados.
              </Text>

              {/* Información del reporte */}
              <View style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 8, borderWidth: 1, borderColor: '#334155' }}>
                <Text style={[{ fontSize: 12, color: '#67e8f9', fontWeight: '600', marginBottom: 6 }, { fontFamily }]}>REPORTE:</Text>
                <Text style={[{ fontSize: 13, color: '#e2e8f0' }, { fontFamily }]}>
                  {reporteACerrar.usuario_nombre} {reporteACerrar.usuario_apellido}
                </Text>
                <Text style={[{ fontSize: 12, color: '#94a3b8', marginTop: 2 }, { fontFamily }]}>
                  {reporteACerrar.empresa || 'Sin empresa'}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => {
                  setShowConfirmarCierreModal(false);
                  setReporteACerrar(null);
                }}
                disabled={updatingId !== null}
              >
                <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={updatingId === reporteACerrar.id ? ['#4b5563', '#4b5563'] : ['#15803d', '#16a34a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalPrimary}
              >
                <TouchableOpacity
                  onPress={async () => {
                    setUpdatingId(reporteACerrar.id);
                    const { success, error } = await actualizarEstadoReporteAsignado(reporteACerrar.id, 'cerrado');
                    setUpdatingId(null);

                    if (success) {
                      // Cerrar modal de confirmación
                      setShowConfirmarCierreModal(false);
                      setReporteACerrar(null);

                      // Recargar lista de reportes finalizados
                      setLoadingFinalizadosPorEmpleado(true);
                      const { success: success2, data } = await obtenerReportesBackend();
                      if (success2 && data) {
                        const finalizadosPorEmpleado = data.filter((r: any) =>
                          r.estado === 'finalizado_por_tecnico' ||
                          (r.estado === 'aceptado_por_cliente' && (r.revision || r.reparacion))
                        );
                        setReportesFinalizadosPorEmpleado(finalizadosPorEmpleado);
                      }
                      setLoadingFinalizadosPorEmpleado(false);
                    }
                  }}
                  disabled={updatingId === reporteACerrar.id}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modalPrimaryText, { fontFamily }]}>
                    {updatingId === reporteACerrar.id ? 'Cerrando...' : 'Sí, Cerrar Reporte'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      )}

      {/* PASO 6: Modal de Reportes Cerrados por Cliente */}
      {
        showCerradosModal && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.detailModal, isMobile && styles.detailModalMobile]}>
              <View style={[styles.detailHeader, isMobile && styles.detailHeaderMobile]}>
                <View style={[styles.detailHeaderText, isMobile && styles.detailHeaderTextMobile]}>
                  <Text style={[styles.detailTitle, isMobile && styles.detailTitleMobile, { fontFamily }]}>Reportes Cerrados por Cliente</Text>
                  <Text style={[styles.detailSubtitle, isMobile && styles.detailSubtitleMobile, { fontFamily }]}>Ciclo de vida completado</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowCerradosModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              {loadingCerrados ? (
                <View style={styles.infoBox}>
                  <Text style={[styles.infoText, { fontFamily }]}>Cargando reportes cerrados...</Text>
                </View>
              ) : null}

              {!loadingCerrados && reportesCerrados.length === 0 ? (
                <View style={styles.infoBox}>
                  <Text style={[styles.infoText, { fontFamily }]}>No hay reportes cerrados por cliente.</Text>
                </View>
              ) : null}

              {!loadingCerrados && reportesCerrados.length > 0 ? (
                <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                  <View style={styles.listSpacing}>
                    {reportesCerrados.map((rep) => (
                      <View key={rep.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                          <View style={styles.reportHeaderText}>
                            <Text style={[styles.reportTitle, { fontFamily }]} numberOfLines={1}>
                              {rep.equipo_descripcion || 'Equipo / servicio'}
                            </Text>
                            <Text style={[styles.reportSubtitle, { fontFamily }]} numberOfLines={1}>
                              {rep.usuario_nombre} {rep.usuario_apellido} · {rep.usuario_email}
                            </Text>
                            <Text style={[styles.reportMeta, { fontFamily }]} numberOfLines={1}>
                              {rep.empresa || 'Sin empresa'} • {rep.sucursal || 'Sin sucursal'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={async () => {
                              setSelectedReporteDetail(rep);
                              setShowReporteDetailModal(true);
                              setCargandoArchivos(true);
                              const resultado = await obtenerArchivosReporteBackend(rep.id);
                              if (resultado.success) {
                                setArchivosReporte(resultado.data || []);
                              }
                              setCargandoArchivos(false);
                            }}
                            style={styles.eyeCard}
                          >
                            <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                          </TouchableOpacity>
                        </View>

                        <Text style={[styles.reportComment, { fontFamily }]} numberOfLines={2}>
                          {rep.comentario || 'Sin comentarios'}
                        </Text>

                        <View style={{ backgroundColor: '#d1fae5', borderRadius: 8, padding: 10, marginTop: 10 }}>
                          <Text style={{ color: '#065f46', fontSize: 12, fontWeight: '600' }}>
                            ✓ Cerrado definitivamente por cliente
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : null}
            </View>
          </View>
        )
      }

      {
        showReporteDetailModal && selectedReporteDetail && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.detailModal, isMobile && styles.detailModalMobile]}>
              <View style={[styles.detailHeader, isMobile && styles.detailHeaderMobile]}>
                <View style={[styles.detailHeaderText, isMobile && styles.detailHeaderTextMobile]}>
                  <Text style={[styles.detailTitle, isMobile && styles.detailTitleMobile, { fontFamily }]}>Detalles del reporte</Text>
                  <Text style={[styles.detailSubtitle, isMobile && styles.detailSubtitleMobile, { fontFamily }]}>Resumen completo del ticket</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowReporteDetailModal(false);
                    setSelectedReporteDetail(null);
                    setArchivosReporte([]);
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={[styles.detailScroll, isMobile && styles.detailScrollMobile]}>
                <View style={styles.detailContent}>
                  {/* Equipo / Servicio */}
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Equipo / Servicio</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {selectedReporteDetail.equipo_descripcion || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Modelo */}
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Modelo</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {(() => {
                          const desc = selectedReporteDetail.descripcion || '';
                          const modeloMatch = desc.match(/Modelo:\s*([^\n]+)/i);
                          return modeloMatch ? modeloMatch[1].trim() : 'N/A';
                        })()}
                      </Text>
                    </View>
                  </View>

                  {/* Serie */}
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Serie</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {(() => {
                          const desc = selectedReporteDetail.descripcion || '';
                          const serieMatch = desc.match(/Serie:\s*([^\n]+)/i);
                          return serieMatch ? serieMatch[1].trim() : 'N/A';
                        })()}
                      </Text>
                    </View>
                  </View>

                  {/* Sucursal */}
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Sucursal</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {selectedReporteDetail.sucursal || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Comentario */}
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Comentario</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {(() => {
                          // Extract only the comment part from the combined comentario field
                          const fullComentario = selectedReporteDetail.comentario || '';
                          const comentarioMatch = fullComentario.match(/Comentario:\s*(.+?)(?:\n|$)/);
                          return comentarioMatch ? comentarioMatch[1].trim() : (fullComentario || 'Sin comentarios');
                        })()}
                      </Text>
                    </View>
                  </View>

                  {/* Prioridad and Estado Row */}
                  <View style={styles.detailRow}>
                    <View style={[styles.detailField, styles.detailFieldHalf]}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Prioridad</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.prioridad || 'media'}</Text>
                      </View>
                    </View>

                    <View style={[styles.detailField, styles.detailFieldHalf]}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Estado</Text>
                      <View
                        style={[
                          styles.detailValueBox,
                          styles.detailPillBox,
                          {
                            backgroundColor: estadoBadgeStyle(selectedReporteDetail.estado).bg,
                            borderColor: estadoBadgeStyle(selectedReporteDetail.estado).border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.detailPillText,
                            { fontFamily, color: estadoBadgeStyle(selectedReporteDetail.estado).text },
                          ]}
                        >
                          {estadoDisplay(selectedReporteDetail.estado)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Empresa */}
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Empresa</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {selectedReporteDetail.empresa || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Fecha de creación */}
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Fecha de creación</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {selectedReporteDetail.created_at
                          ? new Date(selectedReporteDetail.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Análisis General (Fase 1) - MOVIDO AL PRINCIPIO */}
                  {selectedReporteDetail.analisis_general && (
                    <View style={{ width: '100%', marginBottom: 16, gap: 10 }}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Análisis del Empleado (Fase 1)</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>
                          {selectedReporteDetail.analisis_general}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Precio Cotización - MOVIDO AL PRINCIPIO */}
                  {selectedReporteDetail.precio_cotizacion && (
                    <View style={{ width: '100%', marginBottom: 16, gap: 10 }}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Precio Cotización</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily, color: '#10b981', fontSize: 16, fontWeight: '700' }]}>
                          ${selectedReporteDetail.precio_cotizacion.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Sección de Fase 2 - Trabajo completado por empleado */}
                  {(selectedReporteDetail.revision || selectedReporteDetail.recomendaciones || selectedReporteDetail.reparacion || selectedReporteDetail.recomendaciones_adicionales || selectedReporteDetail.materiales_refacciones) && (
                    <>
                      <View style={{ marginTop: 20, marginBottom: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#334155' }}>
                        <Text style={[styles.detailFieldLabel, { fontFamily, fontSize: 14, fontWeight: '700', color: '#06b6d4' }]}>Fase 2 - Trabajo Completado por Empleado</Text>
                      </View>

                      {selectedReporteDetail.revision && (
                        <View style={{ width: '100%', marginBottom: 16, gap: 10 }}>
                          <Text style={[styles.detailFieldLabel, { fontFamily }]}>Revisión</Text>
                          <View style={styles.detailValueBox}>
                            <Text style={[styles.detailValueText, { fontFamily }]}>
                              {selectedReporteDetail.revision}
                            </Text>
                          </View>
                        </View>
                      )}

                      {selectedReporteDetail.recomendaciones && (
                        <View style={{ width: '100%', marginBottom: 16, gap: 10 }}>
                          <Text style={[styles.detailFieldLabel, { fontFamily }]}>Recomendaciones</Text>
                          <View style={styles.detailValueBox}>
                            <Text style={[styles.detailValueText, { fontFamily }]}>
                              {selectedReporteDetail.recomendaciones}
                            </Text>
                          </View>
                        </View>
                      )}

                      {selectedReporteDetail.reparacion && (
                        <View style={{ width: '100%', marginBottom: 16, gap: 10 }}>
                          <Text style={[styles.detailFieldLabel, { fontFamily }]}>Reparación Realizada</Text>
                          <View style={styles.detailValueBox}>
                            <Text style={[styles.detailValueText, { fontFamily }]}>
                              {selectedReporteDetail.reparacion}
                            </Text>
                          </View>
                        </View>
                      )}

                      {selectedReporteDetail.recomendaciones_adicionales && (
                        <View style={styles.detailField}>
                          <Text style={[styles.detailFieldLabel, { fontFamily }]}>Recomendaciones Adicionales</Text>
                          <View style={styles.detailValueBox}>
                            <Text style={[styles.detailValueText, { fontFamily }]}>
                              {selectedReporteDetail.recomendaciones_adicionales}
                            </Text>
                          </View>
                        </View>
                      )}

                      {selectedReporteDetail.materiales_refacciones && (
                        <View style={styles.detailField}>
                          <Text style={[styles.detailFieldLabel, { fontFamily }]}>Materiales / Refacciones Utilizadas</Text>
                          <View style={styles.detailValueBox}>
                            <Text style={[styles.detailValueText, { fontFamily }]}>
                              {selectedReporteDetail.materiales_refacciones}
                            </Text>
                          </View>
                        </View>
                      )}
                    </>
                  )}

                  {/* Fotos y Videos */}
                  {cargandoArchivos ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Cargando archivos...</Text>
                    </View>
                  ) : null}

                  {!cargandoArchivos && archivosReporte.length > 0 && (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Archivos Adjuntos ({archivosReporte.length})</Text>
                      <View style={styles.archivosContainer}>
                        {archivosReporte.map((archivo, idx) => {
                          console.log(`[ADMIN] Rendering archivo ${idx}:`, {
                            tipo: archivo.tipo_archivo,
                            url: archivo.cloudflare_url
                          });
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

              <View style={styles.detailFooter}>
                <TouchableOpacity
                  style={styles.detailCloseButton}
                  onPress={() => {
                    setShowReporteDetailModal(false);
                    setSelectedReporteDetail(null);
                    setArchivosReporte([]);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.detailCloseText, { fontFamily }]}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }

      {/* Modal para visualizar archivo en grande */}
      {
        showArchivoModal && archivoVisualizando && (
          <View style={styles.overlayHeavy}>
            <View style={styles.archivoModalContent}>
              <TouchableOpacity
                onPress={() => {
                  setShowArchivoModal(false);
                  setArchivoVisualizando(null);
                }}
                style={styles.archivoModalClose}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              {archivoVisualizando.tipo === 'foto' ? (
                <Image
                  source={{ uri: archivoVisualizando.url }}
                  style={styles.archivoModalImage}
                  resizeMode="contain"
                />
              ) : (
                <Video
                  source={{ uri: archivoVisualizando.url }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="contain"
                  useNativeControls
                  style={styles.archivoModalVideo}
                />
              )}

              <Text style={[styles.archivoModalName, { fontFamily }]}>
                {archivoVisualizando.nombre}
              </Text>
            </View>
          </View>
        )
      }

      {/* Modal de Detalle de Encuesta */}
      {
        showEncuestaDetailModal && selectedEncuesta && (
          <View style={styles.overlay}>
            <View style={[styles.detailModal, isMobile && styles.largeModalMobile]}>
              {/* Header específico para encuestas */}
              <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1f2937', marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: '#fff', fontSize: isMobile ? 18 : 20, fontWeight: '800' }, { fontFamily }]}>
                    Encuesta de Satisfacción
                  </Text>
                  <Text style={[{ color: '#94a3b8', fontSize: isMobile ? 12 : 13, marginTop: 4 }, { fontFamily }]}>
                    {selectedEncuesta.empresa || 'Sin empresa'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowEncuestaDetailModal(false);
                    setSelectedEncuesta(null);
                  }}
                  style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(30, 41, 59, 0.8)', alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={[styles.detailScroll, isMobile && styles.detailScrollMobile]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                {/* Información compacta de la encuesta */}
                <View style={{ gap: isMobile ? 10 : 12, marginBottom: 20 }}>
                  {selectedEncuesta.cliente_nombre ? (
                    <View style={{ gap: 4 }}>
                      <Text style={[{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }, { fontFamily }]}>
                        CLIENTE
                      </Text>
                      <View>
                        <Text style={[{ fontSize: isMobile ? 12 : 13, color: '#fff', fontWeight: '600' }, { fontFamily }]}>
                          {selectedEncuesta.cliente_nombre}
                        </Text>
                        <Text style={[{ fontSize: 11, color: '#64748b', marginTop: 2 }, { fontFamily }]}>
                          {selectedEncuesta.cliente_email}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.empleado_nombre ? (
                    <View style={{ gap: 4 }}>
                      <Text style={[{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }, { fontFamily }]}>
                        EVALUADOR
                      </Text>
                      <View>
                        <Text style={[{ fontSize: isMobile ? 12 : 13, color: '#fff', fontWeight: '600' }, { fontFamily }]}>
                          {selectedEncuesta.empleado_nombre}
                        </Text>
                        <Text style={[{ fontSize: 11, color: '#64748b', marginTop: 2 }, { fontFamily }]}>
                          {selectedEncuesta.empleado_email}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.created_at ? (
                    <View style={{ gap: 4 }}>
                      <Text style={[{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }, { fontFamily }]}>
                        FECHA
                      </Text>
                      <View>
                        <Text style={[{ fontSize: isMobile ? 12 : 13, color: '#06b6d4', fontWeight: '600' }, { fontFamily }]}>
                          {new Date(selectedEncuesta.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                        <Text style={[{ fontSize: 11, color: '#64748b', marginTop: 2 }, { fontFamily }]}>
                          {new Date(selectedEncuesta.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>

                {/* Separador */}
                <View style={{ height: 1, backgroundColor: '#1f2937', marginVertical: 16 }} />

                {/* Preguntas y Respuestas */}
                <View style={{ gap: 12 }}>
                  <Text style={[{ color: '#06b6d4', fontSize: isMobile ? 12 : 13, fontWeight: '700' }, { fontFamily }]}>
                    EVALUACIÓN DE ATRIBUTOS
                  </Text>

                  {selectedEncuesta.trato_equipo ? (
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderLeftWidth: 3, borderLeftColor: '#06b6d4', padding: isMobile ? 10 : 12, borderRadius: 6, gap: 8 }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: isMobile ? 12 : 13, fontWeight: '600' }, { fontFamily }]}>
                        Trato del equipo técnico
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={[{ color: '#06b6d4', fontSize: isMobile ? 11 : 12 }, { fontFamily }]}>
                          {selectedEncuesta.trato_equipo}
                        </Text>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={[{ color: '#0b1220', fontSize: isMobile ? 9 : 10, fontWeight: '700' }, { fontFamily }]}>
                            ★ {selectedEncuesta.trato_equipo}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.equipo_tecnico ? (
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderLeftWidth: 3, borderLeftColor: '#06b6d4', padding: isMobile ? 10 : 12, borderRadius: 6, gap: 8 }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: isMobile ? 12 : 13, fontWeight: '600' }, { fontFamily }]}>
                        Desempeño del equipo técnico
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={[{ color: '#06b6d4', fontSize: isMobile ? 11 : 12 }, { fontFamily }]}>
                          {selectedEncuesta.equipo_tecnico}
                        </Text>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={[{ color: '#0b1220', fontSize: isMobile ? 9 : 10, fontWeight: '700' }, { fontFamily }]}>
                            ★ {selectedEncuesta.equipo_tecnico}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.personal_administrativo ? (
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderLeftWidth: 3, borderLeftColor: '#06b6d4', padding: isMobile ? 10 : 12, borderRadius: 6, gap: 8 }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: isMobile ? 12 : 13, fontWeight: '600' }, { fontFamily }]}>
                        Atención del personal administrativo
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={[{ color: '#06b6d4', fontSize: isMobile ? 11 : 12 }, { fontFamily }]}>
                          {selectedEncuesta.personal_administrativo}
                        </Text>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={[{ color: '#0b1220', fontSize: isMobile ? 9 : 10, fontWeight: '700' }, { fontFamily }]}>
                            ★ {selectedEncuesta.personal_administrativo}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.rapidez ? (
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderLeftWidth: 3, borderLeftColor: '#06b6d4', padding: isMobile ? 10 : 12, borderRadius: 6, gap: 8 }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: isMobile ? 12 : 13, fontWeight: '600' }, { fontFamily }]}>
                        Rapidez en la solución del problema
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={[{ color: '#06b6d4', fontSize: isMobile ? 11 : 12 }, { fontFamily }]}>
                          {selectedEncuesta.rapidez}
                        </Text>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={[{ color: '#0b1220', fontSize: isMobile ? 9 : 10, fontWeight: '700' }, { fontFamily }]}>
                            ★ {selectedEncuesta.rapidez}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.costo_calidad ? (
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderLeftWidth: 3, borderLeftColor: '#06b6d4', padding: isMobile ? 10 : 12, borderRadius: 6, gap: 8 }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: isMobile ? 12 : 13, fontWeight: '600' }, { fontFamily }]}>
                        Relación costo - calidad
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={[{ color: '#06b6d4', fontSize: isMobile ? 11 : 12 }, { fontFamily }]}>
                          {selectedEncuesta.costo_calidad}
                        </Text>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={[{ color: '#0b1220', fontSize: isMobile ? 9 : 10, fontWeight: '700' }, { fontFamily }]}>
                            ★ {selectedEncuesta.costo_calidad}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.recomendacion ? (
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderLeftWidth: 3, borderLeftColor: '#06b6d4', padding: isMobile ? 10 : 12, borderRadius: 6, gap: 8 }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: isMobile ? 12 : 13, fontWeight: '600' }, { fontFamily }]}>
                        ¿Recomendaría nuestros servicios a otros clientes?
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={[{ color: '#06b6d4', fontSize: isMobile ? 11 : 12 }, { fontFamily }]}>
                          {selectedEncuesta.recomendacion}
                        </Text>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={[{ color: '#0b1220', fontSize: isMobile ? 9 : 10, fontWeight: '700' }, { fontFamily }]}>
                            ★ {selectedEncuesta.recomendacion}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {selectedEncuesta.satisfaccion ? (
                    <View style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderLeftWidth: 3, borderLeftColor: '#06b6d4', padding: isMobile ? 10 : 12, borderRadius: 6, gap: 8 }}>
                      <Text style={[{ color: '#cbd5e1', fontSize: isMobile ? 12 : 13, fontWeight: '600' }, { fontFamily }]}>
                        Nivel de satisfacción general
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ backgroundColor: '#06b6d4', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={[{ color: '#0b1220', fontSize: isMobile ? 10 : 11, fontWeight: '700' }, { fontFamily }]}>
                            ★ {selectedEncuesta.satisfaccion} / 5
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              </ScrollView>

              <View style={styles.detailFooter}>
                <TouchableOpacity
                  style={styles.detailCloseButton}
                  onPress={() => {
                    setShowEncuestaDetailModal(false);
                    setSelectedEncuesta(null);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.detailCloseText, { fontFamily }]}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }

      {
        showTareasModal && (
          <Pressable style={styles.overlay} onPress={() => setShowTareasModal(false)}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
                <View style={styles.modalHeaderRow}>
                  <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(249, 115, 22, 0.2)', borderColor: 'rgba(249, 115, 22, 0.5)' }]}>
                    <Ionicons name="create-outline" size={22} color="#fb923c" />
                  </View>
                  <Text style={[styles.modalTitle, { fontFamily }]}>Crear Nueva Tarea</Text>
                </View>

                {tareasError ? (
                  <View style={styles.errorBox}>
                    <Text style={[styles.errorText, { fontFamily }]}>{tareasError}</Text>
                  </View>
                ) : null}

                {tareasExito ? (
                  <View style={[styles.errorBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981' }]}>
                    <Text style={[styles.errorText, { color: '#86efac' }]}>✓ Tarea creada exitosamente</Text>
                  </View>
                ) : null}

                <View style={styles.modalForm}>
                  {/* Admin Name - Read Only */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { fontFamily }]}>Creado por</Text>
                    <View style={[styles.formInputDisabled, { paddingHorizontal: 12, justifyContent: 'center' }]}>
                      <Text style={[styles.formInputText, { color: '#9ca3af' }]}>{usuario?.nombre || 'Admin'}</Text>
                    </View>
                  </View>

                  {/* Empleado Selector */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { fontFamily }]}>Asignar a empleado*</Text>
                    <TouchableOpacity
                      style={[styles.formInput, { paddingRight: 12 }]}
                      onPress={() => setShowEmpleadoDropdown(!showEmpleadoDropdown)}
                    >
                      <Text style={[styles.formInputText, { color: selectedEmpleado ? '#f0f9ff' : '#9ca3af' }]}>
                        {selectedEmpleado
                          ? empleados.find(e => e.email === selectedEmpleado)?.nombre + ' (' + selectedEmpleado + ')'
                          : 'Selecciona un empleado'
                        }
                      </Text>
                      <Ionicons name={showEmpleadoDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
                    </TouchableOpacity>

                    {showEmpleadoDropdown && (
                      <View style={[styles.dropdownList, { maxHeight: 250 }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                          {empleados.length === 0 ? (
                            <View style={styles.dropdownItem}>
                              <Text style={[styles.dropdownItemText, { color: '#9ca3af' }]}>
                                No hay empleados disponibles
                              </Text>
                            </View>
                          ) : (
                            empleados.map((empleado, index) => (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.dropdownItem,
                                  selectedEmpleado === empleado.email && { backgroundColor: 'rgba(10, 184, 111, 0.2)' }
                                ]}
                                onPress={() => {
                                  setSelectedEmpleado(empleado.email);
                                  setShowEmpleadoDropdown(false);
                                }}
                              >
                                <Text style={[styles.dropdownItemText, { color: '#f0f9ff' }]}>
                                  {empleado.nombre} ({empleado.email})
                                </Text>
                              </TouchableOpacity>
                            ))
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Descripción */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { fontFamily }]}>Descripción de la tarea*</Text>
                    <TextInput
                      style={[styles.formTextArea, { fontFamily, color: '#f0f9ff' }]}
                      placeholder="Describe la tarea a realizar..."
                      placeholderTextColor="#6b7280"
                      multiline
                      numberOfLines={4}
                      value={tareasDescripcion}
                      onChangeText={setTareasDescripcion}
                      editable={!creandoTarea}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalSecondary}
                    onPress={() => setShowTareasModal(false)}
                    disabled={creandoTarea}
                  >
                    <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <LinearGradient
                    colors={['#ea580c', '#f97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalPrimary}
                  >
                    <TouchableOpacity
                      onPress={handleCrearTarea}
                      disabled={creandoTarea}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.modalPrimaryText, { fontFamily }]}>
                        {creandoTarea ? 'Creando...' : 'Crear Tarea'}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Pressable>
        )
      }

      {/* Modal de Gestión de Usuarios */}
      {
        showGestionUsuariosModal && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
              <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ backgroundColor: '#0891b2', borderRadius: 12, padding: 10 }}>
                    <Ionicons name="people-outline" size={24} color="#06b6d4" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]}>Gestión de Usuarios</Text>
                    <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]}>Administrar roles y permisos</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowGestionUsuariosModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Filtros */}
              <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
                {/* Búsqueda por correo */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#334155' }}>
                  <Ionicons name="search-outline" size={18} color="#64748b" />
                  <TextInput
                    style={[{ flex: 1, color: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 10, fontSize: 14 }, { fontFamily }]}
                    placeholder="Buscar por correo..."
                    placeholderTextColor="#64748b"
                    value={filtroCorreo}
                    onChangeText={setFiltroCorreo}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {filtroCorreo.length > 0 && (
                    <TouchableOpacity onPress={() => setFiltroCorreo('')} activeOpacity={0.7}>
                      <Ionicons name="close-circle" size={18} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filtro por estado */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setFiltroEstado('todos')}
                    style={[
                      { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
                      filtroEstado === 'todos'
                        ? { backgroundColor: '#1e40af', borderColor: '#2563eb' }
                        : { backgroundColor: '#1e293b', borderColor: '#334155' }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[{ fontSize: 13, fontWeight: '600', color: filtroEstado === 'todos' ? '#93c5fd' : '#94a3b8' }, { fontFamily }]}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFiltroEstado('activo')}
                    style={[
                      { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
                      filtroEstado === 'activo'
                        ? { backgroundColor: '#065f46', borderColor: '#059669' }
                        : { backgroundColor: '#1e293b', borderColor: '#334155' }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[{ fontSize: 13, fontWeight: '600', color: filtroEstado === 'activo' ? '#6ee7b7' : '#94a3b8' }, { fontFamily }]}>
                      Activos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFiltroEstado('inactivo')}
                    style={[
                      { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
                      filtroEstado === 'inactivo'
                        ? { backgroundColor: '#7f1d1d', borderColor: '#991b1b' }
                        : { backgroundColor: '#1e293b', borderColor: '#334155' }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[{ fontSize: 13, fontWeight: '600', color: filtroEstado === 'inactivo' ? '#fca5a5' : '#94a3b8' }, { fontFamily }]}>
                      Inactivos
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {loadingUsuarios ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Text style={[{ color: '#cbd5e1', fontSize: 14 }, { fontFamily }]}>Cargando usuarios...</Text>
                </View>
              ) : usuarios.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="people-outline" size={56} color="#94a3b8" style={{ marginBottom: 16, opacity: 0.4 }} />
                  <Text style={[{ color: '#cbd5e1', fontSize: 15, textAlign: 'center', fontWeight: '600' }, { fontFamily }]}>
                    No hay usuarios registrados
                  </Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                  {usuarios
                    .filter((user) => {
                      // Filtro por correo
                      const matchCorreo = filtroCorreo === '' ||
                        user.email?.toLowerCase().includes(filtroCorreo.toLowerCase());

                      // Filtro por estado
                      const matchEstado = filtroEstado === 'todos' || user.estado === filtroEstado;

                      return matchCorreo && matchEstado;
                    })
                    .map((user) => {
                      const rolColor =
                        user.rol === 'admin' ? '#dc2626' :
                          user.rol === 'empleado' ? '#2563eb' :
                            '#10b981';

                      const rolLabel =
                        user.rol === 'admin' ? 'Administrador' :
                          user.rol === 'empleado' ? 'Empleado' :
                            'Cliente';

                      const estadoActivo = user.estado === 'activo';

                      return (
                        <View key={user.id} style={styles.userCard}>
                          <View style={[styles.userAccentLeft, { backgroundColor: rolColor }]} />
                          <View style={{ flex: 1, padding: 18 }}>
                            {/* Header con nombre y badge de rol */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                              <View style={{ flex: 1, marginRight: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                  <Text style={[styles.userNamePro, { fontFamily }]}>
                                    {user.nombre} {user.apellido}
                                  </Text>
                                  <View style={[styles.rolBadgePro, { backgroundColor: `${rolColor}25`, borderColor: `${rolColor}50` }]}>
                                    <Text style={[styles.rolBadgeTextPro, { color: rolColor, fontFamily }]}>
                                      {rolLabel}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.userInfoSection}>
                                  <View style={styles.userInfoRow}>
                                    <Ionicons name="mail-outline" size={14} color="#64748b" style={{ marginRight: 6 }} />
                                    <Text style={[styles.userInfoText, { fontFamily }]}>{user.email}</Text>
                                  </View>
                                  {user.empresa && (
                                    <View style={styles.userInfoRow}>
                                      <Ionicons name="business-outline" size={14} color="#64748b" style={{ marginRight: 6 }} />
                                      <Text style={[styles.userInfoTextEmpresa, { fontFamily }]}>{user.empresa}</Text>
                                    </View>
                                  )}
                                  {user.telefono && (
                                    <View style={styles.userInfoRow}>
                                      <Ionicons name="call-outline" size={14} color="#64748b" style={{ marginRight: 6 }} />
                                      <Text style={[styles.userInfoText, { fontFamily }]}>{user.telefono}</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>

                            {/* Footer con fecha y acciones */}
                            <View style={styles.userCardFooter}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="calendar-outline" size={12} color="#64748b" />
                                <Text style={[styles.userDatePro, { fontFamily }]}>
                                  {new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => handleEditarUsuario(user)}
                                style={styles.userActionButtonPro}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="create-outline" size={20} color="#60a5fa" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </ScrollView>
              )}
            </View>
          </View>
        )
      }

      {/* Modal de Editar Usuario */}
      {
        showEditUserModal && usuarioEditando && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
              <View style={[styles.modalHeaderRow, isMobile && styles.modalHeaderRowMobile]}>
                <View style={[styles.modalIconWrapper, isMobile && styles.modalIconWrapperMobile, { backgroundColor: 'rgba(30, 64, 175, 0.2)', borderColor: 'rgba(59, 130, 246, 0.5)' }]}>
                  <Ionicons name="create-outline" size={isMobile ? 20 : 22} color="#3b82f6" />
                </View>
                <Text style={[styles.modalTitle, isMobile && styles.modalTitleMobile, { fontFamily, flex: 1 }]} numberOfLines={1}>Editar Usuario</Text>
              </View>

              <ScrollView style={[{ maxHeight: 520 }, isMobile && { maxHeight: 480 }]} showsVerticalScrollIndicator={false}>
                <View style={[{ gap: 16 }, isMobile && { gap: 12 }]}>
                  {errorUsuario && (
                    <View style={styles.alertError}>
                      <Ionicons name="alert-circle" size={18} color="#fca5a5" />
                      <Text style={[styles.alertErrorText, isMobile && { fontSize: 12 }, { fontFamily }]}>{errorUsuario}</Text>
                    </View>
                  )}

                  {exitoUsuario && (
                    <View style={styles.alertSuccess}>
                      <Ionicons name="checkmark-circle" size={18} color="#6ee7b7" />
                      <Text style={[styles.alertSuccessText, { fontFamily }]}>Usuario actualizado exitosamente</Text>
                    </View>
                  )}

                  {/* Información del Usuario */}
                  <View style={[styles.infoPanel, isMobile && styles.infoPanelMobile]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="information-circle" size={isMobile ? 14 : 16} color="#38bdf8" />
                      <Text style={[styles.infoPanelTitle, isMobile && styles.infoPanelTitleMobile, { fontFamily }]}>INFORMACIÓN DE LA CUENTA</Text>
                    </View>
                    <Text style={[styles.infoPanelText, isMobile && styles.infoPanelTextMobile, { fontFamily }]}>
                      Cambiar el rol modificará los permisos y accesos del usuario en el sistema.
                    </Text>
                  </View>

                  {/* Datos Personales */}
                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Nombre*</Text>
                    <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                      <Ionicons name="person-outline" size={isMobile ? 16 : 18} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.formInputPro, isMobile && styles.formInputProMobile, { fontFamily }]}
                        value={editNombre}
                        onChangeText={setEditNombre}
                        placeholder="Nombre"
                        placeholderTextColor="#6b7280"
                        editable={!actualizandoUsuario}
                      />
                    </View>
                  </View>

                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Apellido</Text>
                    <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                      <Ionicons name="person-outline" size={isMobile ? 16 : 18} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.formInputPro, isMobile && styles.formInputProMobile, { fontFamily }]}
                        value={editApellido}
                        onChangeText={setEditApellido}
                        placeholder="Apellido"
                        placeholderTextColor="#6b7280"
                        editable={!actualizandoUsuario}
                      />
                    </View>
                  </View>

                  {/* Contacto */}
                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Email*</Text>
                    <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                      <Ionicons name="mail-outline" size={isMobile ? 16 : 18} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.formInputPro, isMobile && styles.formInputProMobile, { fontFamily }]}
                        value={editEmail}
                        onChangeText={setEditEmail}
                        placeholder="correo@ejemplo.com"
                        placeholderTextColor="#6b7280"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!actualizandoUsuario}
                      />
                    </View>
                  </View>

                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Teléfono</Text>
                    <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                      <Ionicons name="call-outline" size={isMobile ? 16 : 18} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.formInputPro, isMobile && styles.formInputProMobile, { fontFamily }]}
                        value={editTelefono}
                        onChangeText={setEditTelefono}
                        placeholder="1234567890"
                        placeholderTextColor="#6b7280"
                        keyboardType="phone-pad"
                        editable={!actualizandoUsuario}
                      />
                    </View>
                  </View>

                  {/* Empresa y Ciudad */}
                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Empresa</Text>
                    {empresas.length > 0 ? (
                      <>
                        <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                          <Ionicons name="business-outline" size={isMobile ? 16 : 18} color="#64748b" style={styles.inputIcon} />
                          <TouchableOpacity
                            style={[styles.selectInputPro, isMobile && styles.selectInputProMobile]}
                            onPress={() => setShowEmpresaPickerEdit(!showEmpresaPickerEdit)}
                            disabled={actualizandoUsuario}
                          >
                            <Text style={[styles.selectInputText, isMobile && styles.selectInputTextMobile, { fontFamily }]}>
                              {editEmpresa || 'Seleccionar empresa'}
                            </Text>
                            <Ionicons name="chevron-down" size={isMobile ? 16 : 18} color="#64748b" />
                          </TouchableOpacity>
                        </View>
                        {showEmpresaPickerEdit && (
                          <ScrollView style={[styles.selectDropdown, isMobile && { maxHeight: 140 }]} scrollEnabled={true} nestedScrollEnabled={true}>
                            <TouchableOpacity
                              style={[
                                styles.selectItem,
                                isMobile && styles.selectItemMobile,
                                editEmpresa === '' && { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderLeftWidth: 3, borderLeftColor: '#2563eb' }
                              ]}
                              onPress={() => {
                                setEditEmpresa('');
                                setShowEmpresaPickerEdit(false);
                              }}
                            >
                              <Text style={[styles.selectItemText, editEmpresa === '' && styles.selectItemTextHighlight, { fontFamily }]}>Sin empresa</Text>
                            </TouchableOpacity>
                            {empresas.map((emp) => (
                              <TouchableOpacity
                                key={emp.id}
                                style={[
                                  styles.selectItem,
                                  isMobile && styles.selectItemMobile,
                                  editEmpresa === emp.nombre && { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderLeftWidth: 3, borderLeftColor: '#2563eb' }
                                ]}
                                onPress={() => {
                                  setEditEmpresa(emp.nombre);
                                  setShowEmpresaPickerEdit(false);
                                }}
                              >
                                <Text style={[styles.selectItemText, editEmpresa === emp.nombre && styles.selectItemTextHighlight, { fontFamily }]}>{emp.nombre}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </>
                    ) : (
                      <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                        <Ionicons name="business-outline" size={isMobile ? 16 : 18} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.formInputPro, isMobile && styles.formInputProMobile, { fontFamily }]}
                          value={editEmpresa}
                          onChangeText={setEditEmpresa}
                          placeholder="Nombre de la empresa"
                          placeholderTextColor="#6b7280"
                          editable={!actualizandoUsuario}
                        />
                      </View>
                    )}
                  </View>

                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Ciudad</Text>
                    <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                      <Ionicons name="location-outline" size={isMobile ? 16 : 18} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.formInputPro, isMobile && styles.formInputProMobile, { fontFamily }]}
                        value={editCiudad}
                        onChangeText={setEditCiudad}
                        placeholder="Ciudad"
                        placeholderTextColor="#6b7280"
                        editable={!actualizandoUsuario}
                      />
                    </View>
                  </View>

                  {/* Rol y Permisos */}
                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Rol del Usuario*</Text>
                    <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                      <Ionicons
                        name={editRol === 'admin' ? 'shield-checkmark' : editRol === 'empleado' ? 'briefcase-outline' : 'person-circle-outline'}
                        size={isMobile ? 16 : 18}
                        color={editRol === 'admin' ? '#dc2626' : editRol === 'empleado' ? '#2563eb' : '#10b981'}
                        style={styles.inputIcon}
                      />
                      <TouchableOpacity
                        style={[styles.selectInputPro, isMobile && styles.selectInputProMobile]}
                        onPress={() => setShowRolPicker(!showRolPicker)}
                        disabled={actualizandoUsuario}
                      >
                        <Text style={[styles.selectInputText, isMobile && styles.selectInputTextMobile, { fontFamily }]}>
                          {editRol === 'admin' ? 'Administrador' : editRol === 'empleado' ? 'Empleado' : 'Cliente'}
                        </Text>
                        <Ionicons name="chevron-down" size={isMobile ? 16 : 18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    {showRolPicker && (
                      <ScrollView style={[styles.selectDropdown, isMobile && { maxHeight: 120 }]} scrollEnabled={true} nestedScrollEnabled={true}>
                        {['cliente', 'empleado', 'admin'].map((rol) => (
                          <TouchableOpacity
                            key={rol}
                            style={[
                              styles.selectItem,
                              isMobile && styles.selectItemMobile,
                              editRol === rol && { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderLeftWidth: 3, borderLeftColor: '#2563eb' }
                            ]}
                            onPress={() => {
                              setEditRol(rol as 'cliente' | 'empleado' | 'admin');
                              setShowRolPicker(false);
                            }}
                          >
                            <Text style={[styles.selectItemText, editRol === rol && styles.selectItemTextHighlight, { fontFamily }]}>
                              {rol === 'admin' ? 'Administrador' : rol === 'empleado' ? 'Empleado' : 'Cliente'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  {/* Estado de la Cuenta */}
                  <View style={[styles.formGroup, isMobile && styles.formGroupMobile]}>
                    <Text style={[styles.formLabel, isMobile && styles.formLabelMobile, { fontFamily }]}>Estado de la Cuenta*</Text>
                    <View style={[styles.inputWrapper, isMobile && styles.inputWrapperMobile]}>
                      <Ionicons
                        name={editEstado === 'activo' ? 'checkmark-circle' : 'close-circle'}
                        size={isMobile ? 16 : 18}
                        color={editEstado === 'activo' ? '#10b981' : '#ef4444'}
                        style={styles.inputIcon}
                      />
                      <TouchableOpacity
                        style={[styles.selectInputPro, isMobile && styles.selectInputProMobile]}
                        onPress={() => setShowEstadoPicker(!showEstadoPicker)}
                        disabled={actualizandoUsuario}
                      >
                        <Text style={[styles.selectInputText, isMobile && styles.selectInputTextMobile, { fontFamily }]}>
                          {editEstado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Text>
                        <Ionicons name="chevron-down" size={isMobile ? 16 : 18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    {showEstadoPicker && (
                      <ScrollView style={[styles.selectDropdown, isMobile && { maxHeight: 100 }]} scrollEnabled={true} nestedScrollEnabled={true}>
                        <TouchableOpacity
                          style={[
                            styles.selectItem,
                            isMobile && styles.selectItemMobile,
                            editEstado === 'activo' && { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderLeftWidth: 3, borderLeftColor: '#2563eb' }
                          ]}
                          onPress={() => {
                            setEditEstado('activo');
                            setShowEstadoPicker(false);
                          }}
                        >
                          <Text style={[styles.selectItemText, editEstado === 'activo' && styles.selectItemTextHighlight, { fontFamily }]}>Activo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.selectItem,
                            isMobile && styles.selectItemMobile,
                            { borderBottomWidth: 0 },
                            editEstado === 'inactivo' && { backgroundColor: 'rgba(37, 99, 235, 0.15)', borderLeftWidth: 3, borderLeftColor: '#2563eb' }
                          ]}
                          onPress={() => {
                            setEditEstado('inactivo');
                            setShowEstadoPicker(false);
                          }}
                        >
                          <Text style={[styles.selectItemText, editEstado === 'inactivo' && styles.selectItemTextHighlight, { fontFamily }]}>Inactivo</Text>
                        </TouchableOpacity>
                      </ScrollView>
                    )}
                  </View>

                  {/* Información adicional */}
                  {usuarioEditando.created_at && (
                    <View style={styles.infoFooter}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="calendar-outline" size={14} color="#64748b" />
                        <Text style={[styles.infoFooterText, { fontFamily }]}>
                          Registrado: {new Date(usuarioEditando.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={[styles.modalActions, isMobile ? { marginTop: 14, gap: 10 } : { marginTop: 18, gap: 12 }]}>
                <TouchableOpacity
                  style={[styles.cancelButtonPro, isMobile && styles.cancelButtonProMobile]}
                  onPress={() => {
                    setShowEditUserModal(false);
                    setShowRolPicker(false);
                    setShowEstadoPicker(false);
                    setShowEmpresaPickerEdit(false);
                  }}
                  disabled={actualizandoUsuario}
                >
                  <Text style={[styles.cancelButtonTextPro, isMobile && { fontSize: 13 }, { fontFamily }]}>Cancelar</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#2563eb', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.saveButtonPro, isMobile && styles.saveButtonProMobile]}
                >
                  <TouchableOpacity
                    onPress={handleActualizarUsuario}
                    disabled={actualizandoUsuario}
                    activeOpacity={0.85}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={[styles.saveButtonTextPro, isMobile && { fontSize: 13 }, { fontFamily }]}>
                      {actualizandoUsuario ? 'Actualizando...' : 'Guardar Cambios'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        )
      }

      {/* Modal Historial de Tareas */}
      {
        showTareasHistorialModal && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
              <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ backgroundColor: '#0891b2', borderRadius: 12, padding: 10 }}>
                    <Ionicons name="list-outline" size={24} color="#06b6d4" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]}>Historial de Tareas</Text>
                    <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]}>Todas las tareas creadas</Text>
                  </View>
                </View>
                <View style={styles.largeModalActions}>
                  <TouchableOpacity
                    onPress={async () => {
                      setLoadingTareas(true);
                      setErrorTareas('');
                      const { success, data, error } = await obtenerTareasBackend();
                      if (!success) setErrorTareas(error || 'No se pudieron cargar las tareas');
                      else setTareas(data || []);
                      setLoadingTareas(false);
                    }}
                    style={styles.refreshButton}
                  >
                    <Text style={[styles.refreshText, { fontFamily }]}>Actualizar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTareasHistorialModal(false)} style={styles.closeButton} activeOpacity={0.7}>
                    <Ionicons name="close" size={20} color="#cbd5e1" />
                  </TouchableOpacity>
                </View>
              </View>

              {loadingTareas ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={[{ color: '#94a3b8', fontSize: 16 }, { fontFamily }]}>Cargando tareas...</Text>
                </View>
              ) : errorTareas ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="alert-circle" size={40} color="#ef4444" />
                  <Text style={[{ color: '#fca5a5', fontSize: 16, marginTop: 12 }, { fontFamily }]}>{errorTareas}</Text>
                </View>
              ) : tareas.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="document-outline" size={40} color="#64748b" />
                  <Text style={[{ color: '#94a3b8', fontSize: 16, marginTop: 12 }, { fontFamily }]}>No hay tareas creadas</Text>
                </View>
              ) : (
                <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: 12, paddingHorizontal: 20, paddingVertical: 16 }}>
                    {tareas.map((tarea, index) => {
                      const estadoColor = tarea.estado === 'completada' ? '#10b981' :
                        tarea.estado === 'en_proceso' ? '#f59e0b' :
                          tarea.estado === 'rechazada' ? '#ef4444' : '#06b6d4';
                      const estadoLabel = tarea.estado === 'completada' ? 'Completada' :
                        tarea.estado === 'en_proceso' ? 'En Proceso' :
                          tarea.estado === 'rechazada' ? 'Rechazada' : 'Pendiente';

                      return (
                        <View key={index} style={[styles.detailSection, isMobile && { paddingHorizontal: 12, paddingVertical: 12 }]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={[{ color: '#f0f9ff', fontSize: isMobile ? 14 : 16, fontWeight: '700', marginBottom: 8 }, { fontFamily }]}>
                                {tarea.descripcion}
                              </Text>
                            </View>
                            <View style={{ backgroundColor: estadoColor + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: estadoColor + '40' }}>
                              <Text style={[{ color: estadoColor, fontSize: 11, fontWeight: '700' }, { fontFamily }]}>
                                {estadoLabel}
                              </Text>
                            </View>
                          </View>

                          <View style={{ gap: 10, marginTop: 12 }}>
                            {tarea.admin_nombre && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="person-circle-outline" size={16} color="#94a3b8" />
                                <Text style={[{ color: '#cbd5e1', fontSize: 13 }, { fontFamily }]}>
                                  <Text style={{ fontWeight: '600' }}>Creada por:</Text> {tarea.admin_nombre}
                                </Text>
                              </View>
                            )}

                            {tarea.empleado_nombre && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="person-outline" size={16} color="#94a3b8" />
                                <Text style={[{ color: '#cbd5e1', fontSize: 13 }, { fontFamily }]}>
                                  <Text style={{ fontWeight: '600' }}>Asignada a:</Text> {tarea.empleado_nombre}
                                </Text>
                              </View>
                            )}

                            {tarea.created_at && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                                <Text style={[{ color: '#cbd5e1', fontSize: 13 }, { fontFamily }]}>
                                  {new Date(tarea.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              )}

              <View style={[styles.modalActions, { marginTop: 16, gap: 10 }]}>
                <TouchableOpacity
                  style={[styles.modalSecondary, { flex: 1 }]}
                  onPress={() => setShowTareasHistorialModal(false)}
                >
                  <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }

      {/* Modal Inventario del Empleado */}
      {
        showInventarioModal && empleadoSelectedInventario && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.largeModal, isMobile && styles.largeModalMobile]}>
              <View style={[styles.largeModalHeader, isMobile && styles.largeModalHeaderMobile]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ backgroundColor: '#8b5cf6', borderRadius: 12, padding: 10 }}>
                    <Ionicons name="cube-outline" size={24} color="#c4b5fd" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.largeModalTitle, isMobile && styles.largeModalTitleMobile, { fontFamily }]}>Inventario</Text>
                    <Text style={[styles.largeModalSubtitle, isMobile && styles.largeModalSubtitleMobile, { fontFamily }]}>{empleadoSelectedInventario.nombre}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowInventarioModal(false)} activeOpacity={0.7}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {loadingInventarioEmpleado ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={[{ color: '#94a3b8', fontSize: 16 }, { fontFamily }]}>Cargando inventario...</Text>
                </View>
              ) : inventarioEmpleado.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="cube-outline" size={40} color="#64748b" />
                  <Text style={[{ color: '#94a3b8', fontSize: 16, marginTop: 12 }, { fontFamily }]}>Sin herramientas asignadas</Text>
                </View>
              ) : (
                <ScrollView style={[styles.listScroll, isMobile && styles.listScrollMobile]} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: 12, paddingHorizontal: 20, paddingVertical: 16 }}>
                    {inventarioEmpleado.map((herramienta: any, index: number) => {
                      const estadoColor = herramienta.estado === 'devuelta' ? '#10b981' : herramienta.estado === 'perdida' ? '#ef4444' : '#06b6d4';
                      const estadoLabel = herramienta.estado === 'devuelta' ? 'Devuelta' : herramienta.estado === 'perdida' ? 'Perdida' : 'Asignada';

                      return (
                        <View key={index} style={[styles.detailSection, isMobile && { paddingHorizontal: 12, paddingVertical: 12 }]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={[{ color: '#f0f9ff', fontSize: isMobile ? 14 : 16, fontWeight: '700', marginBottom: 4 }, { fontFamily }]}>
                                {herramienta.herramienta_nombre}
                              </Text>
                              <Text style={[{ color: '#cbd5e1', fontSize: 13 }, { fontFamily }]}>
                                Cantidad: <Text style={{ fontWeight: '600' }}>{herramienta.cantidad}</Text>
                              </Text>
                            </View>
                            <View style={{ backgroundColor: estadoColor + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: estadoColor + '40' }}>
                              <Text style={[{ color: estadoColor, fontSize: 11, fontWeight: '700' }, { fontFamily }]}>
                                {estadoLabel}
                              </Text>
                            </View>
                          </View>

                          <View style={{ gap: 10, marginTop: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                              <Text style={[{ color: '#cbd5e1', fontSize: 13 }, { fontFamily }]}>
                                Asignado: {herramienta.created_at ? new Date(herramienta.created_at).toLocaleDateString('es-ES') : 'Fecha desconocida'}
                              </Text>
                            </View>

                            {herramienta.observaciones && (
                              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                <Ionicons name="document-text-outline" size={16} color="#94a3b8" style={{ marginTop: 2 }} />
                                <Text style={[{ color: '#cbd5e1', fontSize: 13, flex: 1 }, { fontFamily }]}>
                                  {herramienta.observaciones}
                                </Text>
                              </View>
                            )}

                            {herramienta.estado === 'asignada' && (
                              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                <TouchableOpacity
                                  style={{ flex: 1, backgroundColor: '#10b98133', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#10b98166' }}
                                  onPress={async () => {
                                    const { success } = await marcarHerramientaComoDevueltaBackend(herramienta.id);
                                    if (success) {
                                      const { success: s2, data } = await obtenerInventarioEmpleadoBackend(empleadoSelectedInventario.id);
                                      if (s2) setInventarioEmpleado(data || []);
                                    }
                                  }}
                                >
                                  <Text style={[{ color: '#6ee7b7', fontSize: 12, fontWeight: '600' }, { fontFamily }]}>Marcar Devuelta</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={{ flex: 1, backgroundColor: '#ef444433', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ef444466' }}
                                  onPress={async () => {
                                    const { success } = await marcarHerramientaComoPerdidaBackend(herramienta.id);
                                    if (success) {
                                      const { success: s2, data } = await obtenerInventarioEmpleadoBackend(empleadoSelectedInventario.id);
                                      if (s2) setInventarioEmpleado(data || []);
                                    }
                                  }}
                                >
                                  <Text style={[{ color: '#fca5a5', fontSize: 12, fontWeight: '600' }, { fontFamily }]}>Marcar Perdida</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              )}

              <View style={[styles.modalActions, { marginTop: 16, gap: 10, paddingHorizontal: 20, paddingVertical: 16 }]}>
                <TouchableOpacity
                  style={[styles.modalSecondary, { flex: 1 }]}
                  onPress={() => setShowInventarioModal(false)}
                >
                  <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalPrimary, { flex: 1, backgroundColor: '#8b5cf6', borderColor: '#a855f7' }]}
                  onPress={() => {
                    setHerramientaNombreInput('');
                    setShowAsignarHerramientaModal(true);
                  }}
                >
                  <Text style={[styles.modalPrimaryText, { fontFamily }]}>+ Asignar Herramienta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }

      {/* Modal Asignar Herramienta */}
      {
        showAsignarHerramientaModal && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
              <View style={styles.modalHeaderRow}>
                <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.5)' }]}>
                  <Ionicons name="add-circle-outline" size={22} color="#86efac" />
                </View>
                <Text style={[styles.modalTitle, { fontFamily }]}>Asignar Herramienta</Text>
              </View>

              {errorAsignacion && (
                <View style={styles.errorBox}>
                  <Text style={[styles.errorText, { fontFamily }]}>{errorAsignacion}</Text>
                </View>
              )}

              <View style={styles.modalForm}>
                {/* Empleado - Selección o Read Only */}
                <View style={[styles.formGroup, { zIndex: 20 }]}>
                  <Text style={[styles.formLabel, { fontFamily }]}>Empleado</Text>
                  {empleadoSelectedInventario ? (
                    <View style={[styles.formInputDisabled, { paddingHorizontal: 12, justifyContent: 'center' }]}>
                      <Text style={[styles.formInputText, { color: '#f0f9ff' }]}>{empleadoSelectedInventario.nombre}</Text>
                      <TouchableOpacity
                        onPress={() => setEmpleadoSelectedInventario(null)}
                        style={{ position: 'absolute', right: 10, padding: 4 }}
                      >
                        <Ionicons name="close-circle" size={18} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.formInput, { paddingRight: 12 }]}
                        onPress={() => setShowInventarioEmpleadoDropdown(!showInventarioEmpleadoDropdown)}
                      >
                        <Text style={[styles.formInputText, { color: '#9ca3af' }]}>
                          Selecciona un empleado
                        </Text>
                        <Ionicons name={showInventarioEmpleadoDropdown ? "chevron-up" : "chevron-down"} size={20} color="#6b7280" />
                      </TouchableOpacity>

                      {showInventarioEmpleadoDropdown && (
                        <View style={[styles.dropdownList, { maxHeight: 200 }]}>
                          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                            {empleadosInventario.length === 0 ? (
                              <View style={styles.dropdownItem}>
                                <Text style={[styles.dropdownItemText, { color: '#9ca3af' }]}>
                                  No hay empleados disponibles
                                </Text>
                              </View>
                            ) : (
                              empleadosInventario.map((empleado, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setEmpleadoSelectedInventario(empleado);
                                    setShowInventarioEmpleadoDropdown(false);
                                  }}
                                >
                                  <Text style={[styles.dropdownItemText, { color: '#f0f9ff' }]}>
                                    {empleado.nombre} ({empleado.email})
                                  </Text>
                                </TouchableOpacity>
                              ))
                            )}
                          </ScrollView>
                        </View>
                      )}
                    </>
                  )}
                </View>

                {/* Herramienta */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { fontFamily }]}>Herramienta*</Text>
                  <TextInput
                    style={[styles.formInput, { fontFamily, color: '#f0f9ff', paddingHorizontal: 12 }]}
                    placeholder="Nombre de la herramienta"
                    placeholderTextColor="#6b7280"
                    value={herramientaNombreInput}
                    onChangeText={setHerramientaNombreInput}
                    editable={!asignandoHerramienta}
                  />
                </View>

                {/* Cantidad */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { fontFamily }]}>Cantidad*</Text>
                  <TextInput
                    style={[styles.formInput, { fontFamily, color: '#f0f9ff', paddingHorizontal: 12 }]}
                    placeholder="Cantidad"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                    value={cantidadHerramienta}
                    onChangeText={setCantidadHerramienta}
                    editable={!asignandoHerramienta}
                  />
                </View>

                {/* Observaciones */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { fontFamily }]}>Observaciones</Text>
                  <TextInput
                    style={[styles.formTextArea, { fontFamily, color: '#f0f9ff' }]}
                    placeholder="Observaciones adicionales..."
                    placeholderTextColor="#6b7280"
                    multiline
                    numberOfLines={3}
                    value={observacionesHerramienta}
                    onChangeText={setObservacionesHerramienta}
                    editable={!asignandoHerramienta}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSecondary}
                  onPress={() => {
                    setShowAsignarHerramientaModal(false);
                    setHerramientaNombreInput('');
                    setCantidadHerramienta('1');
                    setObservacionesHerramienta('');
                    setErrorAsignacion(null);
                  }}
                  disabled={asignandoHerramienta}
                >
                  <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#22c55e', '#86efac']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalPrimary}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      if (!herramientaNombreInput.trim() || !cantidadHerramienta) {
                        setErrorAsignacion('Escribe el nombre de la herramienta y la cantidad');
                        return;
                      }
                      if (!empleadoSelectedInventario) {
                        setErrorAsignacion('Selecciona un empleado');
                        return;
                      }

                      setAsignandoHerramienta(true);
                      const { success, error } = await asignarHerramientaAEmpleadoManualBackend({
                        herramienta_nombre: herramientaNombreInput.trim(),
                        usuario_id: empleadoSelectedInventario.id,
                        cantidad: parseInt(cantidadHerramienta) || 1,
                        observaciones: observacionesHerramienta || null
                      });

                      if (success) {
                        // Recargar inventario si se estaba viendo
                        const { success: s2, data } = await obtenerInventarioEmpleadoBackend(empleadoSelectedInventario.id);
                        if (s2) setInventarioEmpleado(data || []);

                        // Recargar lista de empleados con inventario para actualizar contadores
                        cargarEmpleadosInventario();

                        setShowAsignarHerramientaModal(false);
                        setHerramientaNombreInput('');
                        setCantidadHerramienta('1');
                        setObservacionesHerramienta('');
                        setErrorAsignacion(null);
                        // No reseteamos empleadoSelectedInventario aquí para que el usuario pueda seguir viendo/asignando
                        // O si se prefiere resetear: setEmpleadoSelectedInventario(null);
                      } else {
                        setErrorAsignacion(error || 'Error al asignar herramienta');
                      }
                      setAsignandoHerramienta(false);
                    }}
                    disabled={asignandoHerramienta}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.modalPrimaryText, { fontFamily }]}>
                      {asignandoHerramienta ? 'Asignando...' : 'Asignar'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        )
      }

      {/* Modal para crear nueva herramienta */}
      {
        showCrearHerramientaModal && (
          <View style={styles.overlay}>
            <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
              <View style={styles.modalHeaderRow}>
                <View style={[styles.modalIconWrapper, { backgroundColor: 'rgba(139, 92, 246, 0.2)', borderColor: 'rgba(139, 92, 246, 0.5)' }]}>
                  <Ionicons name="hammer-outline" size={22} color="#c4b5fd" />
                </View>
                <Text style={[styles.modalTitle, { fontFamily }]}>Crear Herramienta</Text>
              </View>

              {crearHerramientaError && (
                <View style={styles.errorBox}>
                  <Text style={[styles.errorText, { fontFamily }]}>{crearHerramientaError}</Text>
                </View>
              )}

              <View style={styles.modalForm}>
                {/* Campo Nombre */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { fontFamily }]}>Nombre de la Herramienta *</Text>
                  <TextInput
                    style={[styles.formInput, { fontFamily, color: '#f0f9ff', paddingHorizontal: 12 }]}
                    placeholder="Ej: Martillo, Taladro..."
                    placeholderTextColor="#6b7280"
                    value={nuevaHerramientaNombre}
                    onChangeText={setNuevaHerramientaNombre}
                    editable={!crearHerramientaLoading}
                  />
                </View>

                {/* Campo Descripción */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { fontFamily }]}>Descripción</Text>
                  <TextInput
                    style={[styles.formTextArea, { fontFamily, color: '#f0f9ff' }]}
                    placeholder="Ej: Herramienta de mano para clavar, perforar..."
                    placeholderTextColor="#6b7280"
                    value={nuevaHerramientaDescripcion}
                    onChangeText={setNuevaHerramientaDescripcion}
                    multiline
                    numberOfLines={3}
                    editable={!crearHerramientaLoading}
                  />
                </View>

                {/* Campo Categoría */}
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { fontFamily }]}>Categoría</Text>
                  <TextInput
                    style={[styles.formInput, { fontFamily, color: '#f0f9ff', paddingHorizontal: 12 }]}
                    placeholder="Ej: Herramientas de Mano, Eléctricas..."
                    placeholderTextColor="#6b7280"
                    value={nuevaHerramientaCategoria}
                    onChangeText={setNuevaHerramientaCategoria}
                    editable={!crearHerramientaLoading}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSecondary}
                  onPress={() => setShowCrearHerramientaModal(false)}
                  disabled={crearHerramientaLoading}
                >
                  <Text style={[styles.modalSecondaryText, { fontFamily }]}>Cancelar</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#8b5cf6', '#a78bfa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalPrimary}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      if (!nuevaHerramientaNombre.trim()) {
                        setCrearHerramientaError('El nombre es requerido');
                        return;
                      }

                      setCrearHerramientaLoading(true);
                      setCrearHerramientaError(null);

                      const { success, error } = await crearHerramientaBackend({
                        nombre: nuevaHerramientaNombre,
                        descripcion: nuevaHerramientaDescripcion || null,
                        categoria: nuevaHerramientaCategoria || null,
                        estado: 'disponible'
                      });

                      if (success) {
                        setNuevaHerramientaNombre('');
                        setNuevaHerramientaDescripcion('');
                        setNuevaHerramientaCategoria('');
                        setShowCrearHerramientaModal(false);
                      } else {
                        setCrearHerramientaError(error || 'Error al crear herramienta');
                      }
                      setCrearHerramientaLoading(false);
                    }}
                    disabled={crearHerramientaLoading}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.modalPrimaryText, { fontFamily }]}>
                      {crearHerramientaLoading ? 'Creando...' : 'Crear Herramienta'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        )
      }
    </SafeAreaView >
  );
}

export default function AdminPanel() {
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
        if (parsedUser.rol !== 'admin') {
          console.warn(`[SEGURIDAD] Usuario ${parsedUser.email} con rol ${parsedUser.rol} intentó acceder a /admin`);
          switch (parsedUser.rol) {
            case 'empleado':
              router.replace('/empleado-panel');
              break;
            default:
              router.replace('/cliente-panel');
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

  return <AdminPanelContent />;
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
    elevation: 8,
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
    flexBasis: 'calc(33.33% - 14px)',
    flexGrow: 1,
    minWidth: 220,
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
  overlayHeavy: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 30,
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
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    shadowOffset: { width: 0, height: 10 },
  },
  modalCardMobile: {
    maxWidth: '96%',
    width: '96%',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    maxHeight: '90%',
    borderRadius: 18,
  },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  modalHeaderRowMobile: { gap: 10, marginBottom: 10 },
  modalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalIconWrapperMobile: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flexShrink: 1 },
  modalTitleMobile: { fontSize: 16, fontWeight: '600' },
  modalBodyText: { color: '#cbd5e1', fontSize: 14, marginBottom: 18 },
  modalActions: { flexDirection: 'row', gap: 14, marginTop: 6 },
  modalActionsMobile: { gap: 10, paddingTop: 4 },
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
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  errorText: { color: '#fca5a5', fontSize: 12, textAlign: 'center', fontWeight: '700' },
  formGroup: { marginBottom: 14 },
  modalFormScroll: { maxHeight: 520 },
  modalFormContent: { paddingBottom: 10 },
  label: { color: '#cbd5e1', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  select: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: { fontSize: 15 },
  selectList: {
    marginTop: 8,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    maxHeight: 260,
  },
  selectDropdown: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e3a8a',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  selectItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 58, 138, 0.3)',
    backgroundColor: '#0f172a',
  },
  selectItemMobile: {
    paddingVertical: 8,
  },
  selectItemText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  selectItemTextHighlight: {
    color: '#2563eb',
    fontWeight: '600',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  passwordInput: { flex: 1, paddingVertical: 10, color: '#fff', fontSize: 15 },
  eyeButton: { paddingLeft: 8, paddingVertical: 8 },
  largeModal: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  largeModalMobile: {
    width: '90%',
    maxWidth: 'none',
    maxHeight: '88%',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 'auto',
  },
  largeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  largeModalHeaderMobile: {
    marginBottom: 8,
    gap: 8,
  },
  largeModalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  largeModalTitleMobile: { fontSize: 18, fontWeight: '700' },
  largeModalSubtitle: { color: '#94a3b8', fontSize: 13 },
  largeModalSubtitleMobile: { fontSize: 12 },
  largeModalActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filtrosContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filtrosContainerMobile: {
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  filtrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  filtrosHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtrosTitle: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '700',
  },
  filtrosActiveBadge: {
    backgroundColor: '#06b6d4',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtrosActiveBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  filtroSection: {
    gap: 8,
  },
  filtroLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
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
    backgroundColor: '#334155',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#475569',
  },
  filtroChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
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
  filtrosResultados: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  filtrosResultadosText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  limpiarFiltrosButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  limpiarFiltrosTextSmall: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
  },
  limpiarFiltrosButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  userAccentLeft: {
    width: 5,
  },
  userName: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  userNamePro: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 4,
  },
  userCompany: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userInfoSection: {
    gap: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
  },
  userInfoTextEmpresa: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  userDate: {
    color: '#64748b',
    fontSize: 11,
  },
  userDatePro: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  rolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  rolBadgePro: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  rolBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rolBadgeTextPro: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  userActionButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#06b6d4',
    borderRadius: 10,
    marginTop: 8,
  },
  userActionButtonPro: {
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  alertError: {
    backgroundColor: '#7f1d1d',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertErrorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  alertSuccess: {
    backgroundColor: '#065f46',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertSuccessText: {
    color: '#6ee7b7',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  infoPanel: {
    backgroundColor: 'rgba(12, 74, 110, 0.4)',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(3, 105, 161, 0.4)',
    gap: 8,
  },
  infoPanelTitle: {
    color: '#bae6fd',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoPanelText: {
    color: '#7dd3fc',
    fontSize: 12,
    lineHeight: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  inputIcon: {
    marginRight: 2,
  },
  formInputPro: {
    flex: 1,
    paddingVertical: 13,
    color: '#f0f9ff',
    fontSize: 15,
  },
  selectInputPro: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  selectInputText: {
    color: '#f0f9ff',
    fontSize: 15,
    flex: 1,
  },
  infoFooter: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
  },
  infoFooterText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  cancelButtonPro: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelButtonTextPro: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonPro: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 14,
  },
  saveButtonTextPro: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  inputWrapperMobile: {
    marginBottom: 2,
  },
  formInputProMobile: {
    paddingVertical: 11,
    fontSize: 14,
  },
  selectInputProMobile: {
    paddingVertical: 11,
  },
  selectInputTextMobile: {
    fontSize: 14,
  },
  infoPanelMobile: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  infoPanelTitleMobile: {
    fontSize: 10,
  },
  infoPanelTextMobile: {
    fontSize: 11,
  },
  alertErrorMobile: {
    padding: 10,
  },
  alertErrorTextMobile: {
    fontSize: 12,
  },
  alertSuccessTextMobile: {
    fontSize: 12,
  },
  formGroupMobile: {
    marginBottom: 10,
  },
  formLabelMobile: {
    fontSize: 12,
  },
  cancelButtonProMobile: {
    paddingVertical: 12,
  },
  saveButtonProMobile: {
    paddingVertical: 12,
  },
  limpiarFiltrosTextLarge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  noResultadosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  noResultadosTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  noResultadosText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 300,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  refreshText: { color: '#67e8f9', fontSize: 12, fontWeight: '700' },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoText: { color: '#94a3b8', fontSize: 14 },
  errorPanel: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  errorPanelText: { color: '#fca5a5', fontSize: 14 },
  listScroll: { maxHeight: 450 },
  listScrollMobile: { maxHeight: 350 },
  listSpacing: { gap: 12 },
  reportCard: {
    backgroundColor: 'rgba(30,41,59,0.5)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportHeaderMobile: { gap: 8, paddingRight: 0 },
  reportHeaderText: { flex: 1, paddingRight: 12 },
  reportTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  reportTitleMobile: { fontSize: 14, fontWeight: '600' },
  reportSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  reportSubtitleMobile: { fontSize: 11 },
  reportMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  reportMetaMobile: { fontSize: 11 },
  reportActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reportActionsMobile: { gap: 6 },
  eyeCard: {
    width: 32,
    height: 32,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  estadoBadgeText: { fontSize: 12, fontWeight: '700' },
  reportComment: { color: '#cbd5e1', fontSize: 13 },
  estadoButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  estadoButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
  },
  estadoButtonText: { fontSize: 12, fontWeight: '700' },
  estadoSoloBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  estadoSoloText: { color: '#6ee7b7', fontSize: 12, fontWeight: '700' },
  detailModal: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  detailModalMobile: {
    width: '90%',
    maxWidth: 'none',
    maxHeight: '88%',
    padding: 12,
    borderRadius: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  detailHeaderMobile: {
    marginBottom: 8,
    gap: 8,
  },
  detailHeaderText: { flex: 1, gap: 4 },
  detailHeaderTextMobile: { gap: 2 },
  detailTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  detailTitleMobile: { fontSize: 18, fontWeight: '700' },
  detailSubtitle: { color: '#94a3b8', fontSize: 13 },
  detailSubtitleMobile: { fontSize: 12 },
  detailScroll: { maxHeight: 520 },
  detailScrollMobile: { maxHeight: 350 },
  detailContent: { gap: 22, paddingTop: 6 },
  detailField: { gap: 10, flex: 1 },
  detailFieldHalf: { minWidth: 160, flexBasis: '48%' },
  detailRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  detailFieldLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  detailValueBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  detailValueText: { color: '#e5e7eb', fontSize: 15, lineHeight: 20, flexWrap: 'wrap', flexShrink: 1 },
  detailSubValue: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  detailPillBox: { paddingVertical: 10, paddingHorizontal: 12 },
  detailPillText: { fontSize: 13, fontWeight: '800' },
  detailFooter: { marginTop: 18 },
  detailCloseButton: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCloseText: { color: '#e5e7eb', fontSize: 15, fontWeight: '700' },
  modalForm: { marginBottom: 14 },
  formLabel: { color: '#cbd5e1', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  formInput: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#f0f9ff',
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formInputDisabled: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#9ca3af',
  },
  formInputText: { fontSize: 14, fontWeight: '500' },
  formTextArea: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  dropdownList: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 250,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  archivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  archivoItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  archivoThumb: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#0f172a',
  },
  videoThumb: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#06b6d4',
  },
  archivoLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  // Estilos para modal de visualización de archivo
  archivoModalContent: {
    width: '90%',
    maxWidth: 800,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  archivoModalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivoModalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 16,
  },
  archivoModalVideo: {
    width: '100%',
    height: 300,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#06b6d4',
  },
  videoPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  archivoModalVideoText: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  archivoModalName: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
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
  /* ESTILOS PARA SISTEMA DE TABS */
  tabsNavigationContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    marginBottom: 28,
    gap: 8,
  },
  tabsNavigationContainerMobile: {
    marginBottom: 20,
    paddingHorizontal: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  tabButtonMobile: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  tabButtonActiveMobile: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  tabContent: {
    width: '100%',
  },
});