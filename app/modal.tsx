import { obtenerSucursalesCliente } from '@/lib/api-backend';
import { crearReporte, subirArchivosReporte } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Usuario = {
  email: string;
  nombre: string;
  apellido?: string;
  empresa?: string;
};

type Sucursal = {
  id: number;
  empresa_id: number;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
};

export default function GenerarReporteScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fontFamily = Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif';
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Campos del formulario
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal | null>(null);
  const [showSucursalPicker, setShowSucursalPicker] = useState(false);
  const [equipoDescripcion, setEquipoDescripcion] = useState('');
  const [equipoModelo, setEquipoModelo] = useState('');
  const [equipoSerie, setEquipoSerie] = useState('');
  const [comentario, setComentario] = useState('');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'urgente'>('media');
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          setUsuario(userData);

          // Cargar sucursales de la empresa del usuario
          if (userData.email) {
            const resultado = await obtenerSucursalesCliente(userData.email);
            if (resultado.success && resultado.data) {
              setSucursales(resultado.data);
            } else {
              console.error('Error al cargar sucursales:', resultado.error);
            }
          }
        } else {
          Alert.alert('Error', 'No se encontró usuario activo');
          router.back();
        }
      } catch (error) {
        console.error('Error en cargarUsuario:', error);
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
    if (!sucursalSeleccionada) {
      setErrorMessage('Debes seleccionar una sucursal');
      return;
    }
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
      // Paso 1: Crear el reporte
      const resultado = await crearReporte({
        usuario_email: usuario.email,
        usuario_nombre: usuario.nombre,
        usuario_apellido: usuario.apellido,
        empresa: usuario.empresa,
        sucursal: sucursalSeleccionada.nombre,
        sucursal_id: sucursalSeleccionada.id,
        equipo_descripcion: equipoDescripcion.trim(),
        equipo_modelo: equipoModelo.trim() || undefined,
        equipo_serie: equipoSerie.trim() || undefined,
        comentario: comentario.trim(),
        prioridad,
        direccion_sucursal: sucursalSeleccionada.direccion,
      });

      if (!resultado.success) {
        setErrorMessage(resultado.error || 'Error al crear el reporte');
        setLoading(false);
        return;
      }

      console.log('[MODAL] Respuesta de crearReporte:', resultado);
      console.log('[MODAL] resultado.data:', resultado.data);
      console.log('[MODAL] resultado.data tipo:', typeof resultado.data);
      console.log('[MODAL] resultado.data keys:', Object.keys(resultado.data || {}));
      console.log('[MODAL] resultado.data.id:', resultado.data?.id);
      console.log('[MODAL] resultado.data.reporteId:', resultado.data?.reporteId);
      
      // El backend puede retornar data.id o data.reporteId
      // Usar directamente resultado.data.id si existe, incluso si es 0 (válido en SQL)
      const reporteId = resultado.data?.id !== undefined ? resultado.data.id : (resultado.data?.reporteId || null);
      
      console.log('[MODAL] reporteId extraído:', reporteId);
      console.log('[MODAL] Imágenes:', imagenes.length, 'Video:', !!video);
      console.log('[MODAL] reporteId es válido?:', reporteId !== null && reporteId !== undefined);
      
      // Paso 2: Subir archivos a Cloudflare (si existen y tenemos un ID válido)
      if ((imagenes.length > 0 || video) && reporteId !== null && reporteId !== undefined) {
        console.log('[MODAL] ✓ Iniciando subida de archivos para reporteId:', reporteId);
        const uploadResult = await subirArchivosReporte(
          reporteId,
          imagenes.length > 0 ? imagenes : undefined,
          video || undefined
        );

        if (!uploadResult.success) {
          console.warn('Advertencia al subir archivos:', uploadResult.error);
          // No cancelamos el flujo, el reporte se creó exitosamente
        }
      } else if (imagenes.length > 0 || video) {
        console.warn('[MODAL] ⚠️ No se pudo extraer reporteId válido, saltando subida de archivos');
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showSucursalPicker && !showPriorityPicker}
        style={styles.scrollView}
      >
        <View style={isMobile ? styles.contentMobile : styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/cliente-panel')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#06b6d4" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { fontFamily }]}>Generar reporte</Text>
              <Text style={[styles.headerSubtitle, { fontFamily }]}>Completa la información del servicio</Text>
            </View>
          </View>

          {/* Info del usuario (readonly) */}
          <View style={styles.userInfoBox}>
            <View style={styles.userInfoHeader}>
              <View style={styles.userIconBg}>
                <Ionicons name="person" size={14} color="#06b6d4" />
              </View>
              <Text style={[styles.userInfoLabel, { fontFamily }]}>Solicitante</Text>
            </View>
            <Text style={[styles.userInfoName, { fontFamily }]}>
              {usuario?.nombre} {usuario?.apellido}
            </Text>
            {usuario?.empresa && (
              <View style={styles.userInfoRow}>
                <Ionicons name="business" size={12} color="#64748b" />
                <Text style={[styles.userInfoText, { fontFamily }]}>{usuario.empresa}</Text>
              </View>
            )}
            <View style={styles.userInfoRow}>
              <Ionicons name="mail" size={12} color="#64748b" />
              <Text style={[styles.userInfoEmail, { fontFamily }]}>{usuario?.email}</Text>
            </View>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            {/* Sucursal */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontFamily }]}>
                Sucursal <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowSucursalPicker(!showSucursalPicker)}
                style={styles.priorityButton}
              >
                <View style={styles.priorityButtonContent}>
                  <Ionicons name="location" size={16} color="#06b6d4" />
                  <Text style={[styles.priorityText, { fontFamily }]}>
                    {sucursalSeleccionada?.nombre || 'Selecciona una sucursal'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#475569" />
              </TouchableOpacity>

              {showSucursalPicker && (
                <View style={[styles.priorityPicker, { maxHeight: isMobile ? 280 : 350, zIndex: 10 }]}>
                  <ScrollView scrollEnabled={true} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                    {sucursales.length === 0 ? (
                      <View style={styles.priorityOption}>
                        <Text style={[styles.priorityOptionText, { fontFamily, color: '#94a3b8' }]}>
                          No hay sucursales disponibles
                        </Text>
                      </View>
                    ) : (
                      sucursales.map((sucursal, index) => (
                        <TouchableOpacity
                          key={sucursal.id}
                          onPress={() => {
                            setSucursalSeleccionada(sucursal);
                            setShowSucursalPicker(false);
                          }}
                          style={[
                            styles.priorityOption,
                            index < sucursales.length - 1 && styles.priorityOptionBorder,
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.priorityOptionText, { fontFamily }]}>
                              {sucursal.nombre}
                            </Text>
                            <Text style={[styles.priorityOptionText, { fontFamily, fontSize: 11, color: '#64748b', marginTop: 2 }]}>
                              {sucursal.direccion}
                            </Text>
                          </View>
                          {sucursalSeleccionada?.id === sucursal.id && (
                            <Ionicons name="checkmark-circle" size={18} color="#06b6d4" />
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Dirección (solo lectura, se llena automáticamente) */}
            {sucursalSeleccionada && (
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>Dirección del servicio</Text>
                <View style={[styles.textInputMulti, { backgroundColor: '#1e293b', borderColor: '#334155', paddingVertical: 12 }]}>
                  <Text style={[{ fontFamily, color: '#94a3b8', fontSize: 13 }]}>
                    {sucursalSeleccionada.direccion}
                  </Text>
                </View>
              </View>
            )}

            {/* Equipo - Descripción */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontFamily }]}>
                Equipo - Descripción <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, { fontFamily }]}
                value={equipoDescripcion}
                onChangeText={setEquipoDescripcion}
                placeholder="Ej: Aire acondicionado, Refrigerador..."
                placeholderTextColor="#475569"
              />
            </View>

            {/* Modelo y Serie en fila */}
            <View style={styles.rowContainer}>
              <View style={styles.halfField}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>Modelo</Text>
                <TextInput
                  style={[styles.textInput, { fontFamily }]}
                  value={equipoModelo}
                  onChangeText={setEquipoModelo}
                  placeholder="Modelo"
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.halfField}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>Serie</Text>
                <TextInput
                  style={[styles.textInput, { fontFamily }]}
                  value={equipoSerie}
                  onChangeText={setEquipoSerie}
                  placeholder="Nº serie"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>

            {/* Comentario */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>
                  Comentario / Problema <Text style={styles.requiredMark}>*</Text>
                </Text>
                <Text style={[styles.charCounter, { fontFamily, color: comentario.length >= 20 ? '#4ade80' : '#64748b' }]}>
                  {comentario.length}/20 min
                </Text>
              </View>
              <TextInput
                style={[styles.textInputMulti, { fontFamily, minHeight: 80 }]}
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
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontFamily }]}>Prioridad</Text>
              <TouchableOpacity
                onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                style={styles.priorityButton}
              >
                <View style={styles.priorityButtonContent}>
                  <View style={[styles.priorityDot, { backgroundColor: prioridad === 'urgente' ? '#ef4444' : prioridad === 'media' ? '#f59e0b' : '#22c55e' }]} />
                  <Text style={[styles.priorityText, { fontFamily, textTransform: 'capitalize' }]}>{prioridad}</Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#475569" />
              </TouchableOpacity>

              {showPriorityPicker && (
                <View style={styles.priorityPicker}>
                  {prioridades.map((p, index) => (
                    <TouchableOpacity
                      key={p.value}
                      onPress={() => {
                        setPrioridad(p.value);
                        setShowPriorityPicker(false);
                      }}
                      style={[styles.priorityOption, index < prioridades.length - 1 && styles.priorityOptionBorder]}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: p.value === 'urgente' ? '#ef4444' : p.value === 'media' ? '#f59e0b' : '#22c55e' }]} />
                      <Text style={[styles.priorityOptionText, { fontFamily }]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Imágenes */}
            <View style={styles.mediaBox}>
              <View style={styles.mediaHeader}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>Imágenes del equipo</Text>
                <View style={styles.counterBadge}>
                  <Text style={[styles.counterText, { fontFamily }]}>{imagenes.length}/3</Text>
                </View>
              </View>
              
              {imagenes.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageList}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {imagenes.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image
                        source={{ uri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => eliminarImagen(index)}
                        style={styles.deleteImageButton}
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
                style={[styles.addMediaButton, imagenes.length >= 3 ? styles.addMediaButtonDisabled : styles.addMediaButtonActive]}
              >
                <Ionicons
                  name="camera"
                  size={16}
                  color={imagenes.length >= 3 ? '#475569' : '#06b6d4'}
                />
                <Text style={[styles.addMediaButtonText, { fontFamily, color: imagenes.length >= 3 ? '#64748b' : '#22d3ee' }]}>
                  {imagenes.length >= 3 ? 'Límite alcanzado' : 'Agregar imagen'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Video */}
            <View style={styles.mediaBox}>
              <View style={styles.mediaHeader}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>Video del equipo</Text>
                <View style={styles.counterBadge}>
                  <Text style={[styles.counterText, { fontFamily }]}>{video ? '1/1' : '0/1'}</Text>
                </View>
              </View>
              
              {video && (
                <View style={styles.videoPreviewContainer}>
                  <View style={styles.videoPreview}>
                    <Ionicons name="videocam" size={24} color="#06b6d4" />
                    <Text style={[styles.videoText, { fontFamily }]} numberOfLines={1}>Video seleccionado (máx 30s)</Text>
                    <TouchableOpacity
                      onPress={eliminarVideo}
                      style={styles.deleteVideoButton}
                    >
                      <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={seleccionarVideo}
                disabled={!!video}
                style={[styles.addMediaButton, video ? styles.addMediaButtonDisabled : styles.addMediaButtonActive]}
              >
                <Ionicons
                  name="videocam"
                  size={16}
                  color={video ? '#475569' : '#06b6d4'}
                />
                <Text style={[styles.addMediaButtonText, { fontFamily, color: video ? '#64748b' : '#22d3ee' }]}>
                  {video ? 'Video agregado' : 'Agregar video (máx 30s)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={[styles.errorText, { fontFamily }]}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            >
              <Text style={[styles.submitButtonText, { fontFamily }]}>
                {loading ? 'Generando reporte...' : 'Generar reporte'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showSuccessBanner && (
        <View style={styles.successBanner}>
          <View style={styles.successContent}>
            <View style={styles.successLeft}>
              <View style={styles.successIcon}>
                <Ionicons name="sparkles" size={18} color="#0ea5e9" />
              </View>
              <View style={styles.successTextContainer}>
                <Text style={[styles.successTitle, { fontFamily }]}>Reporte enviado</Text>
                <Text style={[styles.successMessage, { fontFamily }]}>¡Gracias! El equipo lo revisará enseguida.</Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="white" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  contentMobile: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  userInfoBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#06b6d4',
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userIconBg: {
    backgroundColor: '#06b6d41a',
    borderRadius: 20,
    padding: 6,
    marginRight: 8,
  },
  userInfoLabel: {
    color: '#22d3ee',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userInfoName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 28,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 28,
  },
  userInfoText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginLeft: 4,
  },
  userInfoEmail: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  formContainer: {
    gap: 12,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#22d3ee',
    fontWeight: '500',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#f87171',
  },
  charCounter: {
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
  },
  textInputMulti: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    minHeight: 60,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfField: {
    flex: 1,
  },
  priorityButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    color: 'white',
    fontSize: 14,
  },
  priorityPicker: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    marginTop: 6,
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priorityOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  priorityOptionText: {
    color: 'white',
    fontSize: 14,
  },
  mediaBox: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  counterBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  imageList: {
    marginBottom: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  deleteImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
  },
  addMediaButtonActive: {
    backgroundColor: '#06b6d41a',
    borderColor: '#06b6d44d',
  },
  addMediaButtonDisabled: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  addMediaButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  videoPreviewContainer: {
    marginBottom: 10,
  },
  videoPreview: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  videoText: {
    color: 'white',
    fontSize: 12,
    flex: 1,
  },
  deleteVideoButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: '#ef44441a',
    borderWidth: 1,
    borderColor: '#ef44444d',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    flex: 1,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: '#06b6d4',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#334155',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  successBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#06b6d4',
    borderWidth: 1,
    borderColor: '#67e8f999',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  successIcon: {
    backgroundColor: '#ffffff33',
    borderRadius: 20,
    padding: 8,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  successMessage: {
    color: '#f1f5f9',
    fontSize: 12,
  },
});
