import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Icons as SVG components
const BellIcon = ({ color = '#fff' }) => (
  <View className="w-6 h-6 items-center justify-center">
    <Text className="text-blue-500 font-black text-lg">◆</Text>
  </View>
);

const ClockIcon = ({ color = '#fff' }) => (
  <View className="w-6 h-6 items-center justify-center">
    <Text className="text-yellow-500 font-black text-lg">◉</Text>
  </View>
);

const CheckIcon = ({ color = '#fff' }) => (
  <View className="w-6 h-6 items-center justify-center">
    <Text className="text-green-500 font-black text-lg">✓</Text>
  </View>
);

const HistoryIcon = () => (
  <View className="w-8 h-8 items-center justify-center">
    <Text className="text-white font-black text-lg">📄</Text>
  </View>
);

const AnalyticsIcon = () => (
  <View className="w-8 h-8 items-center justify-center">
    <Text className="text-white font-black text-lg">📊</Text>
  </View>
);

const ToolsIcon = () => (
  <View className="w-8 h-8 items-center justify-center">
    <Text className="text-white font-black text-lg">⚙️</Text>
  </View>
);

const QRIcon = () => (
  <View className="w-8 h-8 items-center justify-center">
    <Text className="text-white font-black text-lg">⬜</Text>
  </View>
);

const LogoutIcon = () => (
  <View className="w-6 h-6 items-center justify-center">
    <Text className="text-orange-500 font-black">⊠</Text>
  </View>
);

function AdminPanelContent() {
  const router = useRouter();
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 400;
  const isMediumScreen = windowWidth < 600;

  const [notifications, setNotifications] = useState(0);
  const [pending, setPending] = useState(0);
  const [accepted, setAccepted] = useState(2);

  const stats = [
    {
      label: 'Notificaciones',
      value: notifications,
      Icon: BellIcon,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      label: 'Pendientes',
      value: pending,
      Icon: ClockIcon,
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
    },
    {
      label: 'Aceptados',
      value: accepted,
      Icon: CheckIcon,
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      textColor: 'text-green-400',
    },
  ];

  const mainOptions = [
    {
      title: 'Historial\nReportes',
      subtitle: 'Ver reportes anteriores',
      Icon: HistoryIcon,
      bg: 'bg-gradient-to-br from-blue-600 to-blue-500',
      border: 'border-blue-400',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Reportes\nAgrupados',
      subtitle: 'Análisis consolidado',
      Icon: AnalyticsIcon,
      bg: 'bg-gradient-to-br from-cyan-600 to-cyan-500',
      border: 'border-cyan-400',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Herramientas',
      subtitle: 'Configuración avanzada',
      Icon: ToolsIcon,
      bg: 'bg-gradient-to-br from-red-600 to-red-500',
      border: 'border-red-400',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Escanear QR',
      subtitle: 'Escanear códigos',
      Icon: QRIcon,
      bg: 'bg-gradient-to-br from-orange-600 to-orange-500',
      border: 'border-orange-400',
      iconBg: 'bg-white/20',
    },
  ];

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className={`flex-1 ${isSmallScreen ? 'px-4 py-3' : isMediumScreen ? 'px-5 py-4' : 'px-8 py-6'}`}>
          {/* Header */}
          <View className={`flex-row ${isSmallScreen ? 'flex-col gap-3' : 'items-center justify-between gap-4'} mb-6`}>
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl items-center justify-center flex-shrink-0">
                <Text className="text-white font-bold text-lg">OP</Text>
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-cyan-400 font-bold text-base leading-tight">
                  Bienvenid@, f.flores
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Panel de Control
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleLogout}
              className="self-start px-3 py-2 bg-slate-800 bg-opacity-60 rounded-lg border border-slate-700 active:opacity-80"
            >
              <LogoutIcon />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-cyan-400 opacity-20 mb-6" />

          {/* Stats Cards - Responsive Grid */}
          <View className={`gap-3 mb-6 flex-row flex-wrap`}>
            {stats.map((stat, index) => (
              <View
                key={index}
                className={`${isSmallScreen ? 'flex-1 min-w-[32%]' : 'flex-1'} ${stat.bg} border ${stat.border} rounded-2xl p-4`}
              >
                <View className="mb-3">
                  <stat.Icon />
                </View>
                <Text className={`text-2xl font-black text-white mb-1`}>
                  {stat.value}
                </Text>
                <Text className="text-xs text-slate-400 font-medium">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Main Options Title */}
          <Text className={`font-black text-white mb-4 ${isSmallScreen ? 'text-base' : isMediumScreen ? 'text-lg' : 'text-xl'}`}>
            Opciones Principales
          </Text>

          {/* Main Options Grid - Fully Responsive */}
          <View className={`gap-3 mb-6 ${isSmallScreen ? 'flex-col' : isMediumScreen ? 'flex-row flex-wrap' : 'flex-row flex-wrap'}`}>
            {mainOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                className={`${
                  isSmallScreen 
                    ? 'w-full' 
                    : isMediumScreen 
                      ? 'w-[calc(50%-6px)]' 
                      : 'w-[calc(50%-6px)]'
                } ${option.bg} rounded-2xl p-4 border-2 ${option.border}`}
              >
                <View className={`${isSmallScreen ? 'flex-row items-center gap-4' : 'items-center gap-3'}`}>
                  <View className={`${option.iconBg} rounded-xl items-center justify-center ${isSmallScreen ? 'w-12 h-12 flex-shrink-0' : 'w-10 h-10'}`}>
                    <option.Icon />
                  </View>
                  <View className={isSmallScreen ? 'flex-1' : ''}>
                    <Text className={`text-white font-black ${isSmallScreen ? 'text-base' : 'text-sm'} leading-tight`}>
                      {option.title}
                    </Text>
                    <Text className={`text-white text-opacity-80 font-medium ${isSmallScreen ? 'text-xs' : 'text-xs'} mt-0.5`}>
                      {option.subtitle}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions - Responsive */}
          <View className={`gap-3 mt-auto ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
            <TouchableOpacity className={`${isSmallScreen ? 'w-full' : 'flex-1'} bg-gradient-to-r from-red-600 to-red-500 rounded-lg py-3 border border-red-400 active:opacity-90`}>
              <Text className="text-white font-bold text-center text-sm">
                Generar Reporte
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className={`${isSmallScreen ? 'w-full' : 'flex-1'} bg-slate-800 bg-opacity-60 border border-cyan-400 border-opacity-30 rounded-lg py-3 active:opacity-90`}>
              <Text className="text-cyan-400 font-bold text-center text-sm">
                Configuración
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function AdminPanel() {
  return <AdminPanelContent />;
}
