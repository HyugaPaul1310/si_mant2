import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function EmpleadoPanel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          // Verificar que sea empleado
          if (userData.rol !== 'empleado') {
            router.replace('/');
            return;
          }
          setUsuario(userData);
        } else {
          router.replace('/');
        }
      } catch (error) {
        router.replace('/');
      }
    };
    obtenerUsuario();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('user');
          router.replace('/');
        }
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <View className="flex-1 justify-center items-center px-4">
        <View className="bg-slate-800 bg-opacity-50 rounded-2xl border border-cyan-400 border-opacity-30 p-8 w-full max-w-md">
          <Text className="text-3xl font-bold text-white mb-2 text-center">
            Panel Empleado
          </Text>
          
          {usuario && (
            <>
              <Text className="text-cyan-400 text-lg mb-4 text-center">
                Bienvenido, {usuario.nombre}
              </Text>
              <Text className="text-slate-400 mb-8 text-center">
                Email: {usuario.email}
              </Text>
            </>
          )}

          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg py-3 border border-red-400"
          >
            <Text className="text-white font-bold text-center">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
