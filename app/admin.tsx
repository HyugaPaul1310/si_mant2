import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


function AdminPanelContent() {
  const router = useRouter();

  const [notifications] = useState(0);
  const [pending] = useState(0);
  const [accepted] = useState(2);

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
  ];

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
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
                  <Text className="text-white font-bold text-xl tracking-wider">OP</Text>
                </View>
                <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </View>
              
              {/* Welcome Text */}
              <View className="flex-1">
                <Text className="text-white font-bold text-xl">Bienvenido</Text>
                <Text className="text-cyan-400 font-semibold text-sm">P.Gonzalez</Text>
                <Text className="text-slate-500 text-xs mt-0.5">Panel de Control</Text>
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
    </SafeAreaView>
  );
}

export default function AdminPanel() {
  return <AdminPanelContent />;
}
