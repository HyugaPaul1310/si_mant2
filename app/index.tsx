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
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 400;

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
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                  <Text className="text-cyan-400 text-lg font-bold">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="mb-6">
              <Text className="text-cyan-400 text-xs font-semibold text-right">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg py-3 mb-6 border border-red-400 shadow-lg shadow-red-500/30 active:shadow-red-500/50">
              <Text className="text-white font-bold text-center text-base">
                Iniciar Sesión
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