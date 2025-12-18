import { supabase } from './supabase';

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
    const { data, error } = await supabase
      .from('tareas')
      .insert([
        {
          admin_email: datos.admin_email,
          admin_nombre: datos.admin_nombre,
          empleado_email: datos.empleado_email,
          descripcion: datos.descripcion,
          estado: 'pendiente',
        },
      ])
      .select();

    if (error) {
      console.error('Error al crear tarea:', error);
      return { success: false, error: error.message || 'Error al crear tarea' };
    }

    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Exception en crearTarea:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Obtener todas las tareas de un empleado
export async function obtenerTareasEmpleado(empleadoEmail: string) {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('empleado_email', empleadoEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener tareas:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todas las tareas (para admin)
export async function obtenerTodasLasTareas() {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener tareas:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todos los empleados
export async function obtenerEmpleados() {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, nombre, apellido, rol')
      .eq('rol', 'empleado')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener empleados:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar estado de una tarea
export async function actualizarEstadoTarea(id: string, estado: EstadoTarea) {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .update({ 
        estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return { success: false, error: error.message };
  }
}

// Obtener una tarea por ID
export async function obtenerTareaPorId(id: string) {
  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error al obtener tarea:', error);
    return { success: false, error: error.message };
  }
}
