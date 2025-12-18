import { supabase } from './supabase';

interface ReporteData {
  usuario_email: string;
  usuario_nombre: string;
  usuario_apellido?: string;
  empresa?: string;
  sucursal?: string;
  sucursal_id?: string;
  equipo_descripcion: string;
  equipo_modelo?: string;
  equipo_serie?: string;
  comentario: string;
  prioridad: 'baja' | 'media' | 'urgente';
  direccion_sucursal?: string;
  ubicacion_maps?: string;
  foto_fachada_url?: string;
  imagenes_reporte?: string[];
  video_url?: string;
}

export async function crearReporte(datos: ReporteData) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .insert([
        {
          usuario_email: datos.usuario_email,
          usuario_nombre: datos.usuario_nombre,
          usuario_apellido: datos.usuario_apellido || null,
          empresa: datos.empresa || null,
          sucursal: datos.sucursal || null,
          sucursal_id: datos.sucursal_id || null,
          equipo_descripcion: datos.equipo_descripcion,
          equipo_modelo: datos.equipo_modelo || null,
          equipo_serie: datos.equipo_serie || null,
          comentario: datos.comentario,
          prioridad: datos.prioridad,
          direccion_sucursal: datos.direccion_sucursal || null,
          ubicacion_maps: datos.ubicacion_maps || null,
          foto_fachada_url: datos.foto_fachada_url || null,
          imagenes_reporte: datos.imagenes_reporte || null,
          video_url: datos.video_url || null,
          estado: 'pendiente',
        },
      ])
      .select();

    if (error) {
      console.error('Error al crear reporte:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Exception en crearReporte:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function obtenerReportesPorUsuario(email: string) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .eq('usuario_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    return { success: false, error: error.message };
  }
}

export async function obtenerTodosLosReportes() {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    return { success: false, error: error.message };
  }
}

const ESTADOS_PERMITIDOS = ['pendiente', 'en_proceso', 'en espera', 'terminado'] as const;
export type EstadoReporte = (typeof ESTADOS_PERMITIDOS)[number];

type EstadoEntrada = EstadoReporte | 'en_espera' | 'en proceso' | 'finalizado' | 'resuelto';

export async function actualizarEstadoReporte(id: string, estado: EstadoEntrada) {
  if (!id) return { success: false, error: 'ID inválido' };

  const key = estado.trim().toLowerCase();
  const mapa: Record<string, EstadoReporte> = {
    pendiente: 'pendiente',
    en_proceso: 'en_proceso',
    'en proceso': 'en_proceso',
    'en_espera': 'en espera',
    'en espera': 'en espera',
    terminado: 'terminado',
    finalizado: 'terminado',
    resuelto: 'terminado',
  };

  const normalized = mapa[key];
  console.log(`[actualizarEstadoReporte] estado entrada: "${estado}" -> key: "${key}" -> normalized: "${normalized}"`);

  if (!normalized || !ESTADOS_PERMITIDOS.includes(normalized)) {
    console.error(`[actualizarEstadoReporte] Estado no permitido: "${normalized}". Válidos: ${ESTADOS_PERMITIDOS.join(', ')}`);
    return { success: false, error: 'Estado no permitido' };
  }
  try {
    console.log(`[actualizarEstadoReporte] Actualizando reporte ${id} con estado: "${normalized}"`);
    const { data, error } = await supabase
      .from('reportes')
      .update({ estado: normalized })
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log(`[actualizarEstadoReporte] Actualización exitosa:`, data?.[0]);
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return { success: false, error: error.message };
  }
}

// Asignar reporte a un empleado
export async function asignarReporteAEmpleado(reporteId: string, empleadoEmail: string, empleadoNombre: string) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .update({ 
        empleado_asignado_email: empleadoEmail,
        empleado_asignado_nombre: empleadoNombre,
        estado: 'en_proceso'
      })
      .eq('id', reporteId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al asignar reporte:', error);
    return { success: false, error: error.message };
  }
}

// Obtener reportes asignados a un empleado
export async function obtenerReportesAsignados(empleadoEmail: string) {
  try {
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .eq('empleado_asignado_email', empleadoEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener reportes asignados:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar estado de reporte por empleado asignado
export async function actualizarEstadoReporteAsignado(reporteId: string, nuevoEstado: string) {
  const ESTADOS_PERMITIDOS = ['en_proceso', 'en espera', 'terminado'];
  const key = nuevoEstado.trim().toLowerCase();
  const mapa: Record<string, string> = {
    'en proceso': 'en_proceso',
    'en_proceso': 'en_proceso',
    'en espera': 'en espera',
    'en_espera': 'en espera',
    terminado: 'terminado',
    finalizado: 'terminado',
  };

  const normalized = mapa[key] || key;

  if (!ESTADOS_PERMITIDOS.includes(normalized)) {
    return { success: false, error: 'Estado no permitido' };
  }

  try {
    const { data, error } = await supabase
      .from('reportes')
      .update({ estado: normalized })
      .eq('id', reporteId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al actualizar estado del reporte:', error);
    return { success: false, error: error.message };
  }
}
