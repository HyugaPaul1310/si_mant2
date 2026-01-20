// @ts-nocheck
import { actualizarEstadoCerradoPorCliente, actualizarFase2Reporte, guardarEncuestaSatisfaccion } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPCIONES = ['Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'Malo'];

const PREGUNTAS = [
  {
    id: 1,
    texto: 'El trato que recibió por parte del equipo de Simant me pareció:',
    key: 'trato_equipo'
  },
  {
    id: 2,
    texto: 'El equipo técnico de la empresa le resuelve sus problemas de forma:',
    key: 'equipo_tecnico'
  },
  {
    id: 3,
    texto: 'El personal administrativo que recibe mi solicitud me atiende de forma:',
    key: 'personal_administrativo'
  },
  {
    id: 4,
    texto: 'La rapidez en la resolución del problema fue:',
    key: 'rapidez'
  },
  {
    id: 5,
    texto: 'El costo del servicio en relación a la calidad fue:',
    key: 'costo_calidad'
  },
  {
    id: 6,
    texto: '¿Recomendaría nuestros servicios a otros clientes?',
    key: 'recomendacion'
  },
  {
    id: 7,
    texto: '¿Qué tan satisfecho está con la solución proporcionada?',
    key: 'satisfaccion'
  },
];

export default function EncuestaPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fontFamily = Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif';
  const params = useLocalSearchParams();

  const [respuestas, setRespuestas] = useState<{ [key: string]: string }>({});
  const [guardando, setGuardando] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuarioJson = await AsyncStorage.getItem('usuario_empleado');
        setUsuario(usuarioJson ? JSON.parse(usuarioJson) : null);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    };
    cargarUsuario();
  }, []);

  const todasLasRespuestasLlenas = PREGUNTAS.every(p => respuestas[p.key]);

  const handleGuardarEncuesta = async () => {
    if (!todasLasRespuestasLlenas) {
      Alert.alert('Validación requerida', 'Por favor responde todas las preguntas. Esta encuesta es obligatoria para cerrar el reporte.');
      return;
    }

    setGuardando(true);
    try {
      const reporteId = params.reporteId as string;
      let fase2Data = {};
      
      // Parsear fase2Data solo si existe
      if (params.fase2Data) {
        try {
          fase2Data = JSON.parse(params.fase2Data as string);
        } catch (e) {
          console.warn('No se pudo parsear fase2Data, continuando con objeto vacío');
          fase2Data = {};
        }
      }
      
      // Obtener datos del cliente y empleado desde los params
      const clienteEmail = params.clienteEmail as string || '';
      const clienteNombre = params.clienteNombre as string || '';
      const empresa = params.empresa as string || '';
      const empleadoEmail = params.empleadoEmail as string || '';
      const empleadoNombre = params.empleadoNombre as string || '';

      console.log('Iniciando guardado de encuesta...');
      console.log('reporteId:', reporteId);
      console.log('usuario:', usuario);
      console.log('cliente:', { email: clienteEmail, nombre: clienteNombre, empresa });
      console.log('empleado:', { email: empleadoEmail, nombre: empleadoNombre });

      // Preparar datos de encuesta
      const encuestaData = {
        reporte_id: reporteId,
        cliente_email: clienteEmail,
        cliente_nombre: clienteNombre,
        empleado_email: empleadoEmail || usuario?.email || '',
        empleado_nombre: empleadoNombre || usuario?.nombre || '',
        empresa: empresa,
        trato_equipo: respuestas['trato_equipo'],
        equipo_tecnico: respuestas['equipo_tecnico'],
        personal_administrativo: respuestas['personal_administrativo'],
        rapidez: respuestas['rapidez'],
        costo_calidad: respuestas['costo_calidad'],
        recomendacion: respuestas['recomendacion'],
        satisfaccion: respuestas['satisfaccion'],
      };

      // Actualizar Fase 2 con datos guardados
      console.log('Actualizando Fase 2...');
      const resultadoFase2 = await actualizarFase2Reporte(reporteId, {
        ...fase2Data,
        trabajo_completado: true,
      });
      
      if (!resultadoFase2.success) {
        throw new Error(resultadoFase2.error || 'No se pudo guardar Fase 2');
      }
      
      console.log('Fase 2 actualizada');

      // Guardar encuesta en tabla separada
      console.log('Guardando encuesta en BD...');
      const resultadoEncuesta = await guardarEncuestaSatisfaccion(encuestaData);
      
      if (!resultadoEncuesta.success) {
        console.error('Fallo al guardar encuesta:', resultadoEncuesta.error);
        throw new Error(resultadoEncuesta.error || 'No se pudo guardar la encuesta');
      }
      
      console.log('Encuesta guardada correctamente');

      // PASO 5: Cambiar estado a "cerrado_por_cliente" (cierre definitivo)
      console.log('Cambiando estado a cerrado_por_cliente...');
      const resultadoEstado = await actualizarEstadoCerradoPorCliente(reporteId);
      
      if (!resultadoEstado.success) {
        throw new Error(resultadoEstado.error || 'No se pudo marcar el reporte como cerrado');
      }
      
      console.log('Reporte cerrado por cliente - CIERRE DEFINITIVO');
      console.log('Encuesta finalizada correctamente');

      setGuardando(false);
      
      // Navegar al panel del cliente con modales cerrados
      console.log('Navegando a cliente-panel en 1 segundo...');
      setTimeout(() => {
        console.log('Ejecutando navegación a panel del cliente...');
        router.push('/cliente-panel?closeModals=true');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error al guardar encuesta:', error);
      console.error('Error details:', error.message);
      setGuardando(false);
      Alert.alert('Error', `Hubo un problema: ${error.message}`);
    }
  };

  const handleSeleccionar = (preguntaKey: string, opcion: string) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaKey]: opcion
    }));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#0f172a' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/cliente-panel')} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#22d3ee" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { fontFamily }]}>Encuesta de Satisfacción</Text>
          <Text style={[styles.headerSubtitle, { fontFamily }]}>Por favor ayúdanos a mejorar</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          {/* PASO 5: Mensaje introductorio */}
          <View style={{ 
            backgroundColor: '#06b6d415', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 24, 
            borderLeftWidth: 4, 
            borderLeftColor: '#06b6d4' 
          }}>
            <Text style={[styles.headerSubtitle, { fontFamily, color: '#22d3ee', marginBottom: 8 }]}>
              ✓ Trabajo completado
            </Text>
            <Text style={[styles.preguntaTexto, { fontFamily, color: '#cbd5e1' }]}>
              Tu reporte ha sido finalizado. Por favor responde esta encuesta para cerrar oficialmente el servicio y ayudarnos a mejorar.
            </Text>
          </View>

          {PREGUNTAS.map((pregunta, idx) => (
            <View key={pregunta.id} style={styles.preguntaContainer}>
              <View style={styles.preguntaHeader}>
                <View style={styles.numeroCircle}>
                  <Text style={[styles.numeroText, { fontFamily }]}>{pregunta.id}</Text>
                </View>
                <Text style={[styles.preguntaTexto, { fontFamily }]}>{pregunta.texto}</Text>
              </View>

              <View style={styles.opcionesContainer}>
                {OPCIONES.map((opcion) => {
                  const isSelected = respuestas[pregunta.key] === opcion;
                  return (
                    <TouchableOpacity
                      key={opcion}
                      style={[
                        styles.opcion,
                        isSelected && styles.opcionSelected,
                        {
                          borderColor: isSelected ? '#22d3ee' : '#475569',
                          backgroundColor: isSelected ? '#22d3ee15' : 'transparent',
                        }
                      ]}
                      onPress={() => handleSeleccionar(pregunta.key, opcion)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                        { borderColor: isSelected ? '#22d3ee' : '#64748b' }
                      ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#22d3ee" />
                        )}
                      </View>
                      <Text style={[
                        styles.opcionTexto,
                        { fontFamily },
                        isSelected && styles.opcionTextoSelected
                      ]}>
                        {opcion}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(Object.keys(respuestas).length / PREGUNTAS.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { fontFamily }]}>
            {Object.keys(respuestas).length} de {PREGUNTAS.length} preguntas respondidas
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, isMobile && styles.footerMobile]}>
        <TouchableOpacity
          style={[styles.cancelButton, isMobile && styles.buttonMobile]}
          onPress={() => router.replace('/cliente-panel')}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { fontFamily }]}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isMobile && styles.buttonMobile,
            !todasLasRespuestasLlenas && styles.submitButtonDisabled
          ]}
          onPress={handleGuardarEncuesta}
          activeOpacity={0.7}
          disabled={!todasLasRespuestasLlenas || guardando}
        >
          <Text style={[styles.submitButtonText, { fontFamily }]}>
            {guardando ? 'Guardando...' : 'Enviar Encuesta'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  contentMobile: {
    paddingHorizontal: 16,
  },
  preguntaContainer: {
    marginBottom: 28,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  preguntaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  numeroCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22d3ee15',
    borderWidth: 1,
    borderColor: '#22d3ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroText: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '700',
  },
  preguntaTexto: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  opcionesContainer: {
    gap: 10,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  opcionSelected: {
    backgroundColor: '#22d3ee15',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#22d3ee',
    borderColor: '#22d3ee',
  },
  opcionTexto: {
    color: '#cbd5e1',
    fontSize: 14,
    flex: 1,
  },
  opcionTextoSelected: {
    color: '#22d3ee',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  footerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#475569',
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#64748b',
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonMobile: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
