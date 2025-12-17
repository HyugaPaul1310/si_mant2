// @ts-nocheck
import { actualizarEstadoReporte, obtenerTodosLosReportes, type EstadoReporte } from '@/lib/reportes';
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
  const [notifications] = useState(0);
  const [pending] = useState(0);
  const [accepted] = useState(2);
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
  const [reportes, setReportes] = useState<any[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [errorReportes, setErrorReportes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [showTerminadosModal, setShowTerminadosModal] = useState(false);
  const [selectedReporteDetail, setSelectedReporteDetail] = useState<any | null>(null);
  const [showReporteDetailModal, setShowReporteDetailModal] = useState(false);

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
  }, [router]);

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
    () => reportes.filter((r) => r.estado === 'terminado'),
    [reportes]
  );

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
      label: 'Notificaciones',
      value: notifications,
      iconBg: '#3b82f6',
      iconName: 'notifications-outline',
      accent: '#60a5fa',
    },
    {
      label: 'Pendientes',
      value: pending,
      iconBg: '#f59e0b',
      iconName: 'time-outline',
      accent: '#fbbf24',
    },
    {
      label: 'Aceptados',
      value: accepted,
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

  const openEmailModalIfOption = (title: string) => {
    if (title === 'Historial de Reportes') {
      setShowHistorialModal(true);
    } else if (title === 'Reportes Terminados') {
      setShowTerminadosModal(true);
    } else if (title === 'Gestion de Empresas') {
      router.push('/gestion-empresas');
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

              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

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
                  <Text style={[styles.label, { fontFamily }]}>Empresa</Text>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={newUserCompany}
                    onChangeText={setNewUserCompany}
                    placeholder="Empresa"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Nombre</Text>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={newUserName}
                    onChangeText={setNewUserName}
                    placeholder="Nombre completo"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Apellido</Text>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={newUserLastName}
                    onChangeText={setNewUserLastName}
                    placeholder="Apellido"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Correo electrónico</Text>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={newUserEmail}
                    onChangeText={setNewUserEmail}
                    placeholder="usuario@correo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Teléfono</Text>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={newUserPhone}
                    onChangeText={handlePhoneChange}
                    placeholder="555-555-5555"
                    keyboardType="phone-pad"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Fecha de nacimiento (opcional)</Text>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={newUserBirth}
                    onChangeText={handleBirthChange}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Ciudad (opcional)</Text>
                  <TextInput
                    style={[styles.input, { fontFamily }]}
                    value={newUserCity}
                    onChangeText={setNewUserCity}
                    placeholder="Ciudad"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Estado (Opcional)</Text>
                  <TouchableOpacity
                    onPress={() => setShowStatePicker(!showStatePicker)}
                    style={styles.select}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.selectText, { fontFamily, color: newUserState ? '#fff' : '#94a3b8' }]}>
                      {newUserState || 'Selecciona tu estado'}
                    </Text>
                  </TouchableOpacity>
                  {showStatePicker && (
                    <View style={styles.selectList}>
                      <ScrollView nestedScrollEnabled>
                        {[
                          'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Coahuila','Colima','Ciudad de México','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'
                        ].map((est) => (
                          <TouchableOpacity
                            key={est}
                            onPress={() => {
                              setNewUserState(est);
                              setShowStatePicker(false);
                            }}
                            style={styles.selectItem}
                          >
                            <Text style={[styles.selectItemText, { fontFamily }]}>{est}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { fontFamily }]}>Contraseña</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      key={`pwd-${passwordFieldKey}`}
                      style={[styles.passwordInput, { fontFamily }]}
                      value={newUserPassword}
                      onChangeText={setNewUserPassword}
                      placeholder="••••••••"
                      secureTextEntry={!showNewPassword}
                      autoCorrect={false}
                      autoComplete="off"
                      textContentType="none"
                      importantForAutofill="no"
                      placeholderTextColor="#64748b"
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword((v) => !v)} style={styles.eyeButton}>
                      <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#a78bfa" />
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

              {!loadingReportes && !errorReportes && reportesPendientes.length === 0 ? (
                <View style={styles.infoBox}>
                  <Text style={[styles.infoText, { fontFamily }]}>No hay reportes pendientes.</Text>
                </View>
              ) : null}

              {!loadingReportes && !errorReportes && reportesPendientes.length > 0 ? (
                <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.listSpacing}>
                    {reportesPendientes.map((rep) => {
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
                                <Text style={[styles.estadoBadgeText, { fontFamily, color: badge.text }]}>{rep.estado}</Text>
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
                          <Text style={[styles.estadoSoloText, { fontFamily }]}>{rep.estado}</Text>
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
                            {selectedReporteDetail.estado}
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
  selectItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  selectItemText: { color: '#fff', fontSize: 14 },
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
});
