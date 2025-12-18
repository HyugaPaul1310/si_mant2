// @ts-nocheck
import { actualizarRolUsuario, actualizarUsuario, eliminarUsuario, eliminarUsuarioPermanente, obtenerTodosLosUsuarios } from '@/lib/auth';
import { obtenerEmpresas, type Empresa } from '@/lib/empresas';
import { actualizarEstadoReporte, asignarReporteAEmpleado, obtenerTodosLosReportes, type EstadoReporte } from '@/lib/reportes';
import { crearTarea, obtenerEmpleados } from '@/lib/tareas';
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
  TextInput,
  TouchableOpacity,
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showTerminadosModal, setShowTerminadosModal] = useState(false);
  const [selectedReporteDetail, setSelectedReporteDetail] = useState<any | null>(null);
  const [showReporteDetailModal, setShowReporteDetailModal] = useState(false);
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
          setUsuario(JSON.parse(user));
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
      const { success, data, error } = await obtenerTodosLosReportes();
      if (!success) setErrorReportes(error || 'No se pudieron cargar los reportes');
      else setReportes(data || []);
      setLoadingReportes(false);
    };
    cargar();
  }, []);

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const { success, data } = await obtenerEmpleados();
        if (success && data) {
          setEmpleados(data);
        } else {
          console.error('Error cargando empleados');
        }
      } catch (error) {
        console.error('Error en cargarEmpleados:', error);
      }
    };
    cargarEmpleados();
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
  // Terminados (contador)
  const reportesTerminadosCount = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'terminado').length,
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
    () => reportes.filter((r) => r.estado !== 'terminado'),
    [reportes]
  );

  const reportesTerminados = useMemo(
    () => reportes.filter((r) => (r.estado || '').toLowerCase() === 'terminado'),
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
    const { success, data, error } = await actualizarEstadoReporte(id, nuevoEstado);
    if (!success) {
      setErrorReportes(error || 'No se pudo actualizar el estado');
    } else if (data) {
      setReportes((prev) => prev.map((r) => (r.id === id ? { ...r, estado: data.estado } : r)));
    }
    setUpdatingId(null);
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
  ];

  const mainOptions = [
    {
      title: 'Historial de Reportes',
      description: 'Ver reportes',
      gradient: ['#2563eb', '#3b82f6'] as const,
      iconName: 'document-text-outline',
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
      title: 'Gestion de inventario',
      description: 'Administrar productos',
      gradient: ['#dc2626', '#ef4444'] as const,
      iconName: 'cube-outline',
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
  ];

  const estadoBadgeStyle = (estado: EstadoReporte) => {
    if (estado === 'pendiente') {
      return { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24' };
    }
    if (estado === 'en_proceso') {
      return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd' };
    }
    if (estado === 'en espera') {
      return { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.4)', text: '#facc15' };
    }
    return { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7' };
  };

  const estadoBotonStyle = (active: boolean) =>
    active
      ? { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)', text: '#bbf7d0' }
      : { bg: '#334155', border: '#475569', text: '#e2e8f0' };

  const estadoDisplay = (estado?: string) => {
    const key = (estado || '').toLowerCase();
    if (key === 'en_proceso') return 'en proceso';
    if (key === 'en_espera') return 'en espera';
    return estado || '';
  };

  const cargarUsuarios = async () => {
    setLoadingUsuarios(true);
    const resultado = await obtenerTodosLosUsuarios();
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
    const resultadoDatos = await actualizarUsuario(usuarioEditando.id, {
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
      const resultadoRol = await actualizarRolUsuario(usuarioEditando.id, editRol);
      if (!resultadoRol.success) {
        setErrorUsuario(resultadoRol.error || 'Error al actualizar rol');
        setActualizandoUsuario(false);
        return;
      }
    }

    // Actualizar estado si cambió
    if (editEstado !== usuarioEditando.estado) {
      if (editEstado === 'inactivo') {
        const resultadoEstado = await eliminarUsuario(usuarioEditando.id);
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
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente este usuario? Esta acción no se puede deshacer y también eliminará su cuenta de correo.')) return;
    
    const resultado = await eliminarUsuarioPermanente(userId);
    if (resultado.success) {
      cargarUsuarios(); // Recargar lista
    }
  };

  const openEmailModalIfOption = (title: string) => {
    if (title === 'Historial de Reportes') {
      setShowHistorialModal(true);
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
      setNewUserState('');
      setShowStatePicker(false);
      setShowNewPassword(false);
      setCreateError(null);
      setPasswordFieldKey((k) => k + 1);
      setShowEmailModal(true);
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
      const result = await crearTarea({
        admin_email: usuario?.email || '',
        admin_nombre: usuario?.nombre || '',
        empleado_email: selectedEmpleado,
        descripcion: tareasDescripcion.trim(),
      });

      if (result.success) {
        setTareasExito(true);
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
    if (!selectedEmpleadoReporte || !reporteAAsignar?.id) {
      setAsignarError('Por favor selecciona un empleado');
      return;
    }

    setAsignandoReporte(true);
    setAsignarError(null);

    try {
      const empleadoData = empleados.find(e => e.email === selectedEmpleadoReporte);
      const result = await asignarReporteAEmpleado(
        reporteAAsignar.id,
        selectedEmpleadoReporte,
        empleadoData?.nombre || 'Empleado'
      );

      if (result.success) {
        // Actualizar la lista de reportes
        const reportesActualizados = reportes.map((r: any) =>
          r.id === reporteAAsignar.id 
            ? { ...r, empleado_asignado_email: selectedEmpleadoReporte, empleado_asignado_nombre: empleadoData?.nombre, estado: 'en_proceso' }
            : r
        );
        setReportes(reportesActualizados);
        
        // Cerrar ambos modales para volver al panel principal
        setShowAsignarEmpleadoModal(false);
        setShowHistorialModal(false);
        setReporteAAsignar(null);
        setSelectedEmpleadoReporte('');
      } else {
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
                        const { registrarUsuario } = await import('../lib/auth');
                        const res = await registrarUsuario({
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
                                setSelectedEmpleadoReporte(empleado.email);
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
            <View style={styles.largeModal}>
              <View style={styles.largeModalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, { fontFamily }]}>Historial de Reportes</Text>
                  <Text style={[styles.largeModalSubtitle, { fontFamily }]}>Todos los reportes y su estado</Text>
                </View>
                <View style={styles.largeModalActions}>
                  <TouchableOpacity
                    onPress={async () => {
                      setLoadingReportes(true);
                      const { success, data, error } = await obtenerTodosLosReportes();
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
              <View style={styles.filtrosContainer}>
                <View style={styles.filtrosHeader}>
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
                  {(filtrosEstado.length > 0 || filtrosPrioridad.length > 0) && (
                    <TouchableOpacity onPress={limpiarFiltros} style={styles.limpiarFiltrosButtonSmall}>
                      <Ionicons name="close-circle" size={16} color="#f87171" />
                      <Text style={[styles.limpiarFiltrosTextSmall, { fontFamily }]}>Limpiar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.filtroSection}>
                  <Text style={[styles.filtroLabel, { fontFamily }]}>
                    <Ionicons name="flag-outline" size={14} color="#94a3b8" /> Estado
                  </Text>
                  <View style={styles.filtroChips}>
                    {[
                      { value: 'pendiente', label: 'Pendiente', icon: 'time-outline', color: '#f59e0b' },
                      { value: 'en_proceso', label: 'En proceso', icon: 'hourglass-outline', color: '#3b82f6' },
                      { value: 'en espera', label: 'En espera', icon: 'pause-circle-outline', color: '#eab308' },
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
                <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.listSpacing}>
                    {reportesFiltrados.map((rep) => {
                      const badge = estadoBadgeStyle(rep.estado);
                      return (
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
                            <View style={styles.reportActions}>
                              <TouchableOpacity
                                onPress={() => {
                                  setSelectedReporteDetail(rep);
                                  setShowReporteDetailModal(true);
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

                          <View style={styles.estadoButtonsRow}>
                            {estadosDisponibles.map((op) => {
                              const active = rep.estado === op.value;
                              const btn = estadoBotonStyle(active);
                              return (
                                <TouchableOpacity
                                  key={op.value}
                                  onPress={() => handleCambiarEstado(rep.id, op.value)}
                                  disabled={updatingId === rep.id}
                                  style={[
                                    styles.estadoButton,
                                    {
                                      backgroundColor: btn.bg,
                                      borderColor: btn.border,
                                      opacity: updatingId === rep.id ? 0.7 : 1,
                                    },
                                  ]}
                                >
                                  <Text style={[styles.estadoButtonText, { fontFamily, color: btn.text }]}>{op.label}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

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
            <View style={styles.largeModal}>
              <View style={styles.largeModalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.largeModalTitle, { fontFamily }]}>Reportes Terminados</Text>
                  <Text style={[styles.largeModalSubtitle, { fontFamily }]}>Todos los reportes completados</Text>
                </View>
                <View style={styles.largeModalActions}>
                  <TouchableOpacity
                    onPress={async () => {
                      setLoadingReportes(true);
                      const { success, data, error } = await obtenerTodosLosReportes();
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
                <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
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
                            onPress={() => {
                              setSelectedReporteDetail(rep);
                              setShowReporteDetailModal(true);
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

        {showReporteDetailModal && selectedReporteDetail && (
          <View style={styles.overlayHeavy}>
            <View style={styles.detailModal}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderText}>
                  <Text style={[styles.detailTitle, { fontFamily }]}>Detalles del reporte</Text>
                  <Text style={[styles.detailSubtitle, { fontFamily }]}>Resumen completo del ticket</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowReporteDetailModal(false);
                    setSelectedReporteDetail(null);
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.detailScroll}>
                <View style={styles.detailContent}>
                  <View style={styles.detailField}>
                    <Text style={[styles.detailFieldLabel, { fontFamily }]}>Equipo / Servicio</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={[styles.detailValueText, { fontFamily }]}>
                        {selectedReporteDetail.equipo_descripcion || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {selectedReporteDetail.modelo ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Modelo</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.modelo}</Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedReporteDetail.serie ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Serie</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.serie}</Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedReporteDetail.usuario_nombre || selectedReporteDetail.usuario_email ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Solicitante</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>
                          {selectedReporteDetail.usuario_nombre} {selectedReporteDetail.usuario_apellido}
                        </Text>
                        <Text style={[styles.detailSubValue, { fontFamily }]}>{selectedReporteDetail.usuario_email}</Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedReporteDetail.empresa ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Empresa</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.empresa}</Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedReporteDetail.sucursal ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Sucursal</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.sucursal}</Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedReporteDetail.direccion ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Dirección</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.direccion}</Text>
                      </View>
                    </View>
                  ) : null}

                  {selectedReporteDetail.comentario ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Comentario / Problema</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.comentario}</Text>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    {selectedReporteDetail.prioridad ? (
                      <View style={[styles.detailField, styles.detailFieldHalf]}>
                        <Text style={[styles.detailFieldLabel, { fontFamily }]}>Prioridad</Text>
                        <View style={styles.detailValueBox}>
                          <Text style={[styles.detailValueText, { fontFamily }]}>{selectedReporteDetail.prioridad}</Text>
                        </View>
                      </View>
                    ) : null}

                    {selectedReporteDetail.estado ? (
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
                    ) : null}
                  </View>

                  {selectedReporteDetail.created_at ? (
                    <View style={styles.detailField}>
                      <Text style={[styles.detailFieldLabel, { fontFamily }]}>Fecha de creación</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={[styles.detailValueText, { fontFamily }]}>
                          {new Date(selectedReporteDetail.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </ScrollView>

              <View style={styles.detailFooter}>
                <TouchableOpacity
                  style={styles.detailCloseButton}
                  onPress={() => {
                    setShowReporteDetailModal(false);
                    setSelectedReporteDetail(null);
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.detailCloseText, { fontFamily }]}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {showTareasModal && (
          <View style={styles.overlay}>
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
          </View>
        )}

        {/* Modal de Gestión de Usuarios */}
        {showGestionUsuariosModal && (
          <View style={styles.overlayHeavy}>
            <View style={[styles.largeModal, isMobile && { maxWidth: '95%', padding: 16 }]}>
              <View style={styles.largeModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ backgroundColor: '#0891b2', borderRadius: 12, padding: 10 }}>
                    <Ionicons name="people-outline" size={24} color="#06b6d4" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.largeModalTitle, { fontFamily }]}>Gestión de Usuarios</Text>
                    <Text style={[styles.largeModalSubtitle, { fontFamily }]}>Administrar roles y permisos</Text>
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
        )}

        {/* Modal de Editar Usuario */}
        {showEditUserModal && usuarioEditando && (
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
        )}
    </SafeAreaView>
  );
}

export default function AdminPanel() {
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
  },
  largeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  largeModalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  largeModalSubtitle: { color: '#94a3b8', fontSize: 13 },
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
  reportHeaderText: { flex: 1, paddingRight: 12 },
  reportTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  reportSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  reportMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  reportActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  detailHeaderText: { flex: 1, gap: 4 },
  detailTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  detailSubtitle: { color: '#94a3b8', fontSize: 13 },
  detailScroll: { maxHeight: 520 },
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
  detailValueText: { color: '#e5e7eb', fontSize: 15, lineHeight: 20 },
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
});