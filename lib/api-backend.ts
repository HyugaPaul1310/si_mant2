import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URL del backend Express según el entorno
// - Web (Expo web): localhost:3001
// - Emulador Android: 10.0.2.2:3001 (acceso a máquina host)
// - Emulador iOS: localhost:3001
// - Teléfono real: IP de la máquina (ej: 192.168.0.182:3001)

let API_URL = 'http://192.168.0.182:3001/api';

try {
  // Usar IP local para acceso desde teléfono en la misma red
  if (Platform.OS === 'android') {
    API_URL = 'http://192.168.0.182:3001/api';
  }
  // Si es iOS, usar IP local
  else if (Platform.OS === 'ios') {
    API_URL = 'http://192.168.0.182:3001/api';
  }
  // Si es web, usar IP local
  else {
    API_URL = 'http://192.168.0.182:3001/api';
  }
} catch (e) {
  // Fallback
  API_URL = 'http://192.168.0.182:3001/api';
}

interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  token?: string;
  user?: any;
  message?: string;
}

export async function apiCall<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const token = await AsyncStorage.getItem('token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Error en la solicitud'
      };
    }

    return data;
  } catch (error: any) {
    console.error('Error en apiCall:', error);
    return {
      success: false,
      error: error.message || 'Error en la solicitud'
    };
  }
}

// ==================== AUTENTICACIÓN ====================

export async function loginBackend(email: string, contraseña: string) {
  const result = await apiCall('/auth/login', 'POST', { email, contraseña });

  if (result.success && result.token) {
    await AsyncStorage.setItem('token', result.token);
    await AsyncStorage.setItem('user', JSON.stringify(result.user));
  }

  return result;
}

export async function registerBackend(datos: any) {
  return apiCall('/auth/register', 'POST', datos);
}

export async function getCurrentUser() {
  return apiCall('/auth/me', 'GET');
}

export async function logoutBackend() {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  return { success: true };
}

// ==================== REPORTES ====================

export async function obtenerReportesBackend() {
  return apiCall('/reportes', 'GET');
}

export async function crearReporteBackend(datos: any) {
  return apiCall('/reportes', 'POST', datos);
}

export async function actualizarReporteBackend(id: string, datos: any) {
  return apiCall(`/reportes/${id}`, 'PUT', datos);
}

export async function eliminarReporteBackend(id: string) {
  return apiCall(`/reportes/${id}`, 'DELETE');
}

// Asignar reporte a un empleado
export async function asignarReporteAEmpleadoBackend(reporteId: string, empleadoId: string) {
  return apiCall(`/reportes/${reporteId}/asignar`, 'PUT', { empleado_id: empleadoId });
}

// Obtener archivos de un reporte
export async function obtenerArchivosReporteBackend(reporteId: string) {
  return apiCall(`/reportes/${reporteId}/archivos`, 'GET');
}

// Obtener reportes asignados a un empleado
export async function obtenerReportesAsignados(empleadoEmail: string) {
  return apiCall(`/reportes/empleado?email=${encodeURIComponent(empleadoEmail)}`, 'GET');
}

// Actualizar estado de reporte asignado
export async function actualizarEstadoReporteAsignado(
  reporteId: string,
  nuevoEstado: string,
  descripcionTrabajo?: string,
  precioCotizacion?: number,
  fase2Data?: any
) {
  const datos: any = { estado: nuevoEstado };
  if (descripcionTrabajo) datos.descripcionTrabajo = descripcionTrabajo;
  if (precioCotizacion) datos.precioCotizacion = precioCotizacion;

  // Si hay datos de Fase 2, incluirlos
  if (fase2Data) {
    if (fase2Data.revision) datos.revision = fase2Data.revision;
    if (fase2Data.recomendaciones) datos.recomendaciones = fase2Data.recomendaciones;
    if (fase2Data.reparacion) datos.reparacion = fase2Data.reparacion;
    if (fase2Data.recomendaciones_adicionales) datos.recomendaciones_adicionales = fase2Data.recomendaciones_adicionales;
    if (fase2Data.materiales_refacciones) datos.materiales_refacciones = fase2Data.materiales_refacciones;
  }

  return apiCall(`/reportes/${reporteId}/estado`, 'PUT', datos);
}

