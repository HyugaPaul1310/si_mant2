import { apiCall } from './api-backend';

// TODO: Archivo completamente migrado a backend (routes/empresas.js)
// Se eliminó toda dependencia de Supabase

export interface Sucursal {
  id: string;
  empresa_id: string;
  nombre: string;
  direccion: string;
  ciudad?: string;
  activo: boolean;
}

export interface Empresa {
  id: string;
  nombre: string;
}

/**
 * Lista todas las empresas (solo admins)
 */
export async function obtenerEmpresas() {
  try {
    const data = await apiCall('/empresas', 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    console.error('Error al obtener empresas:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Crea una empresa nueva (solo admins)
 */
export async function crearEmpresa(nombre: string) {
  try {
    const limpio = nombre.trim();
    if (!limpio) return { success: false, error: 'El nombre es requerido' };
    
    const data = await apiCall('/empresas', 'POST', { nombre: limpio });
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al crear empresa:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza una empresa (solo admins)
 */
export async function actualizarEmpresa(id: string, cambios: Partial<Empresa>) {
  try {
    const payload: any = {};
    if (cambios.nombre !== undefined) {
      const limpio = cambios.nombre.trim();
      if (!limpio) return { success: false, error: 'El nombre es requerido' };
      payload.nombre = limpio;
    }
    
    const data = await apiCall(`/empresas/${id}`, 'PUT', payload);
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al actualizar empresa:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crea una sucursal para una empresa (solo admins)
 */
export async function crearSucursal(
  payload: Omit<Sucursal, 'id' | 'activo'> & { activo?: boolean }
) {
  try {
    const data = await apiCall('/empresas/crear', 'POST', {
      ...payload,
      activo: payload.activo ?? true,
    });
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al crear sucursal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lista sucursales por empresa (solo admins)
 */
export async function obtenerSucursalesPorEmpresa(empresaId: string) {
  try {
    const data = await apiCall(`/empresas/empresa/${empresaId}`, 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    console.error('Error al obtener sucursales:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Actualiza una sucursal (solo admins)
 */
export async function actualizarSucursal(id: string, cambios: Partial<Sucursal>) {
  try {
    const data = await apiCall(`/empresas/${id}`, 'PUT', cambios);
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al actualizar sucursal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Desactiva una sucursal (solo admins)
 */
export async function desactivarSucursal(id: string) {
  return actualizarSucursal(id, { activo: false });
}

/**
 * Elimina una sucursal (solo admins)
 */
export async function eliminarSucursal(id: string) {
  try {
    const data = await apiCall(`/empresas/${id}`, 'DELETE');
    if (!data.success) throw new Error(data.error);
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar sucursal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina una empresa (solo admins)
 */
export async function eliminarEmpresa(id: string) {
  try {
    const data = await apiCall(`/empresas/${id}`, 'DELETE');
    if (!data.success) throw new Error(data.error);
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar empresa:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene las sucursales de la empresa del usuario
 */
export async function obtenerSucursalesPorUsuario(userEmail: string) {
  try {
    // Obtener usuario con su empresa_id desde el backend
    const userData = await apiCall(`/usuarios/por-email/${userEmail}`, 'GET');
    
    if (!userData.success || !userData.data?.empresa_id) {
      console.error('Error al obtener usuario:', userData.error);
      return { success: false, error: 'No se encontró la empresa del usuario', data: [] };
    }

    // Luego obtener las sucursales de esa empresa
    const sucursalesData = await apiCall(`/empresas/empresa/${userData.data.empresa_id}`, 'GET');
    
    if (!sucursalesData.success) {
      console.error('Error al obtener sucursales:', sucursalesData.error);
      return { success: false, error: sucursalesData.error, data: [] };
    }

    // Filtrar solo las activas
    const activas = sucursalesData.data.filter((s: any) => s.activo);
    return { success: true, data: activas || [] };
  } catch (error: any) {
    console.error('Error en obtenerSucursalesPorUsuario:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Obtiene una sucursal específica por ID
 */
export async function obtenerSucursalPorId(sucursalId: string) {
  try {
    // No hay endpoint específico para una sucursal por ID
    // Podrías crear uno en el backend si lo necesitas
    console.warn('obtenerSucursalPorId: Función no migrada completamente. Considera añadir endpoint en backend.');
    return { success: false, error: 'Función no implementada' };
  } catch (error: any) {
    console.error('Error en obtenerSucursalPorId:', error);
    return { success: false, error: error.message };
  }
}
