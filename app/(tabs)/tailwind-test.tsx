import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

function TailwindTestContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      <View className="flex-1 justify-center px-6 py-12">
        {/* Logo/Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">A</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido
          </Text>
          <Text className="text-gray-600 text-center">
            Inicia sesión para continuar
          </Text>
        </View>

        {/* Login Card */}
        <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Email
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="mb-6">
            <Text className="text-blue-600 text-sm font-semibold text-right">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity className="bg-blue-600 rounded-lg py-4 mb-4">
            <Text className="text-white font-bold text-center text-lg">
              Iniciar Sesión
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="px-4 text-gray-500 text-sm">o continúa con</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 bg-gray-100 border border-gray-300 rounded-lg py-3 items-center">
              <Text className="text-gray-700 font-semibold">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-gray-100 border border-gray-300 rounded-lg py-3 items-center">
              <Text className="text-gray-700 font-semibold">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center">
          <Text className="text-gray-600">¿No tienes cuenta? </Text>
          <TouchableOpacity>
            <Text className="text-blue-600 font-semibold">Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default function TailwindTest() {
  return <TailwindTestContent />;
}
