// @ts-nocheck
import { obtenerSucursalesCliente } from '@/lib/api-backend';
import { obtenerEquiposSucursal } from '@/lib/empresas';
import { crearReporte, subirArchivosReporteConProgreso } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta'>('media');
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Loading overlay states
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<{ label: string; icon: string; done: boolean }[]>([]);
  // Progress tracking for uploads
  const [uploadProgress, setUploadProgress] = useState({ uploaded: 0, total: 0, phase: '' as string, percent: 0 });
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Start spinner animation when overlay is shown
  useEffect(() => {
    if (showLoadingOverlay) {
      // Fade in
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      // Spin animation
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      );
      spin.start();
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => { spin.stop(); pulse.stop(); };
    } else {
      fadeAnim.setValue(0);
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [showLoadingOverlay]);

  // Equipos de la sucursal seleccionada
  const [equiposSucursal, setEquiposSucursal] = useState([]);
  const [showEquipoPicker, setShowEquipoPicker] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

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

  // Cargar equipos cuando cambia la sucursal
  useEffect(() => {
    if (sucursalSeleccionada?.id) {
      obtenerEquiposSucursal(String(sucursalSeleccionada.id)).then(res => {
        if (res.success) setEquiposSucursal(res.data);
        else setEquiposSucursal([]);
      });
      // Reset equipo seleccionado al cambiar sucursal
      setEquipoSeleccionado(null);
      setEquipoDescripcion('');
      setEquipoModelo('');
      setEquipoSerie('');
    } else {
      setEquiposSucursal([]);
    }
  }, [sucursalSeleccionada?.id]);

  const solicitarPermisos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a las fotos');
    }
  };

  const seleccionarImagen = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.3,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map(asset => asset.uri);
        setImagenes([...imagenes, ...newUris]);
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
        allowsEditing: false,
        quality: 0.3,
        videoMaxDuration: 180,
      });

      if (!result.canceled && result.assets[0].uri) {
        const duration = result.assets[0].duration;
        if (duration && duration > 180000) {
          Alert.alert('Video muy largo', 'El video debe durar máximo 3 minutos');
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

    // Build loading steps dynamically based on what media is attached
    const steps: { label: string; icon: string; done: boolean }[] = [
      { label: 'Creando reporte...', icon: 'document-text-outline', done: false },
    ];
    if (imagenes.length > 0) {
      steps.push({ label: `Subiendo ${imagenes.length} imagen${imagenes.length > 1 ? 'es' : ''}...`, icon: 'images-outline', done: false });
    }
    if (video) {
      steps.push({ label: 'Subiendo video...', icon: 'videocam-outline', done: false });
    }
    steps.push({ label: 'Finalizando...', icon: 'checkmark-circle-outline', done: false });

    setLoadingSteps(steps);
    setLoadingStep(0);
    setUploadProgress({ uploaded: 0, total: 0, phase: '', percent: 0 });
    setEstimatedTimeLeft('');
    progressAnim.setValue(0);
    setShowLoadingOverlay(true);
    setLoading(true);

    // Compute total file count for global percentage
    const totalFiles = imagenes.length + (video ? 1 : 0);
    let filesUploaded = 0;

    const updateGlobalPercent = (count: number) => {
      filesUploaded = count;
      const pct = totalFiles > 0 ? Math.round((filesUploaded / totalFiles) * 100) : 0;
      setUploadProgress(prev => ({ ...prev, percent: pct }));
      Animated.timing(progressAnim, { toValue: pct / 100, duration: 400, useNativeDriver: false }).start();
    };

    try {
      // Paso 1: Crear el reporte
      setLoadingStep(0);
      setUploadProgress({ uploaded: 0, total: 0, phase: 'Creando reporte...', percent: 0 });
      const resultado = await crearReporte({
        usuario_email: usuario!.email,
        usuario_nombre: usuario!.nombre,
        usuario_apellido: usuario?.apellido,
        empresa: usuario?.empresa,
        sucursal: sucursalSeleccionada.nombre,
        sucursal_id: String(sucursalSeleccionada.id),
        equipo_descripcion: equipoDescripcion.trim(),
        equipo_modelo: equipoModelo.trim() || undefined,
        equipo_serie: equipoSerie.trim() || undefined,
        equipo_id: equipoSeleccionado?.id ? String(equipoSeleccionado.id) : undefined,
        comentario: comentario.trim(),
        prioridad,
        direccion_sucursal: sucursalSeleccionada.direccion,
      });

      // Mark step 0 done
      setLoadingSteps(prev => prev.map((s, i) => i === 0 ? { ...s, done: true } : s));

      if (!resultado.success) {
        setShowLoadingOverlay(false);
        setErrorMessage(resultado.error || 'Error al crear el reporte');
        setLoading(false);
        return;
      }

      console.log('[MODAL] Respuesta de crearReporte:', resultado);
      const reporteId = resultado.data?.id !== undefined ? resultado.data.id : (resultado.data?.reporteId || null);
      console.log('[MODAL] reporteId extraído:', reporteId);

      // Paso 2: Subir archivos a Cloudflare con progreso
      if ((imagenes.length > 0 || video) && reporteId !== null && reporteId !== undefined) {
        let currentStep = 1;
        let imageBaseCount = 0; // images uploaded so far for global count

        // Set image upload step
        if (imagenes.length > 0) {
          setLoadingStep(currentStep);
          setUploadProgress({ uploaded: 0, total: imagenes.length, phase: `Subiendo ${imagenes.length} imagen${imagenes.length > 1 ? 'es' : ''}...`, percent: 0 });
        }

        const uploadResult = await subirArchivosReporteConProgreso(
          String(reporteId),
          imagenes.length > 0 ? imagenes : undefined,
          video || undefined,
          (uploaded, total, phase, elapsedMs) => {
            if (phase === 'imagen') {
              // Update image-specific progress
              setUploadProgress({
                uploaded,
                total,
                phase: `Subiendo ${total} imagen${total > 1 ? 'es' : ''}...`,
                percent: totalFiles > 0 ? Math.round(((imageBaseCount + uploaded) / totalFiles) * 100) : 0,
              });
              updateGlobalPercent(imageBaseCount + uploaded);

              // Estimate time remaining for images
              if (uploaded > 0 && uploaded < total) {
                const avgPerFile = elapsedMs / uploaded;
                const remaining = (total - uploaded) * avgPerFile;
                const secs = Math.ceil(remaining / 1000);
                setEstimatedTimeLeft(secs > 60 ? `${Math.ceil(secs / 60)} minuto${Math.ceil(secs / 60) > 1 ? 's' : ''}` : `${secs} segundo${secs > 1 ? 's' : ''}`);
              } else if (uploaded >= total) {
                setEstimatedTimeLeft('');
              }

              // Mark images step done when all uploaded
              if (uploaded >= total) {
                imageBaseCount = total;
                setLoadingSteps(prev => prev.map((s, i) => i === currentStep ? { ...s, done: true } : s));
                currentStep++;
              }
            } else if (phase === 'video') {
              // Switch to video step
              setLoadingStep(currentStep);
              if (uploaded === 0) {
                setUploadProgress(prev => ({
                  ...prev,
                  uploaded: 0,
                  total: 1,
                  phase: 'Subiendo video...',
                }));
                setEstimatedTimeLeft('Esto puede tardar un poco...');
              } else {
                // Video done
                updateGlobalPercent(imagenes.length > 0 ? (imageBaseCount + imagenes.length + 1) : 1);
                setUploadProgress(prev => ({
                  ...prev,
                  uploaded: 1,
                  total: 1,
                  phase: 'Subiendo video...',
                  percent: 100,
                }));
                setEstimatedTimeLeft('');
                setLoadingSteps(prev => prev.map((s, i) => i === currentStep ? { ...s, done: true } : s));
                currentStep++;
              }
            }
          }
        );

        if (!uploadResult.success) {
          console.warn('Advertencia al subir archivos:', uploadResult.error);
        }

        // Final step
        setLoadingStep(currentStep);
        updateGlobalPercent(totalFiles);
        setLoadingSteps(prev => prev.map((s, i) => i === currentStep ? { ...s, done: true } : s));
      } else {
        if (imagenes.length > 0 || video) {
          console.warn('[MODAL] ⚠️ No se pudo extraer reporteId válido, saltando subida de archivos');
        }
        // Mark final step done
        const lastIdx = steps.length - 1;
        setLoadingStep(lastIdx);
        updateGlobalPercent(totalFiles);
        setLoadingSteps(prev => prev.map((s, i) => i === lastIdx ? { ...s, done: true } : s));
      }

      // Short pause so user sees final step completed
      await new Promise(resolve => setTimeout(resolve, 600));

      // Reporte creado exitosamente: marca bandera, muestra banner y redirige
      setShowLoadingOverlay(false);
      setLoading(false);
      setShowSuccessBanner(true);

      await AsyncStorage.setItem('reporte_exito', '1');

      setTimeout(() => {
        router.back();
      }, 900);
    } catch (error: any) {
      setShowLoadingOverlay(false);
      setErrorMessage('Ocurrió un error: ' + error.message);
      setLoading(false);
    }
  };

  const prioridades = [
    { value: 'baja', label: 'Baja', color: 'bg-green-500' },
    { value: 'media', label: 'Media', color: 'bg-amber-500' },
    { value: 'alta', label: 'Urgente', color: 'bg-red-500' },
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

            {/* Equipos registrados en la sucursal */}
            {sucursalSeleccionada && equiposSucursal.length > 0 && (
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>
                  Equipo registrado <Text style={{ color: '#94a3b8', textTransform: 'none', fontSize: 11, fontWeight: '400' }}>(Selecciona tu equipo)</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEquipoPicker(!showEquipoPicker)}
                  style={[
                    styles.priorityButton,
                    equipoSeleccionado && { borderColor: '#06b6d4', borderWidth: 1.5 }
                  ]}
                >
                  <View style={styles.priorityButtonContent}>
                    <Ionicons name="hardware-chip-outline" size={16} color="#06b6d4" />
                    <Text style={[styles.priorityText, { fontFamily, color: equipoSeleccionado ? '#06b6d4' : '#94a3b8', fontSize: 13 }]}>
                      {equipoSeleccionado ? equipoSeleccionado.nombre : 'Seleccionar equipo de la sucursal...'}
                    </Text>
                  </View>
                  <Ionicons name={showEquipoPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#475569" />
                </TouchableOpacity>

                {showEquipoPicker && (
                  <View style={[styles.priorityPicker, { maxHeight: 260, zIndex: 20 }]}>
                    <ScrollView scrollEnabled nestedScrollEnabled showsVerticalScrollIndicator>
                      {/* Opción: ninguno / manual */}
                      <TouchableOpacity
                        onPress={() => {
                          setEquipoSeleccionado(null);
                          setEquipoDescripcion('');
                          setEquipoModelo('');
                          setEquipoSerie('');
                          setShowEquipoPicker(false);
                        }}
                        style={[styles.priorityOption, styles.priorityOptionBorder]}
                      >
                        <Ionicons name="create-outline" size={16} color="#64748b" />
                        <Text style={[styles.priorityOptionText, { fontFamily, color: '#64748b', fontSize: 13 }]}>Ingresar manualmente</Text>
                      </TouchableOpacity>

                      {equiposSucursal.map((eq, index) => (
                        <TouchableOpacity
                          key={eq.id}
                          onPress={() => {
                            setEquipoSeleccionado(eq);
                            setEquipoDescripcion(eq.nombre || '');
                            setEquipoModelo(eq.modelo || '');
                            setEquipoSerie(eq.serie || '');
                            setShowEquipoPicker(false);
                          }}
                          style={[
                            styles.priorityOption,
                            index < equiposSucursal.length - 1 && styles.priorityOptionBorder,
                          ]}
                        >
                          <Ionicons
                            name={equipoSeleccionado?.id === eq.id ? 'checkmark-circle' : 'hardware-chip-outline'}
                            size={16}
                            color={equipoSeleccionado?.id === eq.id ? '#06b6d4' : '#475569'}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.priorityOptionText, { fontFamily, fontSize: 13 }]}>{eq.nombre}</Text>
                            {(eq.modelo || eq.serie) ? (
                              <Text style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>
                                {[eq.modelo && `Modelo: ${eq.modelo}`, eq.serie && `Serie: ${eq.serie}`].filter(Boolean).join(' · ')}
                              </Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Equipo - Descripción */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { fontFamily }]}>
                Equipo - Descripción <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { fontFamily },
                  equipoSeleccionado && { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }
                ]}
                value={equipoDescripcion}
                onChangeText={setEquipoDescripcion}
                placeholder="Ej: Aire acondicionado, Refrigerador..."
                placeholderTextColor="#475569"
                editable={!equipoSeleccionado}
              />
            </View>

            {/* Modelo y Serie en fila */}
            <View style={styles.rowContainer}>
              <View style={styles.halfField}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>Modelo</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { fontFamily },
                    equipoSeleccionado && { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }
                  ]}
                  value={equipoModelo}
                  onChangeText={setEquipoModelo}
                  placeholder="Modelo"
                  placeholderTextColor="#475569"
                  editable={!equipoSeleccionado}
                />
              </View>

              <View style={styles.halfField}>
                <Text style={[styles.fieldLabel, { fontFamily }]}>Serie</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { fontFamily },
                    equipoSeleccionado && { backgroundColor: '#1e293b', borderColor: '#334155', color: '#94a3b8' }
                  ]}
                  value={equipoSerie}
                  onChangeText={setEquipoSerie}
                  placeholder="Nº serie"
                  placeholderTextColor="#475569"
                  editable={!equipoSeleccionado}
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
                  <View style={[styles.priorityDot, { backgroundColor: prioridad === 'alta' ? '#ef4444' : prioridad === 'media' ? '#f59e0b' : '#22c55e' }]} />
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
                      <View style={[styles.priorityDot, { backgroundColor: p.value === 'alta' ? '#ef4444' : p.value === 'media' ? '#f59e0b' : '#22c55e' }]} />
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
                {imagenes.length > 0 && (
                  <View style={styles.counterBadge}>
                    <Text style={[styles.counterText, { fontFamily }]}>{imagenes.length}</Text>
                  </View>
                )}
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
                style={[styles.addMediaButton, styles.addMediaButtonActive]}
              >
                <Ionicons
                  name="images"
                  size={16}
                  color="#06b6d4"
                />
                <Text style={[styles.addMediaButtonText, { fontFamily, color: '#22d3ee' }]}>
                  Elegir imágenes de la galería
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
                    <Text style={[styles.videoText, { fontFamily }]} numberOfLines={1}>Video seleccionado (máx 3m)</Text>
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
                  {video ? 'Video agregado' : 'Agregar video (máx 3m)'}
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

      {/* ========== LOADING OVERLAY ========== */}
      <Modal
        visible={showLoadingOverlay}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
          <View style={styles.loadingCard}>
            {/* ===== CIRCULAR PROGRESS RING ===== */}
            <View style={styles.circularProgressContainer}>
              {/* Background ring */}
              <Animated.View
                style={[
                  styles.progressRingBg,
                  {
                    transform: [
                      { rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                    ],
                  },
                ]}
              />
              {/* Percentage text */}
              <View style={styles.progressTextContainer}>
                <Text style={[styles.progressPercent, { fontFamily }]}>
                  {uploadProgress.percent}%
                </Text>
              </View>
            </View>

            {/* Title: dynamic based on current phase */}
            <Text style={[styles.loadingTitle, { fontFamily }]}>
              {uploadProgress.phase || 'Procesando reporte...'}
            </Text>

            {/* ===== PROGRESS DETAIL BOX ===== */}
            {(uploadProgress.total > 0) && (
              <View style={styles.progressDetailBox}>
                <Text style={[styles.progressDetailText, { fontFamily }]}>
                  {uploadProgress.phase.includes('imagen')
                    ? `${uploadProgress.uploaded} de ${uploadProgress.total} imágenes subidas`
                    : uploadProgress.phase.includes('video')
                      ? (uploadProgress.uploaded >= 1 ? 'Video subido' : 'Subiendo video...')
                      : `${uploadProgress.uploaded} de ${uploadProgress.total} archivos`
                  }
                </Text>
                {/* Progress bar */}
                <View style={styles.progressBarTrack}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
                {estimatedTimeLeft ? (
                  <Text style={[styles.estimatedTimeText, { fontFamily }]}>
                    Tiempo estimado restante: {estimatedTimeLeft}
                  </Text>
                ) : null}
              </View>
            )}

            {/* ===== STEPS LIST ===== */}
            <View style={styles.stepsContainer}>
              {loadingSteps.map((step, idx) => {
                const isActive = idx === loadingStep && !step.done;
                const isDone = step.done;
                return (
                  <View key={idx} style={[styles.stepRow, isActive && styles.stepRowActive]}>
                    <View style={[
                      styles.stepIconCircle,
                      isDone && styles.stepIconDone,
                      isActive && styles.stepIconActive,
                    ]}>
                      {isDone ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : isActive ? (
                        <ActivityIndicator size="small" color="#06b6d4" />
                      ) : (
                        <Ionicons name={step.icon as any} size={14} color="#475569" />
                      )}
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      { fontFamily },
                      isDone && styles.stepLabelDone,
                      isActive && styles.stepLabelActive,
                    ]}>
                      {isDone ? step.label.replace('...', '') + ' ✓' : step.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.loadingHint, { fontFamily }]}>No cierres la aplicación</Text>
          </View>
        </Animated.View>
      </Modal>

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
  // ========== LOADING OVERLAY STYLES ==========
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 25,
  },
  // Circular progress ring
  circularProgressContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressRingBg: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#1e293b',
    borderTopColor: '#06b6d4',
    borderRightColor: '#06b6d4',
  },
  progressTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    color: '#22d3ee',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  loadingTitle: {
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  // Progress detail box
  progressDetailBox: {
    width: '100%',
    backgroundColor: '#0c1322',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 20,
  },
  progressDetailText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
  },
  estimatedTimeText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  // Steps list
  stepsContainer: {
    width: '100%',
    gap: 4,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  stepRowActive: {
    backgroundColor: '#06b6d40d',
    borderWidth: 1,
    borderColor: '#06b6d41a',
  },
  stepIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepIconDone: {
    backgroundColor: '#06b6d4',
    borderColor: '#22d3ee',
  },
  stepIconActive: {
    backgroundColor: '#0f172a',
    borderColor: '#06b6d4',
  },
  stepLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '400',
    flex: 1,
  },
  stepLabelDone: {
    color: '#4ade80',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#f1f5f9',
    fontWeight: '500',
  },
  loadingHint: {
    color: '#475569',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
