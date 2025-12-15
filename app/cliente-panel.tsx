import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Cliente = {
  nombre?: string;
  email?: string;
};

export default function ClientePanel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Cliente | null>(null);
  const [reportesMes] = useState(12);
  const [enProceso] = useState(3);
  const [resueltos] = useState(9);
  const [showLogout, setShowLogout] = useState(false);

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
      onPress: () => Alert.alert('Reportes', 'Navegación a la bandeja de reportes'),
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
                <Text className="text-white font-bold text-xl">Hola, {usuario?.nombre ?? 'Cliente'}</Text>
                <Text className="text-cyan-400 font-semibold text-sm">Panel de Cliente</Text>
                <Text className="text-slate-500 text-xs mt-0.5">Gestiona tus reportes y solicitudes</Text>
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
