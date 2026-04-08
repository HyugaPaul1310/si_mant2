// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface UploadStep {
  label: string;
  icon: string;
  done: boolean;
}

interface UploadProgressData {
  uploaded: number;
  total: number;
  phase: string;
  percent: number;
}

interface Props {
  visible: boolean;
  steps: UploadStep[];
  currentStep: number;
  progress: number;
  estimatedTime: string;
  phase: string;
  currentCount: number;
  totalCount: number;
}

export default function UploadProgressOverlay({
  visible,
  steps,
  currentStep,
  progress,
  estimatedTime,
  phase,
  currentCount,
  totalCount,
}: Props) {
  const fontFamily = Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif';
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      // Spin animation
      const spin = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      );
      spin.start();
      return () => { spin.stop(); };
    } else {
      fadeAnim.setValue(0);
      spinAnim.setValue(0);
      progressAnim.setValue(0);
    }
  }, [visible]);

  // Animate progress bar
  useEffect(() => {
    if (visible) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
        <View style={s.card}>
          {/* ===== CIRCULAR PROGRESS RING ===== */}
          <View style={s.circularContainer}>
            <Animated.View
              style={[
                s.ringBg,
                {
                  transform: [
                    { rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                  ],
                },
              ]}
            />
            <View style={s.percentContainer}>
              <Text style={[s.percentText, { fontFamily }]}>
                {typeof progress === 'number' ? progress : 0}%
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[s.title, { fontFamily }]}>
            {phase && phase.trim() !== '' ? phase : 'Procesando...'}
          </Text>

          {/* ===== PROGRESS DETAIL BOX ===== */}
          {(totalCount > 0 || currentStep > 0) && (
            <View style={s.detailBox}>
              <Text style={[s.detailText, { fontFamily }]}>
                {phase.includes('imagen') || phase.includes('foto')
                  ? `${currentCount} de ${totalCount} imágenes subidas`
                  : phase.includes('video')
                    ? (currentCount >= 1 ? 'Video subido' : 'Subiendo video...')
                    : phase.includes('audio')
                      ? (currentCount >= 1 ? 'Audio subido' : 'Subiendo audio...')
                      : `${currentCount} de ${totalCount} archivos`
                }
              </Text>
              <View style={s.barTrack}>
                <Animated.View
                  style={[
                    s.barFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              {estimatedTime ? (
                <Text style={[s.etaText, { fontFamily }]}>
                  Tiempo estimado restante: {estimatedTime}
                </Text>
              ) : null}
            </View>
          )}

          {/* ===== STEPS LIST ===== */}
          <View style={s.stepsContainer}>
            {steps.map((step, idx) => {
              const isActive = idx === currentStep && !step.done;
              const isDone = step.done;
              return (
                <View key={idx} style={[s.stepRow, isActive && s.stepRowActive]}>
                  <View style={[
                    s.stepIcon,
                    isDone && s.stepIconDone,
                    isActive && s.stepIconActive,
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
                    s.stepLabel,
                    { fontFamily },
                    isDone && s.stepLabelDone,
                    isActive && s.stepLabelActive,
                  ]}>
                    {isDone ? step.label.replace('...', '') + ' ✓' : step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={[s.hint, { fontFamily }]}>No cierres la aplicación</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
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
  circularContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ringBg: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#1e293b',
    borderTopColor: '#06b6d4',
    borderRightColor: '#06b6d4',
  },
  percentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentText: {
    color: '#22d3ee',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  title: {
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  detailBox: {
    width: '100%',
    backgroundColor: '#0c1322',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 20,
  },
  detailText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  barTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 4,
  },
  etaText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
  },
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
  stepIcon: {
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
  hint: {
    color: '#475569',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
