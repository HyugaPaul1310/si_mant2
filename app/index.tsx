import { loginUsuario } from '@/lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 400;

  // Ya no redirigimos automáticamente al iniciar la app.
  // El usuario debe iniciar sesión manualmente.

  const handleLogin = async () => {
    console.log('=== handleLogin iniciado ===');
    setErrorMessage(''); // Limpiar mensaje de error anterior
    
    if (!email.trim() || !password.trim()) {
      console.log('Validación fallida - campos vacíos');
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    console.log('Validación pasada, estableciendo loading...');
    setLoading(true);

    try {
      console.log('Llamando loginUsuario con:', email);
      const resultado = await loginUsuario(email, password);
      
      console.log('Resultado login:', resultado);

      if (!resultado.success) {
        console.log('Login fallido:', resultado.error);
        setErrorMessage(resultado.error || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      if (!resultado.user) {
        console.log('Usuario no retornado');
        setErrorMessage('Error al obtener datos del usuario');
        setLoading(false);
        return;
      }

      console.log('Login exitoso para:', resultado.user.email, 'Rol:', resultado.user.rol);
      
      // Guardar usuario en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(resultado.user));

      // Redirigir según el rol
      if (resultado.user.rol === 'admin') {
        console.log('Redirigiendo a admin');
        router.replace('/admin');
      } else if (resultado.user.rol === 'empleado') {
        console.log('Redirigiendo a empleado-panel');
        router.replace('/empleado-panel');
      } else {
        console.log('Redirigiendo a cliente-panel');
        router.replace('/cliente-panel');
      }

    } catch (error: any) {
      console.error('Exception en handleLogin:', error);
      setErrorMessage('Ocurrió un error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center px-4 py-8">
          {/* Logo/Header */}
          <View className="items-center mb-6 w-full">
            <Image
              source={require('../assets/images/logosimant.png')}
              style={{
                width: isSmallScreen ? 100 : 120,
                height: isSmallScreen ? 100 : 120,
                marginBottom: 12
              }}
              resizeMode="contain"
            />
          </View>

          {/* Login Card */}
          <View className={`bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl border border-cyan-400 border-opacity-30 shadow-2xl w-full ${isSmallScreen ? 'p-6 max-w-sm' : 'p-8 max-w-md'}`} style={{ marginHorizontal: 'auto' }}>
            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Email
              </Text>
              <TextInput
                className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg px-4 py-3 text-white text-base"
                placeholder="usuario@email.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
              />
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Contraseña
              </Text>
              <View className={`flex-row items-center rounded-lg px-4 py-3 bg-slate-700 ${passwordFocused ? 'border-2 border-cyan-400' : 'border border-cyan-400 border-opacity-40'}`}>
                <TextInput
                  className="flex-1 text-white text-base"
                  placeholder="Contraseña"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoComplete="off"
                  textContentType="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                  <Text className="text-cyan-400 text-lg font-bold">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-3 mb-4">
                <Text className="text-red-400 text-sm text-center font-semibold">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6">
              <Text className="text-cyan-400 text-xs font-semibold text-right">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              className={`rounded-lg py-3 mb-6 border shadow-lg ${
                loading 
                  ? 'bg-gray-500 border-gray-400 opacity-50' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400 shadow-red-500/30'
              }`}
            >
              <Text className="text-white font-bold text-center text-base">
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center gap-1">
              <Text className="text-slate-400 text-sm">¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text className="text-cyan-400 font-semibold text-sm">Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Index() {
  return <LoginContent />;
}