import { uploadToCloudflare } from './cloudflare';
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
}

interface ReporteArchivo {
  id?: string;
  reporte_id: string;
  tipo_archivo: 'foto' | 'video';
  cloudflare_url: string;
  cloudflare_key: string;
  nombre_original?: string;
  tamaño?: number;
}

interface Cotizacion {
  reporte_id: string;
  empleado_nombre?: string;
  analisis_general: string;
  precio_cotizacion: number;
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
        estado: 'pendiente'
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
export async function actualizarEstadoReporteAsignado(
  reporteId: string, 
  nuevoEstado: string,
  descripcionTrabajo?: string,
  precioCotizacion?: number
) {
  const ESTADOS_PERMITIDOS = ['en_proceso', 'en espera', 'terminado', 'cotizado'];
  const key = nuevoEstado.trim().toLowerCase();
  const mapa: Record<string, string> = {
    'en proceso': 'en_proceso',
    'en_proceso': 'en_proceso',
    'en espera': 'en espera',
    'en_espera': 'en espera',
    terminado: 'terminado',
    finalizado: 'terminado',
    cotizado: 'cotizado',
  };

  const normalized = mapa[key] || key;

  if (!ESTADOS_PERMITIDOS.includes(normalized)) {
    return { success: false, error: 'Estado no permitido' };
  }

  try {
    const updateData: any = { estado: normalized };
    
    // Si es cotizado, agregar descripción y precio
    if (normalized === 'cotizado' && descripcionTrabajo && precioCotizacion) {
      updateData.descripcion_trabajo = descripcionTrabajo;
      updateData.precio_cotizacion = precioCotizacion;
    }

    const { data, error } = await supabase
      .from('reportes')
      .update(updateData)
      .eq('id', reporteId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al actualizar estado del reporte:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Guardar archivo subido a Cloudflare en la base de datos
 */
export async function guardarArchivoReporte(archivo: ReporteArchivo) {
  try {
    console.log(`[REPORTES.TS] Guardando archivo en BD:`, {
      reporte_id: archivo.reporte_id,
      tipo_archivo: archivo.tipo_archivo,
      cloudflare_url: archivo.cloudflare_url,
    });
    
    const { data, error } = await supabase
      .from('reporte_archivos')
      .insert([
        {
          reporte_id: archivo.reporte_id,
          tipo_archivo: archivo.tipo_archivo,
          cloudflare_url: archivo.cloudflare_url,
          cloudflare_key: archivo.cloudflare_key,
          nombre_original: archivo.nombre_original || null,
          tamaño: archivo.tamaño || null,
        },
      ])
      .select();

    if (error) {
      console.error(`[REPORTES.TS] Error al insertar archivo en BD:`, error);
      throw error;
    }
    
    console.log(`[REPORTES.TS] Archivo guardado exitosamente:`, data?.[0]);
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error(`[REPORTES.TS] Exception en guardarArchivoReporte:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener archivos de un reporte
 */
export async function obtenerArchivosReporte(reporteId: string) {
  try {
    console.log(`[REPORTES.TS] Obteniendo archivos para reporte: ${reporteId}`);
    
    const { data, error } = await supabase
      .from('reporte_archivos')
      .select('*')
      .eq('reporte_id', reporteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[REPORTES.TS] Error al obtener archivos:`, error);
      throw error;
    }
    
    console.log(`[REPORTES.TS] Archivos obtenidos: ${data?.length || 0}`, data);
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener archivos del reporte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener solo fotos de un reporte
 */
export async function obtenerFotosReporte(reporteId: string) {
  try {
    const { data, error } = await supabase
      .from('reporte_archivos')
      .select('*')
      .eq('reporte_id', reporteId)
      .eq('tipo_archivo', 'foto')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener fotos del reporte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener solo videos de un reporte
 */
export async function obtenerVideosReporte(reporteId: string) {
  try {
    const { data, error } = await supabase
      .from('reporte_archivos')
      .select('*')
      .eq('reporte_id', reporteId)
      .eq('tipo_archivo', 'video')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener videos del reporte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar un archivo de un reporte
 */
export async function eliminarArchivoReporte(archivoId: string, cloudflareKey: string) {
  try {
    // Eliminar de la base de datos
    const { error } = await supabase
      .from('reporte_archivos')
      .delete()
      .eq('id', archivoId);

    if (error) throw error;

    // TODO: Eliminar de Cloudflare R2 usando cloudflareKey
    // await deleteFromCloudflare(cloudflareKey);

    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar archivo del reporte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subir archivos a Cloudflare y guardarlos en la BD
 */
export async function subirArchivosReporte(
  reporteId: string,
  imagenesUris?: string[],
  videoUri?: string
) {
  try {
    const archivosGuardados = [];

    // Subir imágenes
    if (imagenesUris && imagenesUris.length > 0) {
      for (let i = 0; i < imagenesUris.length; i++) {
        const uri = imagenesUris[i];
        const nombreArchivo = `foto-${Date.now()}-${i}.jpg`;

        // Subir a Cloudflare
        const resultado = await uploadToCloudflare(uri, nombreArchivo, 'foto');

        if (resultado.success && resultado.url && resultado.key) {
          // Guardar en BD
          const guardado = await guardarArchivoReporte({
            reporte_id: reporteId,
            tipo_archivo: 'foto',
            cloudflare_url: resultado.url,
            cloudflare_key: resultado.key,
            nombre_original: nombreArchivo,
          });

          if (guardado.success) {
            archivosGuardados.push({
              tipo: 'foto',
              url: resultado.url,
              id: guardado.data?.id,
            });
          }
        }
      }
    }

    // Subir video
    if (videoUri) {
      const nombreArchivo = `video-${Date.now()}.mp4`;

      // Subir a Cloudflare
      const resultado = await uploadToCloudflare(videoUri, nombreArchivo, 'video');

      if (resultado.success && resultado.url && resultado.key) {
        // Guardar en BD
        const guardado = await guardarArchivoReporte({
          reporte_id: reporteId,
          tipo_archivo: 'video',
          cloudflare_url: resultado.url,
          cloudflare_key: resultado.key,
          nombre_original: nombreArchivo,
        });

        if (guardado.success) {
          archivosGuardados.push({
            tipo: 'video',
            url: resultado.url,
            id: guardado.data?.id,
          });
        }
      }
    }

    return { success: true, archivos: archivosGuardados };
  } catch (error: any) {
    console.error('Error al subir archivos del reporte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Guardar cotización del reporte
 */
export async function guardarCotizacion(cotizacion: Cotizacion) {
  try {
    console.log('[GUARDAR-COTIZACIÓN] Guardando cotización:', cotizacion);
    
    const { data, error } = await supabase
      .from('cotizaciones')
      .insert([
        {
          reporte_id: cotizacion.reporte_id,
          empleado_nombre: cotizacion.empleado_nombre,
          analisis_general: cotizacion.analisis_general,
          precio_cotizacion: cotizacion.precio_cotizacion,
          estado: 'pendiente',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('[GUARDAR-COTIZACIÓN] Error al guardar:', error);
      throw error;
    }
    
    console.log('[GUARDAR-COTIZACIÓN] Cotización guardada exitosamente:', data?.[0]);
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al guardar cotización:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener todas las cotizaciones de una empresa (cliente)
 * Solución robusta para Expo/React Native
 */
export async function obtenerCotizacionesCliente(empresaId?: string, userEmail?: string) {
  try {
    console.log('[COTIZACIONES] Iniciando obtenerCotizacionesCliente con:', { empresaId, userEmail });
    
    // Paso 1: Obtener cotizaciones con join a reportes
    const { data: cotizacionesConReportes, error: errorCotizaciones } = await supabase
      .from('cotizaciones')
      .select(`
        id,
        reporte_id,
        empleado_nombre,
        analisis_general,
        precio_cotizacion,
        estado,
        created_at,
        reportes (
          id,
          usuario_email,
          usuario_nombre,
          equipo_descripcion,
          comentario,
          prioridad,
          empresa,
          sucursal
        )
      `)
      .order('created_at', { ascending: false });

    if (errorCotizaciones) {
      console.error('[COTIZACIONES] Error en query principal:', errorCotizaciones);
      throw errorCotizaciones;
    }

    console.log('[COTIZACIONES] Cotizaciones obtenidas (con join):', cotizacionesConReportes?.length || 0);
    
    if (!cotizacionesConReportes || cotizacionesConReportes.length === 0) {
      console.log('[COTIZACIONES] No hay cotizaciones en la BD');
      return { success: true, data: [] };
    }

    // Paso 2: Log detallado de cada cotización para debuggear
    cotizacionesConReportes.forEach((cot: any, idx: number) => {
      console.log(`[COTIZACIONES] [${idx}] ID: ${cot.id}, Reporte: ${cot.reporte_id}, Usuario en relación: ${cot.reportes?.usuario_email || 'null'}`);
    });

    // Paso 3: Aplicar filtros si es necesario
    let resultado = cotizacionesConReportes;

    if (userEmail) {
      console.log(`[COTIZACIONES] Filtrando por usuario: "${userEmail}"`);
      resultado = cotizacionesConReportes.filter((cot: any) => {
        const usuarioEmail = cot.reportes?.usuario_email;
        const coincide = usuarioEmail === userEmail;
        if (!coincide) {
          console.log(`[COTIZACIONES] ❌ No coincide: "${usuarioEmail}" !== "${userEmail}"`);
        } else {
          console.log(`[COTIZACIONES] ✓ Coincide: "${usuarioEmail}" === "${userEmail}"`);
        }
        return coincide;
      });
      console.log('[COTIZACIONES] Después de filtro por usuario:', resultado.length);
    }

    if (empresaId) {
      console.log(`[COTIZACIONES] Filtrando por empresa: "${empresaId}"`);
      resultado = resultado.filter((cot: any) => cot.reportes?.empresa === empresaId);
      console.log('[COTIZACIONES] Después de filtro por empresa:', resultado.length);
    }

    console.log('[COTIZACIONES] Resultado final:', JSON.stringify(resultado, null, 2));
    return { success: true, data: resultado };

  } catch (error: any) {
    console.error('[COTIZACIONES] Exception en obtenerCotizacionesCliente:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar estado de cotización
 */
export async function actualizarEstadoCotizacion(cotizacionId: string, nuevoEstado: 'pendiente' | 'aceptada' | 'rechazada') {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .update({ estado: nuevoEstado })
      .eq('id', cotizacionId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al actualizar cotización:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar campos de Fase 2 (ejecución del trabajo)
 */
export async function actualizarFase2Reporte(
  reporteId: string,
  datos: {
    revision?: string;
    recomendaciones?: string;
    reparacion?: string;
    recomendaciones_adicionales?: string;
    materiales_refacciones?: string;
    trabajo_completado?: boolean;
  }
) {
  try {
    const updateData: any = {};
    if (datos.revision !== undefined) updateData.revision = datos.revision;
    if (datos.recomendaciones !== undefined) updateData.recomendaciones = datos.recomendaciones;
    if (datos.reparacion !== undefined) updateData.reparacion = datos.reparacion;
    if (datos.recomendaciones_adicionales !== undefined) updateData.recomendaciones_adicionales = datos.recomendaciones_adicionales;
    if (datos.materiales_refacciones !== undefined) updateData.materiales_refacciones = datos.materiales_refacciones;
    if (datos.trabajo_completado !== undefined) updateData.trabajo_completado = datos.trabajo_completado;

    const { data, error } = await supabase
      .from('reportes')
      .update(updateData)
      .eq('id', reporteId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al actualizar fase 2:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener evidencia (imágenes/videos) de un reporte
 */
export async function obtenerEvidenciaReporte(reporteId: string) {
  try {
    const { data, error } = await supabase
      .from('reportes_evidencia')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener evidencia:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Guardar evidencia (imágenes/videos) de un reporte
 */
export async function guardarEvidenciaReporte(evidencia: {
  reporte_id: string;
  tipo_archivo: 'foto' | 'video';
  cloudflare_url: string;
  cloudflare_key: string;
  nombre_original?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('reportes_evidencia')
      .insert([evidencia])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al guardar evidencia:', error);
    return { success: false, error: error.message };
  }
}
/**
 * ========================================
 * SISTEMA DE ENCUESTAS - FUNCIONES LIMPIAS
 * ========================================
 */

/**
 * Guardar respuestas de encuesta (NUEVO SISTEMA LIMPIO)
 */
export async function guardarEncuestaSatisfaccion(encuesta: {
  reporte_id: string;
  cliente_email: string;
  cliente_nombre: string;
  empleado_email: string;
  empleado_nombre: string;
  empresa?: string;
  trato_equipo: string;
  equipo_tecnico: string;
  personal_administrativo: string;
  rapidez: string;
  costo_calidad: string;
  recomendacion: string;
  satisfaccion: string;
}) {
  try {
    console.log('💾 Guardando encuesta:', encuesta.reporte_id);
    
    // Construir objeto limpio para insertar
    const datosEncuesta = {
      reporte_id: encuesta.reporte_id,
      cliente_email: encuesta.cliente_email,
      cliente_nombre: encuesta.cliente_nombre,
      empleado_email: encuesta.empleado_email,
      empleado_nombre: encuesta.empleado_nombre,
      empresa: encuesta.empresa || null,
      trato_equipo: encuesta.trato_equipo,
      equipo_tecnico: encuesta.equipo_tecnico,
      personal_administrativo: encuesta.personal_administrativo,
      rapidez: encuesta.rapidez,
      costo_calidad: encuesta.costo_calidad,
      recomendacion: encuesta.recomendacion,
      satisfaccion: encuesta.satisfaccion,
    };
    
    // INSERT directo
    const { data, error } = await supabase
      .from('encuestas_satisfaccion')
      .insert([datosEncuesta])
      .select();

    if (error) {
      console.error('❌ Error de Supabase:', error.message);
      throw error;
    }
    
    console.log('✅ Encuesta guardada:', data?.[0]?.id);
    return { success: true, data: data?.[0], error: null };
  } catch (error: any) {
    console.error('❌ Error al guardar encuesta:', error.message);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Obtener encuestas por reporte
 */
export async function obtenerEncuestasPorReporte(reporteId: string) {
  try {
    const { data, error } = await supabase
      .from('encuestas_satisfaccion')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener encuestas:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Obtener todas las encuestas de un cliente
 */
export async function obtenerEncuestasCliente(clienteEmail: string) {
  try {
    const { data, error } = await supabase
      .from('encuestas_satisfaccion')
      .select('*')
      .eq('cliente_email', clienteEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener encuestas del cliente:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Obtener todas las encuestas de un empleado
 */
export async function obtenerEncuestasEmpleado(empleadoEmail: string) {
  try {
    const { data, error } = await supabase
      .from('encuestas_satisfaccion')
      .select('*')
      .eq('empleado_email', empleadoEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener encuestas del empleado:', error);
    return { success: false, data: [], error: error.message };
  }
}