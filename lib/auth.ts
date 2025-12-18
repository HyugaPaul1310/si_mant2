import { supabase } from './supabase'

interface RegistroData {
  nombre: string
  apellido?: string
  email: string
  contraseña: string
  telefono?: string
  fecha_nacimiento?: string
  ciudad?: string
  empresa?: string
  empresa_id?: string
}

// Registrar nuevo usuario
export async function registrarUsuario(datos: RegistroData) {
  try {
    const emailLowercase = datos.email.toLowerCase().trim();
    
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre: datos.nombre,
          apellido: datos.apellido || '',
          email: emailLowercase,
          'contraseña': datos.contraseña,
          telefono: datos.telefono || '',
          fecha_nacimiento: datos.fecha_nacimiento || null,
          ciudad: datos.ciudad || '',
          empresa: datos.empresa || '',
          empresa_id: datos.empresa_id || null,
          rol: 'cliente',
          estado: 'activo'
        }
      ])
      .select()

    if (error) {
      console.error('Error al registrar:', error);
      return { success: false, error: error.message || 'Error al registrar usuario' }
    }
    
    return { success: true, data: data[0] }
  } catch (error: any) {
    console.error('Exception en registrarUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Iniciar sesión y obtener usuario con su rol
export async function loginUsuario(email: string, contrasena: string) {
  try {
    // Convertir email a minúsculas para búsqueda
    const emailLowercase = email.toLowerCase().trim();
    console.log('loginUsuario - Buscando email:', emailLowercase);
    console.log('loginUsuario - Contraseña recibida:', contrasena);

    // Buscar usuario con todas las columnas
    const { data: usuarioExiste, error: errorBusqueda } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', emailLowercase)
      .single()

    console.log('loginUsuario - Data recibida:', usuarioExiste);
    console.log('loginUsuario - Error:', errorBusqueda);

    // Si hay error, significa que el email no existe
    if (errorBusqueda) {
      console.log('loginUsuario - Error de búsqueda:', errorBusqueda.message);
      return { success: false, error: 'El email no está registrado' }
    }

    // Obtener contraseña de la data (puede tener tilde o no)
    const passwordFromDB = (usuarioExiste as any)['contraseña'] || (usuarioExiste as any)['contrasena'];
    console.log('loginUsuario - Contraseña de BD:', passwordFromDB);
    
    // Si el email existe pero la contraseña es incorrecta
    if (passwordFromDB !== contrasena) {
      return { success: false, error: 'La contraseña es incorrecta' }
    }

    // Verificar si la cuenta está activa
    if ((usuarioExiste as any).estado !== 'activo') {
      return { success: false, error: 'Tu cuenta ha sido desactivada' }
    }

    // Login exitoso
    return { 
      success: true, 
      user: {
        id: (usuarioExiste as any).id,
        email: (usuarioExiste as any).email,
        nombre: (usuarioExiste as any).nombre,
        apellido: (usuarioExiste as any).apellido,
        empresa: (usuarioExiste as any).empresa,
        rol: (usuarioExiste as any).rol,
        estado: (usuarioExiste as any).estado
      }
    }
  } catch (error: any) {
    console.error('Error en loginUsuario:', error);
    return { success: false, error: 'Error al iniciar sesión' }
  }
}

// Obtener rol del usuario
export async function obtenerRolUsuario(email: string) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('email', email)
      .single()

    if (error) throw error
    return data?.rol || 'cliente'
  } catch (error) {
    return 'cliente'
  }
}

// Verificar permisos del rol
export async function verificarPermisos(rol: string) {
  try {
    const { data, error } = await supabase
      .from('permisos')
      .select('*')
      .eq('rol', rol)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}

// Obtener todos los usuarios
export async function obtenerTodosLosUsuarios() {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, rol, estado, empresa, telefono, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener usuarios:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Exception en obtenerTodosLosUsuarios:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Actualizar rol del usuario
export async function actualizarRolUsuario(userId: string, nuevoRol: 'cliente' | 'empleado' | 'admin') {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Error al actualizar rol:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data[0] }
  } catch (error: any) {
    console.error('Exception en actualizarRolUsuario:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Actualizar usuario completo
export async function actualizarUsuario(userId: string, datos: Partial<RegistroData>) {
  try {
    const updateData: any = {}
    
    if (datos.nombre) updateData.nombre = datos.nombre
    if (datos.apellido) updateData.apellido = datos.apellido
    if (datos.email) updateData.email = datos.email.toLowerCase().trim()
    if (datos.telefono) updateData.telefono = datos.telefono
    if (datos.ciudad) updateData.ciudad = datos.ciudad
    if (datos.empresa) updateData.empresa = datos.empresa

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Error al actualizar usuario:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data[0] }
  } catch (error: any) {
    console.error('Exception en actualizarUsuario:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Eliminar usuario (cambiar estado a inactivo)
export async function eliminarUsuario(userId: string) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ estado: 'inactivo' })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('Error al eliminar usuario:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data[0] }
  } catch (error: any) {
    console.error('Exception en eliminarUsuario:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Eliminar usuario permanentemente (solo admin)
export async function eliminarUsuarioPermanente(userId: string) {
  try {
    // Primero eliminar de auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error('Error al eliminar usuario de auth:', authError)
      return { success: false, error: authError.message }
    }

    // Luego eliminar de la tabla usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('Error al eliminar usuario de la base de datos:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Exception en eliminarUsuarioPermanente:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
