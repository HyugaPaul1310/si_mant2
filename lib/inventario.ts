import { supabase } from './supabase';

interface Herramienta {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  estado: string;
}

interface AsignacionInventario {
  id: string;
  herramienta_id: string;
  herramienta_nombre: string;
  empleado_email: string;
  empleado_nombre?: string;
  cantidad: number;
  estado: 'asignada' | 'devuelta' | 'perdida';
  observaciones?: string;
  fecha_asignacion: string;
  fecha_devolucion?: string;
  admin_email?: string;
  admin_nombre?: string;
}

// ===== HERRAMIENTAS =====

// Crear nueva herramienta
export async function crearHerramienta(nombre: string, descripcion?: string, categoria?: string) {
  try {
    const { data, error } = await supabase
      .from('inventario_herramientas')
      .insert([
        {
          nombre,
          descripcion: descripcion || null,
          categoria: categoria || null,
          estado: 'disponible',
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al crear herramienta:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todas las herramientas disponibles
export async function obtenerHerramientasDisponibles() {
  try {
    const { data, error } = await supabase
      .from('inventario_herramientas')
      .select('*')
      .eq('estado', 'disponible')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener herramientas:', error);
    return { success: false, error: error.message };
  }
}

// ===== ASIGNACIONES =====

// Asignar herramienta (manual o existente) a empleado
export async function asignarHerramientaAEmpleadoManual(
  herramientaNombre: string,
  empleadoEmail: string,
  empleadoNombre: string,
  cantidad: number,
  adminEmail: string,
  adminNombre: string,
  observaciones?: string
) {
  try {
    // Paso 1: Buscar o crear la herramienta
    let herramientaId: string;
    
    // Intentar buscar la herramienta existente
    const { data: existente, error: errorBusqueda } = await supabase
      .from('inventario_herramientas')
      .select('id')
      .eq('nombre', herramientaNombre)
      .single();

    if (existente) {
      herramientaId = existente.id;
    } else {
      // Si no existe, crearla
      const { data: nueva, error: errorCrear } = await supabase
        .from('inventario_herramientas')
        .insert([
          {
            nombre: herramientaNombre,
            estado: 'disponible',
          },
        ])
        .select()
        .single();

      if (errorCrear) throw errorCrear;
      herramientaId = nueva.id;
    }

    // Paso 2: Crear la asignación
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .insert([
        {
          herramienta_id: herramientaId,
          herramienta_nombre: herramientaNombre,
          empleado_email: empleadoEmail,
          empleado_nombre: empleadoNombre,
          cantidad,
          estado: 'asignada',
          observaciones: observaciones || null,
          admin_email: adminEmail,
          admin_nombre: adminNombre,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al asignar herramienta:', error);
    return { success: false, error: error.message };
  }
}

// Asignar herramienta a empleado
export async function asignarHerramientaAEmpleado(
  herramientaId: string,
  herramientaNombre: string,
  empleadoEmail: string,
  empleadoNombre: string,
  cantidad: number,
  adminEmail: string,
  adminNombre: string,
  observaciones?: string
) {
  try {
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .insert([
        {
          herramienta_id: herramientaId,
          herramienta_nombre: herramientaNombre,
          empleado_email: empleadoEmail,
          empleado_nombre: empleadoNombre,
          cantidad,
          estado: 'asignada',
          observaciones: observaciones || null,
          admin_email: adminEmail,
          admin_nombre: adminNombre,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al asignar herramienta:', error);
    return { success: false, error: error.message };
  }
}

// Obtener inventario de un empleado
export async function obtenerInventarioEmpleado(empleadoEmail: string) {
  try {
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .select('*')
      .eq('empleado_email', empleadoEmail)
      .order('fecha_asignacion', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener inventario del empleado:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todas las asignaciones (para admin)
export async function obtenerTodasLasAsignaciones() {
  try {
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .select('*')
      .order('fecha_asignacion', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener asignaciones:', error);
    return { success: false, error: error.message };
  }
}

// Obtener asignaciones activas de un empleado (solo asignadas)
export async function obtenerAsignacionesActivasEmpleado(empleadoEmail: string) {
  try {
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .select('*')
      .eq('empleado_email', empleadoEmail)
      .eq('estado', 'asignada')
      .order('fecha_asignacion', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error al obtener asignaciones activas:', error);
    return { success: false, error: error.message };
  }
}

// Marcar herramienta como devuelta
export async function marcarHerramientaComoDevuelta(asignacionId: string, observaciones?: string) {
  try {
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .update({
        estado: 'devuelta',
        fecha_devolucion: new Date().toISOString(),
        observaciones: observaciones || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asignacionId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al marcar como devuelta:', error);
    return { success: false, error: error.message };
  }
}

// Marcar herramienta como perdida
export async function marcarHerramientaComoPerdida(asignacionId: string, observaciones?: string) {
  try {
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .update({
        estado: 'perdida',
        observaciones: observaciones || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asignacionId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al marcar como perdida:', error);
    return { success: false, error: error.message };
  }
}

// Editar cantidad de una asignación
export async function editarCantidadAsignacion(asignacionId: string, cantidad: number) {
  try {
    const { data, error } = await supabase
      .from('inventario_asignaciones')
      .update({
        cantidad,
        updated_at: new Date().toISOString(),
      })
      .eq('id', asignacionId)
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] };
  } catch (error: any) {
    console.error('Error al editar cantidad:', error);
    return { success: false, error: error.message };
  }
}

// Eliminar asignación
export async function eliminarAsignacion(asignacionId: string) {
  try {
    const { error } = await supabase
      .from('inventario_asignaciones')
      .delete()
      .eq('id', asignacionId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar asignación:', error);
    return { success: false, error: error.message };
  }
}

// Obtener resumen de empleados con inventario
export async function obtenerResumenInventario() {
  try {
    // Obtener todas las asignaciones activas
    const { data: asignaciones, error } = await supabase
      .from('inventario_asignaciones')
      .select('empleado_email, empleado_nombre')
      .eq('estado', 'asignada')
      .order('empleado_nombre', { ascending: true });

    if (error) throw error;

    // Agrupar por empleado único
    const empleadosMap = new Map<string, { email: string; nombre: string }>();
    asignaciones?.forEach((item: any) => {
      if (!empleadosMap.has(item.empleado_email)) {
        empleadosMap.set(item.empleado_email, {
          email: item.empleado_email,
          nombre: item.empleado_nombre || 'Sin nombre',
        });
      }
    });

    // Si hay empleados con asignaciones, retornarlos
    if (empleadosMap.size > 0) {
      return { success: true, data: Array.from(empleadosMap.values()) };
    }

    // Si no hay asignaciones, obtener todos los empleados de la tabla usuarios
    const { data: empleados, error: empleadosError } = await supabase
      .from('usuarios')
      .select('email, nombre')
      .eq('rol', 'empleado')
      .order('nombre', { ascending: true });

    if (empleadosError) throw empleadosError;

    const empleadosConInventario = (empleados || []).map((emp: any) => ({
      email: emp.email,
      nombre: emp.nombre || 'Sin nombre',
    }));

    return { success: true, data: empleadosConInventario };
  } catch (error: any) {
    console.error('Error al obtener resumen de inventario:', error);
    return { success: false, error: error.message };
  }
}
