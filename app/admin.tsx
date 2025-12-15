import { actualizarEstadoReporte, obtenerTodosLosReportes, type EstadoReporte } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Admin = {
  nombre?: string;
  email?: string;
};


function AdminPanelContent() {
  const router = useRouter();
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
      iconBg: 'bg-blue-500',
      iconName: 'notifications-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-blue-400',
    },
    {
      label: 'Pendientes',
      value: pending,
      iconBg: 'bg-amber-500',
      iconName: 'time-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-amber-400',
    },
    {
      label: 'Aceptados',
      value: accepted,
      iconBg: 'bg-emerald-500',
      iconName: 'checkmark-circle-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-emerald-400',
    },
  ];

  const mainOptions = [
    {
      title: 'Historial de Reportes',
      description: 'Ver reportes',
      gradient: 'from-blue-600 to-blue-500',
      iconName: 'document-text-outline',
    },
    {
      title: 'Reportes Terminados',
      description: 'Ver reportes terminados',
      gradient: 'from-violet-600 to-violet-500',
      iconName: 'checkmark-circle-outline',
    },
    {
      title: 'Gestion de Usuarios',
      description: 'Administrar permisos de usuarios',
      gradient: 'from-cyan-600 to-cyan-500',
      iconName: 'people-outline',
    },
    {
      title: 'Gestion de inventario',
      description: 'Administrar productos',
      gradient: 'from-red-600 to-red-500',
      iconName: 'cube-outline',
    },
    {
      title: 'Generar Tareas',
      description: 'Crear nuevas tareas para el equipo',
      gradient: 'from-orange-600 to-orange-500',
      iconName: 'create-outline',
    },
    {
      title: 'Generar Correo Electrónico',
      description: 'Redactar y enviar correos',
      gradient: 'from-violet-600 to-violet-500',
      iconName: 'mail-outline',
    },

  ];

  const openEmailModalIfOption = (title: string) => {
    if (title === 'Historial de Reportes') {
      setShowHistorialModal(true);
    } else if (title === 'Reportes Terminados') {
      setShowTerminadosModal(true);
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
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Container with max width for larger screens */}
        <View className="flex-1 px-4 py-5 sm:px-8 sm:py-6 sm:max-w-7xl sm:self-center sm:w-full">
          
          {/* Header Section */}
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              {/* Profile Badge */}
              <View className="relative">
                <View className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Text className="text-white font-bold text-xl tracking-wider">{initials}</Text>
                </View>
                <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </View>
              
              {/* Welcome Text */}
              <View className="flex-1">
                <Text className="text-white font-bold text-xl">Bienvenido <Text className="text-cyan-400">{usuario?.nombre ?? 'Usuario'}</Text></Text>
                <Text className="text-slate-400 text-sm mt-1">Panel de Administrador</Text>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
              onPress={handleLogout}
              className="px-3 py-3 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 active:bg-slate-800 active:scale-95 transition-all duration-150"
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>

          {/* Stats Cards Section */}
          <View className="mb-8 space-y-3 sm:flex-row sm:gap-4 sm:space-y-0">
            {stats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                className={`sm:flex-1 ${stat.cardBg} backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 active:scale-[0.98] transition-transform duration-150`}
              >
                <View className="flex-row items-start justify-between mb-4">
                  <View className={`w-12 h-12 ${stat.iconBg} rounded-xl items-center justify-center shadow-lg`}>
                    <Ionicons name={stat.iconName as any} size={24} color="white" />
                  </View>
                  <View className="bg-slate-700/50 px-2 py-1 rounded-lg">
                    <Text className="text-slate-400 text-xs font-medium">Hoy</Text>
                  </View>
                </View>
                
                <Text className="text-white font-black text-3xl mb-1">
                  {stat.value}
                </Text>
                <Text className="text-slate-400 text-sm font-medium">
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section Title */}
          <View className="mb-5">
            <Text className="text-white font-black text-2xl mb-1">Opciones Principales</Text>
            <Text className="text-slate-400 text-sm">Accede a las herramientas del sistema</Text>
          </View>

          {/* Main Options Grid */}
          <View className="mb-6 space-y-3 sm:flex-row sm:flex-wrap sm:gap-4 sm:space-y-0">
            {mainOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                className={`sm:w-[calc(50%-8px)] bg-gradient-to-br ${option.gradient} rounded-2xl p-6 shadow-xl border-2 border-white/10 active:scale-[0.97] transition-transform duration-150`}
                onPress={() => openEmailModalIfOption(option.title)}
              >
                <View className="flex-row items-center gap-4 sm:flex-col sm:items-start sm:space-y-3 sm:gap-0">
                  {/* Icon Container */}
                  <View className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl items-center justify-center flex-shrink-0">
                    <Ionicons name={option.iconName as any} size={28} color="white" />
                  </View>
                  
                  {/* Text Content */}
                  <View className="flex-1">
                    <Text className="text-white font-black text-lg leading-snug mb-1">
                      {option.title}
                    </Text>
                    <Text className="text-white/80 text-sm font-medium">
                      {option.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      {showLogout && (
        <View className="absolute inset-0 bg-black/70 items-center justify-center px-6 z-10">
          <View className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/50 items-center justify-center">
                <Ionicons name="alert-circle-outline" size={22} color="#f87171" />
              </View>
              <Text className="text-white font-bold text-lg">Cerrar sesión</Text>
            </View>
            <Text className="text-slate-300 text-sm mb-6">
              ¿Seguro que deseas salir? Se cerrará tu sesión en este dispositivo.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800"
                onPress={() => setShowLogout(false)}
              >
                <Text className="text-slate-200 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 border border-red-400"
                onPress={confirmLogout}
              >
                <Text className="text-white font-semibold text-center">Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {showEmailModal && (
        <View className="absolute inset-0 bg-black/70 items-center justify-center px-6 z-10">
          <View className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/50 items-center justify-center">
                <Ionicons name="mail-outline" size={22} color="#a78bfa" />
              </View>
              <Text className="text-white font-bold text-lg">Generar cuenta</Text>
            </View>
            {createError ? (
              <View className="bg-red-500/20 border border-red-400 rounded-lg p-2 mb-3">
                <Text className="text-red-400 text-xs text-center">{createError}</Text>
              </View>
            ) : null}
            <View className="space-y-3 mb-4">
              <View>
                <Text className="text-slate-300 text-xs mb-1">Empresa</Text>
                <TextInput
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  value={newUserCompany}
                  onChangeText={setNewUserCompany}
                  placeholder="Empresa"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View>
                <Text className="text-slate-300 text-xs mb-1">Nombre</Text>
                <TextInput
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  value={newUserName}
                  onChangeText={setNewUserName}
                  placeholder="Nombre completo"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View>
                <Text className="text-slate-300 text-xs mb-1">Apellido</Text>
                <TextInput
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  value={newUserLastName}
                  onChangeText={setNewUserLastName}
                  placeholder="Apellido"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View>
                <Text className="text-slate-300 text-xs mb-1">Correo electrónico</Text>
                <TextInput
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
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
              <View>
                <Text className="text-slate-300 text-xs mb-1">Teléfono</Text>
                <TextInput
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  value={newUserPhone}
                  onChangeText={setNewUserPhone}
                  placeholder="555-555-5555"
                  keyboardType="phone-pad"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View>
                <Text className="text-slate-300 text-xs mb-1">Fecha de nacimiento</Text>
                <TextInput
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  value={newUserBirth}
                  onChangeText={setNewUserBirth}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View>
                <Text className="text-slate-300 text-xs mb-1">Ciudad</Text>
                <TextInput
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  value={newUserCity}
                  onChangeText={setNewUserCity}
                  placeholder="Ciudad"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View>
                <Text className="text-slate-300 text-xs mb-1">Estado (Opcional)</Text>
                <TouchableOpacity
                  onPress={() => setShowStatePicker(!showStatePicker)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                >
                  <Text className={newUserState ? 'text-white' : 'text-slate-400'}>
                    {newUserState || 'Selecciona tu estado'}
                  </Text>
                </TouchableOpacity>
                {showStatePicker && (
                  <View className="bg-slate-800 border border-slate-700 rounded-lg mt-2 max-h-48">
                    <ScrollView>
                      {[
                        'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua','Coahuila','Colima','Ciudad de México','Durango','Guanajuato','Guerrero','Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'
                      ].map((est) => (
                        <TouchableOpacity
                          key={est}
                          onPress={() => {
                            setNewUserState(est);
                            setShowStatePicker(false);
                          }}
                          className="px-3 py-2 border-b border-slate-700"
                        >
                          <Text className="text-white">{est}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <View>
                <Text className="text-slate-300 text-xs mb-1">Contraseña</Text>
                <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-lg px-3">
                  <TextInput
                    key={`pwd-${passwordFieldKey}`}
                    className="flex-1 py-2 text-white"
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
                  <TouchableOpacity onPress={() => setShowNewPassword((v) => !v)} className="ml-2 py-2">
                    <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#a78bfa" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800"
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
                <Text className="text-slate-200 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${creatingUser ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-violet-500 to-violet-600 border border-violet-400'}`}
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
                  // Validaciones básicas
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
              >
                <Text className="text-white font-semibold text-center">{creatingUser ? 'Generando…' : 'Generar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showHistorialModal && (
        <View className="absolute inset-0 bg-black/70 z-30 px-4 items-center justify-center">
          <View className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <View className="flex-row items-center justify-between gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-white font-black text-xl">Historial de Reportes</Text>
                <Text className="text-slate-400 text-sm">Todos los reportes y su estado</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={async () => {
                    setLoadingReportes(true);
                    const { success, data, error } = await obtenerTodosLosReportes();
                    if (!success) setErrorReportes(error || 'No se pudieron cargar los reportes');
                    else setReportes(data || []);
                    setLoadingReportes(false);
                  }}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                >
                  <Text className="text-cyan-300 text-xs font-semibold">Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowHistorialModal(false)}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingReportes && (
              <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <Text className="text-slate-400 text-sm">Cargando reportes...</Text>
              </View>
            )}

            {!loadingReportes && errorReportes ? (
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-3">
                <Text className="text-red-300 text-sm">{errorReportes}</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesPendientes.length === 0 ? (
              <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <Text className="text-slate-400 text-sm">No hay reportes pendientes.</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesPendientes.length > 0 ? (
              <ScrollView className="max-h-[450px]" showsVerticalScrollIndicator={false}>
                <View className="space-y-3">
                  {reportesPendientes.map((rep) => {
                    const estadoColor =
                      rep.estado === 'pendiente'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : rep.estado === 'en_proceso'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : rep.estado === 'en espera'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                    return (
                      <View
                        key={rep.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 pr-3">
                            <Text className="text-white font-semibold text-base" numberOfLines={1}>
                              {rep.equipo_descripcion || 'Equipo / servicio'}
                            </Text>
                            <Text className="text-slate-400 text-xs" numberOfLines={1}>
                              {rep.usuario_nombre} {rep.usuario_apellido} · {rep.usuario_email}
                            </Text>
                            <Text className="text-slate-500 text-xs" numberOfLines={1}>
                              {rep.empresa || 'Sin empresa'} • {rep.sucursal || 'Sin sucursal'}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedReporteDetail(rep);
                                setShowReporteDetailModal(true);
                              }}
                              className="w-8 h-8 bg-slate-700 border border-slate-600 rounded-lg items-center justify-center"
                            >
                              <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                            </TouchableOpacity>
                            <View className={`px-3 py-1 rounded-full border text-xs font-semibold ${estadoColor}`}>
                              {rep.estado}
                            </View>
                          </View>
                        </View>

                        <Text className="text-slate-300 text-sm" numberOfLines={2}>
                          {rep.comentario || 'Sin comentarios'}
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                          {estadosDisponibles.map((op) => (
                            <TouchableOpacity
                              key={op.value}
                              onPress={() => handleCambiarEstado(rep.id, op.value)}
                              disabled={updatingId === rep.id}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                rep.estado === op.value
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                                  : 'bg-slate-700 border-slate-600 text-slate-200'
                              } ${updatingId === rep.id ? 'opacity-70' : ''}`}
                            >
                              {op.label}
                            </TouchableOpacity>
                          ))}
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
        <View className="absolute inset-0 bg-black/70 z-30 px-4 items-center justify-center">
          <View className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <View className="flex-row items-center justify-between gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-white font-black text-xl">Reportes Terminados</Text>
                <Text className="text-slate-400 text-sm">Todos los reportes completados</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={async () => {
                    setLoadingReportes(true);
                    const { success, data, error } = await obtenerTodosLosReportes();
                    if (!success) setErrorReportes(error || 'No se pudieron cargar los reportes');
                    else setReportes(data || []);
                    setLoadingReportes(false);
                  }}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                >
                  <Text className="text-cyan-300 text-xs font-semibold">Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTerminadosModal(false)}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingReportes && (
              <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <Text className="text-slate-400 text-sm">Cargando reportes...</Text>
              </View>
            )}

            {!loadingReportes && errorReportes ? (
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-3">
                <Text className="text-red-300 text-sm">{errorReportes}</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesTerminados.length === 0 ? (
              <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <Text className="text-slate-400 text-sm">No hay reportes terminados.</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && reportesTerminados.length > 0 ? (
              <ScrollView className="max-h-[450px]" showsVerticalScrollIndicator={false}>
                <View className="space-y-3">
                  {reportesTerminados.map((rep) => {
                    return (
                      <View
                        key={rep.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 pr-3">
                            <Text className="text-white font-semibold text-base" numberOfLines={1}>
                              {rep.equipo_descripcion || 'Equipo / servicio'}
                            </Text>
                            <Text className="text-slate-400 text-xs" numberOfLines={1}>
                              {rep.usuario_nombre} {rep.usuario_apellido} · {rep.usuario_email}
                            </Text>
                            <Text className="text-slate-500 text-xs" numberOfLines={1}>
                              {rep.empresa || 'Sin empresa'} • {rep.sucursal || 'Sin sucursal'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedReporteDetail(rep);
                              setShowReporteDetailModal(true);
                            }}
                            className="w-8 h-8 bg-slate-700 border border-slate-600 rounded-lg items-center justify-center"
                          >
                            <Ionicons name="eye-outline" size={16} color="#06b6d4" />
                          </TouchableOpacity>
                        </View>

                        <Text className="text-slate-300 text-sm" numberOfLines={2}>
                          {rep.comentario || 'Sin comentarios'}
                        </Text>

                        <View className="px-3 py-1 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-semibold self-start">
                          <Text className="text-emerald-300">{rep.estado}</Text>
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

      {showReporteDetailModal && selectedReporteDetail && (
        <View className="absolute inset-0 bg-black/70 z-40 px-4 items-center justify-center">
          <View className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <View className="flex-row items-center justify-between gap-3 mb-4">
              <Text className="text-white font-black text-lg flex-1">Detalles del Reporte</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowReporteDetailModal(false);
                  setSelectedReporteDetail(null);
                }}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
              <View className="space-y-4">
                {/* Equipo */}
                <View>
                  <Text className="text-slate-400 text-xs font-semibold mb-1">EQUIPO / SERVICIO</Text>
                  <Text className="text-white text-base">{selectedReporteDetail.equipo_descripcion || 'N/A'}</Text>
                </View>

                {/* Modelo */}
                {selectedReporteDetail.modelo && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">MODELO</Text>
                    <Text className="text-white text-base">{selectedReporteDetail.modelo}</Text>
                  </View>
                )}

                {/* Serie */}
                {selectedReporteDetail.serie && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">SERIE</Text>
                    <Text className="text-white text-base">{selectedReporteDetail.serie}</Text>
                  </View>
                )}

                {/* Solicitante */}
                {(selectedReporteDetail.usuario_nombre || selectedReporteDetail.usuario_email) && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">SOLICITANTE</Text>
                    <Text className="text-white text-base">
                      {selectedReporteDetail.usuario_nombre} {selectedReporteDetail.usuario_apellido}
                    </Text>
                    <Text className="text-slate-400 text-sm">{selectedReporteDetail.usuario_email}</Text>
                  </View>
                )}

                {/* Empresa */}
                {selectedReporteDetail.empresa && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">EMPRESA</Text>
                    <Text className="text-white text-base">{selectedReporteDetail.empresa}</Text>
                  </View>
                )}

                {/* Sucursal */}
                {selectedReporteDetail.sucursal && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">SUCURSAL</Text>
                    <Text className="text-white text-base">{selectedReporteDetail.sucursal}</Text>
                  </View>
                )}

                {/* Dirección */}
                {selectedReporteDetail.direccion && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">DIRECCIÓN</Text>
                    <Text className="text-white text-base">{selectedReporteDetail.direccion}</Text>
                  </View>
                )}

                {/* Comentario */}
                {selectedReporteDetail.comentario && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">COMENTARIO</Text>
                    <Text className="text-white text-base">{selectedReporteDetail.comentario}</Text>
                  </View>
                )}

                {/* Prioridad */}
                {selectedReporteDetail.prioridad && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">PRIORIDAD</Text>
                    <Text className="text-white text-base">{selectedReporteDetail.prioridad}</Text>
                  </View>
                )}

                {/* Estado */}
                {selectedReporteDetail.estado && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">ESTADO</Text>
                    <View
                      className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold self-start ${
                        selectedReporteDetail.estado === 'pendiente'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : selectedReporteDetail.estado === 'en_proceso'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : selectedReporteDetail.estado === 'en espera'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      <Text>{selectedReporteDetail.estado}</Text>
                    </View>
                  </View>
                )}

                {/* Fecha de creación */}
                {selectedReporteDetail.created_at && (
                  <View>
                    <Text className="text-slate-400 text-xs font-semibold mb-1">FECHA DE CREACIÓN</Text>
                    <Text className="text-white text-base">
                      {new Date(selectedReporteDetail.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function AdminPanel() {
  return <AdminPanelContent />;
}
