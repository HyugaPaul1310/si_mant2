import { supabase } from './supabase';

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
  const { data, error } = await supabase.from('empresas').select('id, nombre').order('nombre');
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: (data as Empresa[]) || [] };
}

/**
 * Crea una empresa nueva (solo admins)
 */
export async function crearEmpresa(nombre: string) {
  const limpio = nombre.trim();
  if (!limpio) return { success: false, error: 'El nombre es requerido' };
  const { data, error } = await supabase
    .from('empresas')
    .insert([{ nombre: limpio }])
    .select('id, nombre')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Empresa };
}

/**
 * Actualiza una empresa (solo admins)
 */
export async function actualizarEmpresa(id: string, cambios: Partial<Empresa>) {
  const payload: any = {};
  if (cambios.nombre !== undefined) {
    const limpio = cambios.nombre.trim();
    if (!limpio) return { success: false, error: 'El nombre es requerido' };
    payload.nombre = limpio;
  }
  const { data, error } = await supabase
    .from('empresas')
    .update(payload)
    .eq('id', id)
    .select('id, nombre')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Empresa };
}

/**
 * Crea una sucursal para una empresa (solo admins)
 */
export async function crearSucursal(
  payload: Omit<Sucursal, 'id' | 'activo'> & { activo?: boolean }
) {
  const { data, error } = await supabase
    .from('sucursales')
    .insert([{ ...payload, activo: payload.activo ?? true }])
    .select('id, empresa_id, nombre, direccion, ciudad, activo')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Sucursal };
}

/**
 * Lista sucursales por empresa (solo admins)
 */
export async function obtenerSucursalesPorEmpresa(empresaId: string) {
  const { data, error } = await supabase
    .from('sucursales')
    .select('id, empresa_id, nombre, direccion, ciudad, activo')
    .eq('empresa_id', empresaId)
    .order('nombre');
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: (data as Sucursal[]) || [] };
}

/**
 * Actualiza una sucursal (solo admins)
 */
export async function actualizarSucursal(id: string, cambios: Partial<Sucursal>) {
  const { data, error } = await supabase
    .from('sucursales')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, empresa_id, nombre, direccion, ciudad, activo')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Sucursal };
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
  const { error } = await supabase.from('sucursales').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Elimina una empresa (solo admins)
 */
export async function eliminarEmpresa(id: string) {
  const { error } = await supabase.from('empresas').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Obtiene las sucursales de la empresa del usuario
 */
export async function obtenerSucursalesPorUsuario(userEmail: string) {
  try {
    // Primero obtener el usuario y su empresa_id
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('email', userEmail)
      .single();

    if (usuarioError || !usuarioData?.empresa_id) {
      console.error('Error al obtener usuario:', usuarioError);
      return { success: false, error: 'No se encontró la empresa del usuario', data: [] };
    }

    // Luego obtener las sucursales de esa empresa
    const { data, error } = await supabase
      .from('sucursales')
      .select('id, empresa_id, nombre, direccion, ciudad, activo')
      .eq('empresa_id', usuarioData.empresa_id)
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error al obtener sucursales:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
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
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('id', sucursalId)
      .single();

    if (error) {
      console.error('Error al obtener sucursal:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error en obtenerSucursalPorId:', error);
    return { success: false, error: error.message };
  }
}
