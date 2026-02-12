import AsyncStorage from '@react-native-async-storage/async-storage';

// URL del backend Express (dominio con SSL)
const API_BASE = 'https://si-mant.com/api';

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  user?: any;
  token?: string;
  message?: string;
  [key: string]: any; // Para otros campos como reporteId, tareaId, etc.
}

/**
 * Realiza una llamada a la API
 * @param endpoint Ruta del endpoint (ej: /auth/login)
 * @param method Método HTTP (GET, POST, PUT, DELETE)
 * @param body Cuerpo de la solicitud (opcional)
 * @returns Respuesta del servidor
 */
export async function apiCall<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    // Obtener token del storage
    const token = await AsyncStorage.getItem('token');

    // Preparar headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Añadir token si existe (para endpoints protegidos)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Preparar opciones de la solicitud
    const options: RequestInit = {
      method,
      headers,
    };

    // Añadir body si existe
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    // Realizar solicitud
    const url = `${API_BASE}${endpoint}`;
    console.log(`[API] ${method} ${endpoint}`);

    const response = await fetch(url, options);
    const data = await response.json();

    // Si el token expiró (401), limpiar storage y redirigir a login
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      console.warn('[API] Token expirado, limpiando...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // El router debería manejar esto automáticamente
    }

    return data;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.message || 'Error desconocido en la solicitud',
    };
  }
}

/**
 * Alias para GET
 */
export async function apiGet<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall(endpoint, 'GET');
}

/**
 * Alias para POST
 */
export async function apiPost<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  return apiCall(endpoint, 'POST', body);
}

/**
 * Alias para PUT
 */
export async function apiPut<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  return apiCall(endpoint, 'PUT', body);
}

/**
 * Alias para DELETE
 */
export async function apiDelete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  return apiCall(endpoint, 'DELETE');
}

/**
 * Obtener token actual
 */
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

/**
 * Guardar token
 */
export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem('token', token);
}

/**
 * Limpiar token
 */
export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem('token');
}

/**
 * Obtener usuario del storage
 */
export async function getUser(): Promise<any | null> {
  const userJson = await AsyncStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Guardar usuario
 */
export async function setUser(user: any): Promise<void> {
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

/**
 * Limpiar usuario
 */
export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem('user');
}

/**
 * Logout: limpiar todo
 */
export async function logout(): Promise<void> {
  await Promise.all([
    clearToken(),
    clearUser(),
  ]);
}
