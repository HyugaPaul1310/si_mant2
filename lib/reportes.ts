import { apiCall } from './api-backend';
import { uploadToCloudflare } from './cloudflare';

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
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  direccion_sucursal?: string;
}

interface ReporteArchivo {
  id?: string;
  reporte_id: string;
  tipo_archivo: 'foto' | 'video' | 'pdf';
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
    // Mapear datos del frontend a los campos que espera el backend
    const titulo = `${datos.equipo_descripcion || 'Reporte'} - ${datos.sucursal || 'Sin sucursal'}`;
    const descripcion = `
Modelo: ${datos.equipo_modelo || 'N/A'}
Serie: ${datos.equipo_serie || 'N/A'}
Sucursal: ${datos.sucursal || 'N/A'}
Comentario: ${datos.comentario || 'N/A'}
Prioridad: ${datos.prioridad || 'media'}
    `.trim();

    console.log('[CLIENTE] Enviando reporte:', {
      titulo,
      descripcion,
      estado: 'pendiente',
      prioridad: datos.prioridad || 'media',
    });

    return apiCall('/reportes', 'POST', {
      titulo,
      descripcion,
      estado: 'pendiente',
      prioridad: datos.prioridad || 'media',
    });
  } catch (error: any) {
    console.error('Exception en crearReporte:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function obtenerReportesPorUsuario(email: string) {
  try {
    const data = await apiCall(`/reportes/por-usuario/${email}`, 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    return { success: false, error: error.message };
  }
}

export async function obtenerTodosLosReportes() {
  try {
    const data = await apiCall('/reportes/todos/admin/list', 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
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

  try {
    console.log(`[actualizarEstadoReporte] Actualizando reporte ${id} con estado: "${estado}"`);
    const data = await apiCall(`/reportes/${id}/estado`, 'PUT', { estado });

    if (!data.success) throw new Error(data.error);
    console.log(`[actualizarEstadoReporte] Actualización exitosa:`, data.data);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return { success: false, error: error.message };
  }
}

// Asignar reporte a un empleado
export async function asignarReporteAEmpleado(reporteId: string, empleadoEmail: string, empleadoNombre: string) {
  try {
    console.log(`[asignarReporteAEmpleado] Asignando reporte ${reporteId} a ${empleadoEmail}`);
    const data = await apiCall(`/reportes/${reporteId}/asignar`, 'PUT', {
      empleadoEmail,
      empleadoNombre
    });

    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al asignar reporte:', error);
    return { success: false, error: error.message };
  }
}

// Obtener reportes asignados a un empleado
export async function obtenerReportesAsignados(empleadoEmail: string) {
  try {
    const data = await apiCall(`/reportes/empleado?email=${encodeURIComponent(empleadoEmail)}`, 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
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
  const ESTADOS_PERMITIDOS = ['en_proceso', 'en espera', 'terminado', 'cotizado', 'finalizado_por_tecnico', 'cerrado_por_cliente'];
  const key = nuevoEstado.trim().toLowerCase();
  const mapa: Record<string, string> = {
    'en proceso': 'en_proceso',
    'en_proceso': 'en_proceso',
    'en espera': 'en espera',
    'en_espera': 'en espera',
    terminado: 'terminado',
    finalizado: 'finalizado_por_tecnico',
    'finalizado_por_tecnico': 'finalizado_por_tecnico',
    cotizado: 'cotizado',
    'cerrado': 'cerrado',
    'cerrado_por_cliente': 'cerrado',
  };

  const normalized = mapa[key] || key;

  if (!ESTADOS_PERMITIDOS.includes(normalized)) {
    return { success: false, error: 'Estado no permitido' };
  }

  try {
    const updateData: any = { estado: normalized };

    if (normalized === 'cotizado' && descripcionTrabajo && precioCotizacion) {
      updateData.descripcionTrabajo = descripcionTrabajo;
      updateData.precioCotizacion = precioCotizacion;
    }

    if (normalized === 'finalizado_por_tecnico') {
      updateData.finalizado_por_tecnico_at = new Date().toISOString();
      updateData.trabajo_completado = true;
    }

    if (normalized === 'cerrado_por_cliente') {
      updateData.cerrado_por_cliente_at = new Date().toISOString();
    }

    const data = await apiCall(`/reportes/${reporteId}/estado`, 'PUT', updateData);

    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al actualizar estado del reporte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marcar reporte como "finalizado por técnico"
 */
export async function actualizarEstadoFinalizadoPorTecnico(reporteId: string) {
  try {
    console.log(`[REPORTES] Marcando reporte ${reporteId} como "finalizado_por_tecnico"`);

    const data = await apiCall(`/reportes/${reporteId}/estado`, 'PUT', {
      estado: 'finalizado_por_tecnico',
      finalizado_por_tecnico_at: new Date().toISOString(),
      trabajo_completado: true,
    });

    if (!data.success) throw new Error(data.error);

    console.log(`[REPORTES] ✓ Reporte finalizado por técnico:`, data.data);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al marcar como finalizado por técnico:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marcar reporte como "cerrado por cliente"
 */
export async function actualizarEstadoCerradoPorCliente(reporteId: string) {
  try {
    console.log(`[REPORTES] Marcando reporte ${reporteId} como "cerrado"`);

    const data = await apiCall(`/reportes/${reporteId}/estado`, 'PUT', {
      estado: 'cerrado_por_cliente',
      cerrado_por_cliente_at: new Date().toISOString(),
    });

    if (!data.success) throw new Error(data.error);

    console.log(`[REPORTES] ✓ Reporte cerrado por cliente:`, data.data);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al marcar como cerrado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener reportes que están "finalizado_por_tecnico"
 * Filtrado en cliente
 */
export async function obtenerReportesFinalizadosPorTecnico(clienteEmail: string) {
  try {
    const res = await apiCall(`/reportes/cliente?email=${encodeURIComponent(clienteEmail)}`, 'GET');
    if (!res.success) throw new Error(res.error);

    const finalizados = (res.data || []).filter((r: any) => r.estado === 'finalizado_por_tecnico');
    return { success: true, data: finalizados };
  } catch (error: any) {
    console.error('Error al obtener reportes finalizados:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener reportes cerrados por cliente
 * Filtrado en cliente
 */
export async function obtenerReportesCerradosPorCliente(clienteEmail: string) {
  try {
    const res = await apiCall(`/reportes/cliente?email=${encodeURIComponent(clienteEmail)}`, 'GET');
    if (!res.success) throw new Error(res.error);

    const cerrados = (res.data || []).filter((r: any) => r.estado === 'cerrado_por_cliente');
    return { success: true, data: cerrados };
  } catch (error: any) {
    console.error('Error al obtener reportes cerrados:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Guardar archivo reporte
 */
export async function guardarArchivoReporte(archivo: ReporteArchivo) {
  try {
    const response = await apiCall('/reportes/archivos', 'POST', {
      reporte_id: archivo.reporte_id,
      tipo_archivo: archivo.tipo_archivo,
      cloudflare_url: archivo.cloudflare_url,
      cloudflare_key: archivo.cloudflare_key,
      nombre_original: archivo.nombre_original,
      tamaño: archivo.tamaño,
    });

    if (!response.success) throw new Error(response.error);
    return { success: true, data: response.data };
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
    const data = await apiCall(`/reportes/${reporteId}/archivos`, 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
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
    const res = await obtenerArchivosReporte(reporteId);
    if (!res.success) throw new Error(res.error);
    const fotos = (res.data || []).filter((f: any) => f.tipo_archivo === 'foto');
    return { success: true, data: fotos };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Obtener solo videos de un reporte
 */
export async function obtenerVideosReporte(reporteId: string) {
  try {
    const res = await obtenerArchivosReporte(reporteId);
    if (!res.success) throw new Error(res.error);
    const videos = (res.data || []).filter((f: any) => f.tipo_archivo === 'video');
    return { success: true, data: videos };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar un archivo de un reporte
 */
export async function eliminarArchivoReporte(archivoId: string, cloudflareKey: string) {
  try {
    const data = await apiCall(`/reportes/archivos/${archivoId}`, 'DELETE');
    if (!data.success) throw new Error(data.error);
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
    console.log(`[SUBIR-ARCHIVOS] Iniciando subida para reporte: ${reporteId}`);
    const archivosGuardados = [];

    // Subir imágenes
    if (imagenesUris && imagenesUris.length > 0) {
      for (let i = 0; i < imagenesUris.length; i++) {
        const uri = imagenesUris[i];
        const nombreArchivo = `foto-${Date.now()}-${i}.jpg`;
        const resultado = await uploadToCloudflare(uri, nombreArchivo, 'foto');

        if (resultado.success && resultado.url && resultado.key) {
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
      const resultado = await uploadToCloudflare(videoUri, nombreArchivo, 'video');

      if (resultado.success && resultado.url && resultado.key) {
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

export async function guardarCotizacion(cotizacion: Cotizacion) {
  try {
    const data = await apiCall(`/reportes/${cotizacion.reporte_id}/cotizacion`, 'POST', {
      empleado_nombre: cotizacion.empleado_nombre,
      analisis_general: cotizacion.analisis_general,
      precio_cotizacion: cotizacion.precio_cotizacion
    });

    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al guardar cotización:', error);
    return { success: false, error: error.message };
  }
}

export async function obtenerCotizacionesCliente(empresaId?: string, userEmail?: string) {
  try {
    if (!userEmail) return { success: true, data: [] };
    const data = await apiCall(`/reportes/cotizaciones/cliente/${userEmail}`, 'GET');
    if (!data.success) throw new Error(data.error);

    let resultado = data.data || [];
    if (empresaId) {
      resultado = resultado.filter((cot: any) => cot.empresa === empresaId);
    }
    return { success: true, data: resultado };
  } catch (error: any) {
    console.error('Error en obtenerCotizacionesCliente:', error);
    return { success: false, error: error.message };
  }
}

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

    const data = await apiCall(`/reportes/${reporteId}/estado`, 'PUT', updateData);
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al actualizar fase 2:', error);
    return { success: false, error: error.message };
  }
}

export async function guardarEncuestaSatisfaccion(encuesta: any) {
  try {
    const data = await apiCall('/reportes/encuestas/guardar', 'POST', encuesta);
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data };
  } catch (error: any) {
    console.error('Error al guardar encuesta:', error);
    return { success: false, error: error.message };
  }
}

export async function obtenerEncuestasPorReporte(reporteId: string) {
  try {
    const data = await apiCall(`/reportes/encuestas/reporte/${reporteId}`, 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    console.error('Error al obtener encuestas:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function obtenerEncuestasCliente(clienteEmail: string) {
  try {
    const data = await apiCall(`/reportes/encuestas/cliente/${clienteEmail}`, 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    console.error('Error al obtener encuestas del cliente:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function obtenerEncuestasEmpleado(empleadoEmail: string) {
  try {
    const data = await apiCall(`/reportes/encuestas/empleado/${empleadoEmail}`, 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    console.error('Error al obtener encuestas del empleado:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function obtenerTodasLasEncuestas() {
  try {
    const data = await apiCall('/reportes/encuestas/todas', 'GET');
    if (!data.success) throw new Error(data.error);
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    console.error('Error al obtener todas las encuestas:', error);
    return { success: false, error: error.message };
  }
}