import { registrarUsuario } from '@/lib/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


function RegisterContent() {
  const [name, setName] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [estado, setEstado] = useState('');
  const [showEstadoPicker, setShowEstadoPicker] = useState(false);
  const [ciudad, setCiudad] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 400;

  const estados = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Coahuila',
    'Colima',
    'Ciudad de México',
    'Durango',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'México',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas'
  ];

  const handleRegister = async () => {
    setErrorMessage(''); // Limpiar errores anteriores
    
    // Validaciones
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre');
      return;
    }
    if (!apellido.trim()) {
      setErrorMessage('Por favor ingresa tu apellido');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa tu email');
      return;
    }
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor ingresa un email válido (ejemplo: usuario@gmail.com)');
      return;
    }
    if (!telefono.trim()) {
      setErrorMessage('Por favor ingresa tu teléfono');
      return;
    }
    // Validar que el teléfono solo contenga números
    if (!/^\d+$/.test(telefono.replace(/\s/g, ''))) {
      setErrorMessage('El teléfono debe contener solo números');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      // Registrar usuario
      const resultado = await registrarUsuario({
        nombre: name,
        apellido,
        email,
        contraseña: password,
        telefono,
        fecha_nacimiento: fechaNacimiento,
        ciudad: `${estado}${ciudad ? ', ' + ciudad : ''}`
      });

      if (!resultado.success) {
        setErrorMessage(resultado.error || 'Error al registrar usuario');
        setLoading(false);
        return;
      }

      // No creamos sesión aquí; pedimos iniciar sesión
      window.alert('Cuenta creada correctamente. Ahora inicia sesión.');
      // Redirigir a pantalla de inicio de sesión
      router.replace('/');
      
    } catch (error) {
      setErrorMessage('Ocurrió un error al registrarse');
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
            <Text className={`font-black text-white mb-2 tracking-wider ${isSmallScreen ? 'text-2xl' : 'text-3xl'}`}>
              Crea tu cuenta
            </Text>
          </View>

          {/* Register Card */}
          <View className={`bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl border border-cyan-400 border-opacity-30 shadow-2xl w-full ${isSmallScreen ? 'p-6 max-w-sm' : 'p-8 max-w-md'}`} style={{ marginHorizontal: 'auto' }}>
            {/* Name Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Nombre
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

            {/* Apellido Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Apellido
              </Text>
              <TextInput
                className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg px-4 py-3 text-white text-base"
                placeholder="Tu apellido"
                placeholderTextColor="#64748b"
                value={apellido}
                onChangeText={setApellido}
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

            {/* Telefono Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Teléfono
              </Text>
              <TextInput
                className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg px-4 py-3 text-white text-base"
                placeholder="1234567890"
                placeholderTextColor="#64748b"
                value={telefono}
                onChangeText={(text) => {
                  // Solo permitir números
                  const numericText = text.replace(/[^0-9]/g, '');
                  setTelefono(numericText);
                }}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Fecha Nacimiento Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Fecha de Nacimiento (Opcional)
              </Text>
              <TextInput
                className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg px-4 py-3 text-white text-base"
                placeholder="AAAAMMDD (Ej: 19900515)"
                placeholderTextColor="#64748b"
                value={fechaNacimiento}
                onChangeText={(text) => {
                  // Solo permitir números
                  const numericText = text.replace(/[^0-9]/g, '');
                  // Formatear automáticamente a AAAA-MM-DD
                  let formatted = numericText;
                  if (numericText.length > 4) {
                    formatted = numericText.slice(0, 4) + '-' + numericText.slice(4);
                  }
                  if (numericText.length > 6) {
                    formatted = numericText.slice(0, 4) + '-' + numericText.slice(4, 6) + '-' + numericText.slice(6, 8);
                  }
                  setFechaNacimiento(formatted);
                }}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Estado Selector */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Estado (Opcional)
              </Text>
              <TouchableOpacity
                onPress={() => setShowEstadoPicker(!showEstadoPicker)}
                className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg px-4 py-3"
              >
                <Text className={estado ? "text-white text-base" : "text-slate-400 text-base"}>
                  {estado || 'Selecciona tu estado'}
                </Text>
              </TouchableOpacity>
              
              {showEstadoPicker && (
                <View className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg mt-2 max-h-48">
                  <ScrollView>
                    {estados.map((est) => (
                      <TouchableOpacity
                        key={est}
                        onPress={() => {
                          setEstado(est);
                          setShowEstadoPicker(false);
                        }}
                        className="px-4 py-3 border-b border-slate-600"
                      >
                        <Text className="text-white text-base">{est}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Ciudad Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-cyan-400 mb-2">
                Ciudad (Opcional)
              </Text>
              <TextInput
                className="bg-slate-700 border border-cyan-400 border-opacity-40 rounded-lg px-4 py-3 text-white text-base"
                placeholder="Tu ciudad"
                placeholderTextColor="#64748b"
                value={ciudad}
                onChangeText={setCiudad}
                autoCapitalize="words"
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

            {/* Error Message */}
            {errorMessage ? (
              <View className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-3 mb-4">
                <Text className="text-red-400 text-sm text-center font-semibold">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              className={`rounded-lg py-3 mb-6 border shadow-lg ${
                loading 
                  ? 'bg-gray-500 border-gray-400 opacity-50' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400 shadow-red-500/30'
              }`}
            >
              <Text className="text-white font-bold text-center text-base">
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
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
