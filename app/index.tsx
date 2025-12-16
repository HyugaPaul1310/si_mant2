import { loginUsuario } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const resultado = await loginUsuario(email, password);

      if (!resultado?.success || !resultado.user) {
        setErrorMessage(resultado?.error || 'Error al iniciar sesión');
        return;
      }

      await AsyncStorage.setItem('user', JSON.stringify(resultado.user));

      switch (resultado.user.rol) {
        case 'admin':
          router.replace('/admin');
          break;
        case 'empleado':
          router.replace('/empleado-panel');
          break;
        default:
          router.replace('/cliente-panel');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Fondo */}
      <LinearGradient
        colors={['#0f172a', '#0b1b3d', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 16,
              paddingVertical: 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Image
                source={require('../assets/images/logosimant.png')}
                resizeMode="contain"
                style={{
                  width: isSmallScreen ? 96 : 120,
                  height: isSmallScreen ? 96 : 120,
                }}
              />
            </View>

            {/* Card */}
            <View
              style={{
                alignSelf: 'center',
                width: '100%',
                maxWidth: 400,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(34, 211, 238, 0.4)',
                backgroundColor: 'rgba(30, 41, 59, 0.85)',
                padding: isSmallScreen ? 20 : 28,
              }}
            >
              {/* Email */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: '#22d3ee',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="usuario@email.com"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  style={{
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    borderWidth: 1,
                    borderColor: 'rgba(34, 211, 238, 0.4)',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                  }}
                />
              </View>

              {/* Password */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    color: '#22d3ee',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  Contraseña
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#334155',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    borderWidth: passwordFocused ? 2 : 1,
                    borderColor: passwordFocused
                      ? '#22d3ee'
                      : 'rgba(34, 211, 238, 0.4)',
                  }}
                >
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Contraseña"
                    placeholderTextColor="#64748b"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    editable={!loading}
                    style={{
                      flex: 1,
                      color: '#ffffff',
                      paddingVertical: 12,
                      fontSize: 16,
                      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    style={{ marginLeft: 8, padding: 4 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color="#22d3ee"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {errorMessage ? (
                <View
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: 1,
                    borderColor: '#f87171',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: '#fca5a5',
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Button */}
              <LinearGradient
                colors={
                  loading
                    ? ['#64748b', '#64748b']
                    : ['#ef4444', '#dc2626']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 8, overflow: 'hidden' }}
              >
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      color: '#ffffff',
                      fontWeight: '700',
                      textAlign: 'center',
                      fontSize: 16,
                    }}
                  >
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
