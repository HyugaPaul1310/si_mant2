import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


function RegisterContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const router = useRouter();
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 400;

  const handleRegister = () => {
    // Aquí irá la lógica de registro
    console.log('Registrando:', { name, email, password, confirmPassword });
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
            <Text className={`font-black text-white mb-2 tracking-wider ${isSmallScreen ? 'text-2xl' : 'text-3xl'}`}>
              Crea tu cuenta
            </Text>
          </View>

          {/* Register Card */}
          <View className={`bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl border border-cyan-400 border-opacity-30 shadow-2xl w-full ${isSmallScreen ? 'p-6 max-w-sm' : 'p-8 max-w-md'}`} style={{ marginHorizontal: 'auto' }}>
            {/* Name Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Nombre Completo
              </Text>
              <TextInput
                className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg px-4 py-3 text-white text-base"
                placeholder="Tu nombre"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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
            <View className="mb-5">
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

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Confirmar Contraseña
              </Text>
              <View className={`flex-row items-center rounded-lg px-4 py-3 bg-slate-700 ${confirmPasswordFocused ? 'border-2 border-cyan-400' : 'border border-cyan-400 border-opacity-40'}`}>
                <TextInput
                  className="flex-1 text-white text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2">
                  <Text className="text-cyan-400 text-lg font-bold">
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              onPress={handleRegister}
              className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg py-3 mb-6 border border-red-400 shadow-lg shadow-red-500/30 active:shadow-red-500/50"
            >
              <Text className="text-white font-bold text-center text-base">
                Crear Cuenta
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center gap-1">
              <Text className="text-slate-400 text-sm">¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text className="text-cyan-400 font-semibold text-sm">Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Register() {
  return <RegisterContent />;
}
