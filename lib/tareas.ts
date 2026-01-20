import { apiCall } from './api-backend';

interface TareaData {
  admin_email: string;
  admin_nombre: string;
  empleado_email: string;
  descripcion: string;
}

export type EstadoTarea = 'pendiente' | 'en_proceso' | 'completada' | 'rechazada';

// Crear una nueva tarea
export async function crearTarea(datos: TareaData) {
  try {
    console.log('[LIB-TAREAS] Creando tarea para:', datos.empleado_email);
    
    const result = await apiCall('/tareas/crear', {
      method: 'POST',
      body: JSON.stringify({
        admin_email: datos.admin_email,
        admin_nombre: datos.admin_nombre,
        empleado_email: datos.empleado_email,
        descripcion: datos.descripcion,
      }),
    });

    if (!result.success) {
      console.error('[LIB-TAREAS] Error:', result.error);
      return { success: false, error: result.error || 'Error al crear tarea' };
    }

    console.log('[LIB-TAREAS] Tarea creada exitosamente');
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('[LIB-TAREAS] Exception en crearTarea:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Obtener todas las tareas de un empleado
export async function obtenerTareasEmpleado(empleadoEmail: string) {
  try {
    console.log('[LIB-TAREAS] Obteniendo tareas del empleado:', empleadoEmail);
    
    const result = await apiCall(`/tareas/empleado-email/${empleadoEmail}`, {
      method: 'GET',
    });

    if (!result.success) {
      console.error('[LIB-TAREAS] Error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[LIB-TAREAS] Tareas obtenidas:', result.data?.length || 0);
    return { success: true, data: result.data || [] };
  } catch (error: any) {
    console.error('[LIB-TAREAS] Error al obtener tareas:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todas las tareas (para admin)
export async function obtenerTodasLasTareas() {
  try {
    console.log('[LIB-TAREAS] Obteniendo TODAS las tareas (admin)');
    
    const result = await apiCall('/tareas/todas', {
      method: 'GET',
    });

    if (!result.success) {
      console.error('[LIB-TAREAS] Error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[LIB-TAREAS] Total de tareas:', result.data?.length || 0);
    return { success: true, data: result.data || [] };
  } catch (error: any) {
    console.error('[LIB-TAREAS] Error al obtener tareas:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todos los empleados
export async function obtenerEmpleados() {
  try {
    console.log('[LIB-TAREAS] Obteniendo lista de empleados');
    
    const result = await apiCall('/tareas/empleados/lista', {
      method: 'GET',
    });

    if (!result.success) {
      console.error('[LIB-TAREAS] Error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[LIB-TAREAS] Empleados obtenidos:', result.data?.length || 0);
    return { success: true, data: result.data || [] };
  } catch (error: any) {
    console.error('[LIB-TAREAS] Error al obtener empleados:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar estado de una tarea
export async function actualizarEstadoTarea(id: string, estado: EstadoTarea) {
  try {
    console.log('[LIB-TAREAS] Actualizando tarea', id, 'a estado:', estado);
    
    const result = await apiCall(`/tareas/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });

    if (!result.success) {
      console.error('[LIB-TAREAS] Error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[LIB-TAREAS] Tarea actualizada exitosamente');
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('[LIB-TAREAS] Error al actualizar estado:', error);
    return { success: false, error: error.message };
  }
}

// Obtener una tarea por ID
export async function obtenerTareaPorId(id: string) {
  try {
    console.log('[LIB-TAREAS] Obteniendo tarea:', id);
    
    const result = await apiCall(`/tareas/${id}`, {
      method: 'GET',
    });

    if (!result.success) {
      console.error('[LIB-TAREAS] Error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('[LIB-TAREAS] Tarea obtenida:', id);
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('[LIB-TAREAS] Error al obtener tarea:', error);
    return { success: false, error: error.message };
  }
}
