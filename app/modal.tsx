import { crearReporte } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Usuario = {
  email: string;
  nombre: string;
  apellido?: string;
  empresa?: string;
};

export default function GenerarReporteScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Campos del formulario
  const [sucursal, setSucursal] = useState('');
  const [equipoDescripcion, setEquipoDescripcion] = useState('');
  const [equipoModelo, setEquipoModelo] = useState('');
  const [equipoSerie, setEquipoSerie] = useState('');
  const [comentario, setComentario] = useState('');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'urgente'>('media');
  const [direccion, setDireccion] = useState('');
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setUsuario(JSON.parse(user));
        } else {
          Alert.alert('Error', 'No se encontró usuario activo');
          router.back();
        }
      } catch (error) {
        Alert.alert('Error', 'Error al cargar datos del usuario');
        router.back();
      }
    };
    cargarUsuario();
    solicitarPermisos();
  }, [router]);

  const solicitarPermisos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a las fotos');
    }
  };

  const seleccionarImagen = async () => {
    if (imagenes.length >= 3) {
      Alert.alert('Límite alcanzado', 'Solo puedes agregar hasta 3 imágenes');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0].uri) {
        setImagenes([...imagenes, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la imagen');
    }
  };

  const seleccionarVideo = async () => {
    if (video) {
      Alert.alert('Límite alcanzado', 'Solo puedes agregar 1 video');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets[0].uri) {
        const duration = result.assets[0].duration;
        if (duration && duration > 30000) {
          Alert.alert('Video muy largo', 'El video debe durar máximo 30 segundos');
          return;
        }
        setVideo(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el video');
    }
  };

  const eliminarImagen = (index: number) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const eliminarVideo = () => {
    setVideo(null);
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    // Validaciones
    if (!equipoDescripcion.trim()) {
      setErrorMessage('La descripción del equipo es obligatoria');
      return;
    }
    if (!comentario.trim()) {
      setErrorMessage('El comentario es obligatorio');
      return;
    }
    if (comentario.trim().length < 20) {
      setErrorMessage('El comentario debe tener al menos 20 caracteres');
      return;
    }

    if (!usuario?.email || !usuario?.nombre) {
      setErrorMessage('Faltan datos del usuario');
      return;
    }

    setLoading(true);

    try {
      const resultado = await crearReporte({
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        usuario_apellido: usuario.apellido,
        empresa: usuario.empresa,
        sucursal: sucursal.trim() || undefined,
        equipo_descripcion: equipoDescripcion.trim(),
        equipo_modelo: equipoModelo.trim() || undefined,
        equipo_serie: equipoSerie.trim() || undefined,
        comentario: comentario.trim(),
        prioridad,
        direccion_sucursal: direccion.trim() || undefined,
        imagenes_reporte: imagenes.length > 0 ? imagenes : undefined,
        video_url: video || undefined,
      });

      if (!resultado.success) {
        setErrorMessage(resultado.error || 'Error al crear el reporte');
        setLoading(false);
        return;
      }

      // Reporte creado exitosamente: marca bandera, muestra banner y redirige
      setLoading(false);
      setShowSuccessBanner(true);

      await AsyncStorage.setItem('reporte_exito', '1');

      setTimeout(() => {
        router.back();
      }, 900);
    } catch (error: any) {
      setErrorMessage('Ocurrió un error: ' + error.message);
      setLoading(false);
    }
  };

  const prioridades = [
    { value: 'baja', label: 'Baja', color: 'bg-green-500' },
    { value: 'media', label: 'Media', color: 'bg-amber-500' },
    { value: 'urgente', label: 'Urgente', color: 'bg-red-500' },
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 px-5 py-4">
          {/* Header */}
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-slate-900 rounded-lg p-2">
              <Ionicons name="arrow-back" size={20} color="#06b6d4" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white font-bold text-xl">Generar reporte</Text>
              <Text className="text-slate-400 text-xs">Completa la información del servicio</Text>
            </View>
          </View>

          {/* Info del usuario (readonly) */}
          <View className="bg-slate-900 rounded-lg p-3 mb-4 border-l-4 border-cyan-500">
            <View className="flex-row items-center mb-1.5">
              <View className="bg-cyan-500/10 rounded-full p-1.5 mr-2">
                <Ionicons name="person" size={14} color="#06b6d4" />
              </View>
              <Text className="text-cyan-400 font-semibold text-xs uppercase tracking-wide">Solicitante</Text>
            </View>
            <Text className="text-white text-sm font-medium ml-7">
              {usuario?.nombre} {usuario?.apellido}
            </Text>
            {usuario?.empresa && (
              <View className="flex-row items-center mt-1 ml-7">
                <Ionicons name="business" size={12} color="#64748b" />
                <Text className="text-slate-300 text-xs ml-1">{usuario.empresa}</Text>
              </View>
            )}
            <View className="flex-row items-center mt-1 ml-7">
              <Ionicons name="mail" size={12} color="#64748b" />
              <Text className="text-slate-400 text-xs ml-1">{usuario?.email}</Text>
            </View>
          </View>

          {/* Formulario */}
          <View className="space-y-3">
            {/* Sucursal */}
            <View>
              <Text className="text-cyan-400 font-medium text-xs mb-1.5 uppercase tracking-wide">Sucursal</Text>
              <TextInput
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm"
                value={sucursal}
                onChangeText={setSucursal}
                placeholder="Nombre de la sucursal"
                placeholderTextColor="#475569"
              />
            </View>

            {/* Dirección */}
            <View>
              <Text className="text-cyan-400 font-medium text-xs mb-1.5 uppercase tracking-wide">Dirección del servicio</Text>
              <TextInput
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm"
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Calle, número, colonia, ciudad..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            {/* Equipo - Descripción */}
            <View>
              <Text className="text-cyan-400 font-medium text-xs mb-1.5 uppercase tracking-wide">
                Equipo - Descripción <Text className="text-red-400">*</Text>
              </Text>
              <TextInput
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm"
                value={equipoDescripcion}
                onChangeText={setEquipoDescripcion}
                placeholder="Ej: Aire acondicionado, Refrigerador..."
                placeholderTextColor="#475569"
              />
            </View>

            {/* Modelo y Serie en fila */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-cyan-400 font-medium text-xs mb-1.5 uppercase tracking-wide">Modelo</Text>
                <TextInput
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm"
                  value={equipoModelo}
                  onChangeText={setEquipoModelo}
                  placeholder="Modelo"
                  placeholderTextColor="#475569"
                />
              </View>

              <View className="flex-1">
                <Text className="text-cyan-400 font-medium text-xs mb-1.5 uppercase tracking-wide">Serie</Text>
                <TextInput
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm"
                  value={equipoSerie}
                  onChangeText={setEquipoSerie}
                  placeholder="Nº serie"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            {/* Comentario */}
            <View>
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-cyan-400 font-medium text-xs uppercase tracking-wide">
                  Comentario / Problema <Text className="text-red-400">*</Text>
                </Text>
                <Text className={`text-xs ${comentario.length >= 20 ? 'text-green-400' : 'text-slate-500'}`}>
                  {comentario.length}/20 min
                </Text>
              </View>
              <TextInput
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm"
                value={comentario}
                onChangeText={setComentario}
                placeholder="Describe el problema o servicio requerido (mínimo 20 caracteres)..."
                placeholderTextColor="#475569"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Prioridad */}
            <View>
              <Text className="text-cyan-400 font-medium text-xs mb-1.5 uppercase tracking-wide">Prioridad</Text>
              <TouchableOpacity
                onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-2">
                  <View className={`w-2.5 h-2.5 rounded-full ${prioridades.find(p => p.value === prioridad)?.color}`} />
                  <Text className="text-white text-sm capitalize">{prioridad}</Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#475569" />
              </TouchableOpacity>

              {showPriorityPicker && (
                <View className="bg-slate-900 border border-slate-800 rounded-lg mt-1.5">
                  {prioridades.map((p) => (
                    <TouchableOpacity
                      key={p.value}
                      onPress={() => {
                        setPrioridad(p.value);
                        setShowPriorityPicker(false);
                      }}
                      className="px-3 py-2.5 flex-row items-center gap-2.5 border-b border-slate-800 last:border-b-0"
                    >
                      <View className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                      <Text className="text-white text-sm">{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Imágenes */}
            <View className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-cyan-400 font-medium text-xs uppercase tracking-wide">Imágenes del equipo</Text>
                <View className="bg-slate-800 rounded-full px-2 py-0.5">
                  <Text className="text-slate-400 text-xs font-medium">{imagenes.length}/3</Text>
                </View>
              </View>
              
              {imagenes.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-2.5"
                  contentContainerStyle={{ gap: 8 }}
                >
                  {imagenes.map((uri, index) => (
                    <View key={index} className="relative">
                      <Image
                        source={{ uri }}
                        className="w-20 h-20 rounded-lg border border-slate-800"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => eliminarImagen(index)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-5 h-5 items-center justify-center shadow-lg"
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                onPress={seleccionarImagen}
                disabled={imagenes.length >= 3}
                className={`flex-row items-center justify-center gap-2 rounded-lg py-2.5 border ${
                  imagenes.length >= 3
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-cyan-500/10 border-cyan-500/30'
                }`}
              >
                <Ionicons
                  name="camera"
                  size={16}
                  color={imagenes.length >= 3 ? '#475569' : '#06b6d4'}
                />
                <Text className={`text-xs font-medium ${imagenes.length >= 3 ? 'text-slate-500' : 'text-cyan-400'}`}>
                  {imagenes.length >= 3 ? 'Límite alcanzado' : 'Agregar imagen'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Video */}
            <View className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-cyan-400 font-medium text-xs uppercase tracking-wide">Video del equipo</Text>
                <View className="bg-slate-800 rounded-full px-2 py-0.5">
                  <Text className="text-slate-400 text-xs font-medium">{video ? '1/1' : '0/1'}</Text>
                </View>
              </View>
              
              {video && (
                <View className="relative mb-2.5">
                  <View className="bg-slate-800 rounded-lg p-3 flex-row items-center gap-3">
                    <Ionicons name="videocam" size={24} color="#06b6d4" />
                    <Text className="text-white text-xs flex-1" numberOfLines={1}>Video seleccionado (máx 30s)</Text>
                    <TouchableOpacity
                      onPress={eliminarVideo}
                      className="bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                    >
                      <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={seleccionarVideo}
                disabled={!!video}
                className={`flex-row items-center justify-center gap-2 rounded-lg py-2.5 border ${
                  video
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-cyan-500/10 border-cyan-500/30'
                }`}
              >
                <Ionicons
                  name="videocam"
                  size={16}
                  color={video ? '#475569' : '#06b6d4'}
                />
                <Text className={`text-xs font-medium ${video ? 'text-slate-500' : 'text-cyan-400'}`}>
                  {video ? 'Video agregado' : 'Agregar video (máx 30s)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text className="text-red-400 text-xs flex-1">{errorMessage}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`rounded-lg py-3.5 shadow-lg mt-2 ${
                loading
                  ? 'bg-slate-700'
                  : 'bg-cyan-500'
              }`}
            >
              <Text className="text-white font-semibold text-center text-sm">
                {loading ? 'Generando reporte...' : 'Generar reporte'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showSuccessBanner && (
        <View className="absolute bottom-6 left-4 right-4 bg-gradient-to-r from-cyan-500 to-sky-600 border border-cyan-300/60 rounded-2xl px-4 py-3 shadow-xl shadow-cyan-900/40">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="bg-white/20 rounded-full p-2">
                <Ionicons name="sparkles" size={18} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">Reporte enviado</Text>
                <Text className="text-slate-100 text-xs">¡Gracias! El equipo lo revisará enseguida.</Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="white" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