// Obtener reportes del cliente (por email)
export async function obtenerReportesCliente(clienteEmail: string) {
  return apiCall(`/reportes/cliente?email=${encodeURIComponent(clienteEmail)}`, 'GET');
}

// ==================== TAREAS ====================

export async function obtenerTareasBackend() {
  return apiCall('/tareas', 'GET');
}

export async function obtenerTareasEmpleadoBackend(empleadoId: string) {
  return apiCall(`/tareas/empleado-email/${empleadoId}`, 'GET');
}

export async function crearTareaBackend(datos: any) {
  return apiCall('/tareas/crear', 'POST', datos);
}

export async function actualizarEstadoTareaBackend(id: string, estado: string) {
  return apiCall(`/tareas/${id}/estado`, 'PUT', { estado });
}

export async function eliminarTareaBackend(id: string) {
  return apiCall(`/tareas/${id}`, 'DELETE');
}

// ==================== INVENTARIO ====================

export async function obtenerHerramientasBackend() {
  return apiCall('/inventario/herramientas', 'GET');
}

export async function crearHerramientaBackend(datos: any) {
  return apiCall('/inventario/herramientas', 'POST', datos);
}

export async function obtenerAsignacionesBackend() {
  return apiCall('/inventario/asignaciones', 'GET');
}

export async function asignarHerramientaBackend(usuario_id: number, herramienta_nombre: string) {
  return apiCall('/inventario/asignar', 'POST', { usuario_id, herramienta_nombre });
}

export async function desasignarHerramientaBackend(asignacionId: string) {
  return apiCall(`/inventario/asignaciones/${asignacionId}`, 'DELETE');
}

// Obtener inventario de un empleado
export async function obtenerInventarioEmpleadoBackend(empleadoId: string) {
  return apiCall(`/inventario/empleado/${empleadoId}`, 'GET');
}

// Asignar herramienta a empleado (manual)
export async function asignarHerramientaAEmpleadoManualBackend(datos: any) {
  return apiCall('/inventario/asignar-manual', 'POST', datos);
}

// Marcar herramienta como devuelta
export async function marcarHerramientaComoDevueltaBackend(asignacionId: string, observaciones?: string) {
  return apiCall(`/inventario/asignaciones/${asignacionId}/devuelta`, 'PUT', { observaciones });
}

// Marcar herramienta como perdida
export async function marcarHerramientaComoPerdidaBackend(asignacionId: string, observaciones?: string) {
  return apiCall(`/inventario/asignaciones/${asignacionId}/perdida`, 'PUT', { observaciones });
}

// ==================== USUARIOS ====================

export async function obtenerUsuariosBackend() {
  return apiCall('/usuarios', 'GET');
}

export async function obtenerUsuarioBackend(id: string) {
  return apiCall(`/usuarios/${id}`, 'GET');
}

export async function actualizarUsuarioBackend(id: string, datos: any) {
  return apiCall(`/usuarios/${id}`, 'PUT', datos);
}

export async function cambiarRolUsuarioBackend(id: string, rol: string) {
  return apiCall(`/usuarios/${id}/role`, 'PUT', { rol });
}

export async function cambiarEstadoUsuarioBackend(id: string, estado: string) {
  return apiCall(`/usuarios/${id}/status`, 'PUT', { estado });
}

export async function eliminarUsuarioBackend(id: string) {
  return apiCall(`/usuarios/${id}`, 'DELETE');
}

// ==================== SUCURSALES ====================

export async function obtenerSucursalesCliente(email: string) {
  return apiCall(`/usuarios/sucursales?email=${encodeURIComponent(email)}`, 'GET');
}

