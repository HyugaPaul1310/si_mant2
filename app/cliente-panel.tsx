import { obtenerReportesPorUsuario } from '@/lib/reportes';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Cliente = {
  nombre?: string;
  apellido?: string;
  email?: string;
  empresa?: string;
};

export default function ClientePanel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Cliente | null>(null);
  const [reportesMes] = useState(12);
  const [enProceso] = useState(3);
  const [resueltos] = useState(9);
  const [showLogout, setShowLogout] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
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

  const finalizados = useMemo(() => reportes.filter((r) => r.estado === 'terminado'), [reportes]);

  const renderReporteCard = (rep: any, isSample = false) => {
    const estadoColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    const prioridadColor =
      rep.prioridad === 'urgente'
        ? 'bg-red-500/20 text-red-200 border-red-500/40'
        : rep.prioridad === 'media'
        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
        : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40';

    const fecha = rep.created_at ? new Date(rep.created_at).toLocaleString() : isSample ? 'Hace un momento' : '';

    return (
      <View
        key={rep.id || `sample-${rep.equipo_descripcion}`}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2"
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-white font-semibold text-base" numberOfLines={1}>
              {rep.equipo_descripcion || 'Equipo / servicio'}
            </Text>
            <Text className="text-slate-500 text-xs">{fecha}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className={`px-3 py-1 rounded-full border text-xs font-semibold ${estadoColor}`}>
              {isSample ? 'Completado' : rep.estado || 'terminado'}
            </View>
            {!isSample && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedReporte(rep);
                  setShowReporteDetail(true);
                }}
                className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-lg items-center justify-center"
              >
                <Ionicons name="eye-outline" size={16} color="#06b6d4" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text className="text-slate-300 text-sm" numberOfLines={2}>
          {rep.comentario || 'Sin comentarios'}
        </Text>

        <View className="flex-row items-center gap-2 mt-1 flex-wrap">
          <View className={`px-3 py-1 rounded-full border text-xs font-semibold ${prioridadColor}`}>
            Prioridad: {rep.prioridad || 'media'}
          </View>
          {rep.sucursal ? (
            <View className="px-3 py-1 rounded-full border border-slate-700 text-slate-300 text-xs">
              Sucursal: {rep.sucursal}
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
      value: reportesMes,
      iconBg: 'bg-cyan-500',
      iconName: 'document-text-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-cyan-400',
    },
    {
      label: 'En proceso',
      value: enProceso,
      iconBg: 'bg-amber-500',
      iconName: 'time-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-amber-400',
    },
    {
      label: 'Resueltos',
      value: resueltos,
      iconBg: 'bg-emerald-500',
      iconName: 'checkmark-done-outline',
      cardBg: 'bg-slate-800/40',
      accent: 'text-emerald-400',
    },
  ];

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
      onPress: () => Alert.alert('Seguimiento', 'Navegación a seguimiento'),
    },
    {
      title: 'Contactar soporte',
      description: 'Chat o correo con el equipo',
      gradient: 'from-slate-700 to-slate-600',
      iconName: 'headset-outline',
      onPress: () => Alert.alert('Soporte', 'Navegación a contacto'),
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
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 px-4 py-5 sm:px-8 sm:py-6 sm:max-w-6xl sm:self-center sm:w-full">
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              <View className="relative">
                <View className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Text className="text-white font-bold text-xl tracking-wider">{initials}</Text>
                </View>
                <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </View>

              <View className="flex-1">
                <Text className="text-white font-bold text-xl">
                  Bienvenido {usuario?.nombre ?? 'Usuario'}{usuario?.apellido ? `, ${usuario.apellido}` : ''}
                </Text>
                <Text className="text-cyan-400 font-semibold text-sm">
                  Empresa {usuario?.empresa ? usuario.empresa : 'Empresa no definida'}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">Panel de Cliente</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              className="px-3 py-3 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 active:bg-slate-800 active:scale-95 transition-all duration-150"
            >
              <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

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

                <Text className="text-white font-black text-3xl mb-1">{stat.value}</Text>
                <Text className="text-slate-400 text-sm font-medium">{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-5">
            <Text className="text-white font-black text-2xl mb-1">Acciones principales</Text>
            <Text className="text-slate-400 text-sm">Genera y consulta tus reportes</Text>
          </View>

          <View className="mb-6 space-y-3 sm:flex-row sm:flex-wrap sm:gap-4 sm:space-y-0">
            {mainOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={option.onPress}
                className={`sm:w-[calc(50%-8px)] bg-gradient-to-br ${option.gradient} rounded-2xl p-6 shadow-xl border-2 border-white/10 active:scale-[0.97] transition-transform duration-150`}
              >
                <View className="flex-row items-center gap-4 sm:flex-col sm:items-start sm:space-y-3 sm:gap-0">
                  <View className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl items-center justify-center flex-shrink-0">
                    <Ionicons name={option.iconName as any} size={28} color="white" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-white font-black text-lg leading-snug mb-1">{option.title}</Text>
                    <Text className="text-white/80 text-sm font-medium">{option.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {showReportModal && (
        <View className="absolute inset-0 bg-black/70 z-30 px-4 items-center justify-center">
          <View className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <View className="flex-row items-center justify-between gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-white font-black text-xl">Mis reportes</Text>
                <Text className="text-slate-400 text-sm">
                  Popup de reportes finalizados (se mantienen visibles aunque estén completados).
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => cargarReportes(usuario?.email)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg"
                >
                  <Text className="text-cyan-300 text-xs font-semibold">Actualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowReportModal(false)}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 mb-3">
              <Text className="text-slate-300 text-xs">
                Aquí solo ves los finalizados; los pendientes/en espera irán en Seguimiento.
              </Text>
            </View>

            {loadingReportes && (
              <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <Text className="text-slate-400 text-sm">Cargando reportes...</Text>
              </View>
            )}

            {!loadingReportes && errorReportes ? (
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <Text className="text-red-300 text-sm">{errorReportes}</Text>
              </View>
            ) : null}

            {!loadingReportes && !errorReportes && finalizados.length === 0 ? (
              <View className="space-y-3">
                <View className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <Text className="text-slate-400 text-sm">Aún no tienes reportes finalizados.</Text>
                </View>
                <View className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4">
                  <Text className="text-emerald-300 text-xs font-semibold mb-2">Ejemplo generado (SQL)</Text>
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
              <ScrollView className="max-h-[420px]" showsVerticalScrollIndicator={false}>
                <View className="space-y-3">
                  {finalizados.map((rep) => renderReporteCard(rep))}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {showReporteDetail && selectedReporte && (
        <View className="absolute inset-0 bg-black/70 z-40 px-4 items-center justify-center">
          <View className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <View className="flex-row items-center justify-between gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-white font-black text-lg">Detalles del reporte</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowReporteDetail(false);
                  setSelectedReporte(null);
                }}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[500px] space-y-3">
              <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                <Text className="text-slate-400 text-xs font-semibold">Equipo / Servicio</Text>
                <Text className="text-white text-sm font-semibold">
                  {selectedReporte.equipo_descripcion || 'No especificado'}
                </Text>
              </View>

              {selectedReporte.equipo_modelo && (
                <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Modelo</Text>
                  <Text className="text-white text-sm">{selectedReporte.equipo_modelo}</Text>
                </View>
              )}

              {selectedReporte.equipo_serie && (
                <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Serie</Text>
                  <Text className="text-white text-sm">{selectedReporte.equipo_serie}</Text>
                </View>
              )}

              <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                <Text className="text-slate-400 text-xs font-semibold">Comentario / Problema</Text>
                <Text className="text-white text-sm">{selectedReporte.comentario || 'Sin comentarios'}</Text>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Prioridad</Text>
                  <Text className="text-white text-sm capitalize">{selectedReporte.prioridad || 'media'}</Text>
                </View>

                <View className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Estado</Text>
                  <Text className="text-emerald-300 text-sm capitalize font-semibold">
                    {selectedReporte.estado || 'terminado'}
                  </Text>
                </View>
              </View>

              {selectedReporte.sucursal && (
                <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Sucursal</Text>
                  <Text className="text-white text-sm">{selectedReporte.sucursal}</Text>
                </View>
              )}

              {selectedReporte.empresa && (
                <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Empresa</Text>
                  <Text className="text-white text-sm">{selectedReporte.empresa}</Text>
                </View>
              )}

              {selectedReporte.direccion_sucursal && (
                <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Dirección</Text>
                  <Text className="text-white text-sm">{selectedReporte.direccion_sucursal}</Text>
                </View>
              )}

              <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                <Text className="text-slate-400 text-xs font-semibold">Fecha de creación</Text>
                <Text className="text-white text-sm">
                  {selectedReporte.created_at
                    ? new Date(selectedReporte.created_at).toLocaleString()
                    : 'No disponible'}
                </Text>
              </View>

              {selectedReporte.usuario_email && (
                <View className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                  <Text className="text-slate-400 text-xs font-semibold">Solicitante</Text>
                  <Text className="text-white text-sm">
                    {selectedReporte.usuario_nombre} {selectedReporte.usuario_apellido}
                  </Text>
                  <Text className="text-slate-400 text-xs">{selectedReporte.usuario_email}</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                setShowReporteDetail(false);
                setSelectedReporte(null);
              }}
              className="mt-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl py-3 items-center border border-slate-600"
            >
              <Text className="text-white font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showSuccessOverlay && (
        <View className="absolute inset-0 bg-black/60 justify-center items-center px-6 z-20">
          <View className="w-full max-w-md bg-slate-900 border border-cyan-400/40 rounded-2xl p-5 shadow-2xl shadow-cyan-900/40">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="bg-cyan-500/15 rounded-full p-2.5">
                <Ionicons name="sparkles" size={22} color="#22d3ee" />
              </View>
              <Text className="text-white font-bold text-lg">Reporte enviado</Text>
            </View>
            <Text className="text-slate-200 text-sm mb-4">
              Tu reporte se generó exitosamente. El equipo lo revisará en breve.
            </Text>
            <TouchableOpacity
              onPress={() => setShowSuccessOverlay(false)}
              className="bg-gradient-to-r from-cyan-500 to-sky-500 rounded-xl py-3 items-center border border-cyan-300/50"
              activeOpacity={0.9}
            >
              <Text className="text-white font-semibold">Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    </SafeAreaView>
  );
}
