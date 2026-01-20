# GUÍA DE INTEGRACIÓN FRONTEND CON BACKEND EXPRESS

## ✅ COMPLETADO

- ✅ Backend Express creado y corriendo en `http://localhost:3001`
- ✅ MySQL con todas las tablas creadas
- ✅ Usuario de prueba: `admin@test.com` / `admin123`
- ✅ `lib/api.ts` creado con funciones para llamar la API

---

## 📝 PASO A PASO PARA INTEGRAR

### PASO 1: Actualizar `lib/auth.ts`

Reemplazar TODO el contenido de `lib/auth.ts` con esto:

```typescript
import { apiPost, apiGet, setToken, setUser, getToken, logout as apiLogout } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const result = await apiPost('/auth/register', datos);
    
    if (result.success) {
      // El usuario puede iniciar sesión ahora
      return { success: true, message: 'Usuario registrado exitosamente' };
    }
    
    return { success: false, error: result.error };
  } catch (error: any) {
    console.error('Exception en registrarUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Iniciar sesión
export async function loginUsuario(email: string, contraseña: string) {
  try {
    const result = await apiPost('/auth/login', { email, contraseña });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Guardar token
    if (result.token) {
      await setToken(result.token);
    }

    // Guardar usuario
    if (result.user) {
      await setUser(result.user);
    }

    return {
      success: true,
      user: result.user,
      token: result.token
    };
  } catch (error: any) {
    console.error('Exception en loginUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Obtener rol del usuario actual
export async function obtenerRolUsuario() {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'No hay sesión activa' };
    }

    const result = await apiGet('/auth/me');

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, rol: result.user.rol, user: result.user };
  } catch (error: any) {
    console.error('Exception en obtenerRolUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Verificar permisos (simplificado)
export async function verificarPermisos(rol: string, accion: string) {
  // Por ahora solo verificamos el rol
  const rolesConAcceso: { [key: string]: string[] } = {
    'admin': ['crear_usuarios', 'editar_usuarios', 'crear_reportes', 'editar_reportes'],
    'empleado': ['crear_reportes', 'ver_tareas'],
    'cliente': ['ver_reportes', 'crear_encuestas']
  };

  return rolesConAcceso[rol]?.includes(accion) ?? false;
}

// Obtener todos los usuarios (solo admin)
export async function obtenerTodosLosUsuarios() {
  try {
    const result = await apiGet('/usuarios');

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Exception en obtenerTodosLosUsuarios:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Actualizar usuario
export async function actualizarUsuario(userId: string, datos: Partial<RegistroData>) {
  try {
    const result = await apiPut(`/usuarios/${userId}`, datos);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Exception en actualizarUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Cambiar rol de usuario (solo admin)
export async function cambiarRolUsuario(userId: string, nuevoRol: string) {
  try {
    const result = await apiPut(`/usuarios/${userId}/role`, { rol: nuevoRol });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception en cambiarRolUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Cambiar estado de usuario (solo admin)
export async function cambiarEstadoUsuario(userId: string, estado: string) {
  try {
    const result = await apiPut(`/usuarios/${userId}/status`, { estado });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception en cambiarEstadoUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Eliminar usuario (marcar como inactivo)
export async function eliminarUsuario(userId: string) {
  try {
    const result = await apiDelete(`/usuarios/${userId}`);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception en eliminarUsuario:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

// Logout
export async function logout() {
  try {
    await apiLogout();
    return { success: true };
  } catch (error: any) {
    console.error('Exception en logout:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}
```

**IMPORTANTE:** Añadir al inicio de `lib/auth.ts`:
```typescript
import { apiPut, apiDelete } from './api';
```

---

### PASO 2: Actualizar `lib/reportes.ts`

Reemplazar el contenido con:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from './api';

export async function obtenerReportes() {
  const result = await apiGet('/reportes');
  return result.success ? { success: true, data: result.data } : result;
}

export async function crearReporte(datos: any) {
  const result = await apiPost('/reportes', datos);
  return result.success ? { success: true, reporteId: result.reporteId } : result;
}

export async function actualizarReporte(reporteId: string, datos: any) {
  const result = await apiPut(`/reportes/${reporteId}`, datos);
  return result.success ? { success: true } : result;
}

export async function eliminarReporte(reporteId: string) {
  const result = await apiDelete(`/reportes/${reporteId}`);
  return result.success ? { success: true } : result;
}
```

---

### PASO 3: Actualizar `lib/tareas.ts`

Reemplazar con:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from './api';

export async function obtenerTareas() {
  const result = await apiGet('/tareas');
  return result.success ? { success: true, data: result.data } : result;
}

export async function obtenerTareasEmpleado(empleadoId: string) {
  const result = await apiGet(`/tareas/empleado/${empleadoId}`);
  return result.success ? { success: true, data: result.data } : result;
}

export async function crearTarea(datos: any) {
  const result = await apiPost('/tareas', datos);
  return result.success ? { success: true, tareaId: result.tareaId } : result;
}

export async function actualizarEstadoTarea(tareaId: string, estado: string) {
  const result = await apiPut(`/tareas/${tareaId}/status`, { estado });
  return result.success ? { success: true } : result;
}

export async function eliminarTarea(tareaId: string) {
  const result = await apiDelete(`/tareas/${tareaId}`);
  return result.success ? { success: true } : result;
}
```

---

### PASO 4: Actualizar `lib/inventario.ts` (si existe)

Si el archivo existe, reemplazar con:

```typescript
import { apiGet, apiPost, apiDelete } from './api';

export async function obtenerHerramientas() {
  const result = await apiGet('/inventario/herramientas');
  return result.success ? { success: true, data: result.data } : result;
}

export async function crearHerramienta(datos: any) {
  const result = await apiPost('/inventario/herramientas', datos);
  return result.success ? { success: true, herramientaId: result.herramientaId } : result;
}

export async function obtenerAsignaciones() {
  const result = await apiGet('/inventario/asignaciones');
  return result.success ? { success: true, data: result.data } : result;
}

export async function asignarHerramientaAEmpleado(usuarioId: string, herramientaNombre: string) {
  const result = await apiPost('/inventario/asignar', {
    usuario_id: usuarioId,
    herramienta_nombre: herramientaNombre
  });
  return result.success ? { success: true, asignacionId: result.asignacionId } : result;
}

export async function desasignarHerramienta(asignacionId: string) {
  const result = await apiDelete(`/inventario/asignaciones/${asignacionId}`);
  return result.success ? { success: true } : result;
}
```

---

## 🧪 PROBAR EL SISTEMA

### 1. Verificar que el backend está corriendo
```bash
# En otra terminal
cd backend
node server.js
# Deberías ver: "Servidor Express corriendo en puerto 3001"
```

### 2. Probar login desde la app
- Email: `admin@test.com`
- Contraseña: `admin123`

### 3. Si todo funciona
- [ ] Deberías ver la pantalla de admin
- [ ] No debería haber errores en la consola
- [ ] Los datos deberían venir de la API, no de Supabase

### 4. Verificar en la consola
Abre la consola del navegador (F12) y verás logs como:
```
[API] POST /auth/login
[API] GET /api/usuarios
```

---

## ❌ SOLUCIONAR PROBLEMAS

**Error: "Cannot connect to localhost:3001"**
- Verificar que el backend está corriendo: `npm run dev` en carpeta `backend/`

**Error: "Unauthorized"**
- El token expiró o no se guardó
- Limpiar AsyncStorage: `await AsyncStorage.clear()`
- Volver a iniciar sesión

**Error: "CORS"**
- El backend ya tiene CORS habilitado
- Si aún hay problemas, verificar `server.js` línea con `cors()`

---

## 📋 CHECKLIST FINAL

- [ ] `lib/api.ts` creado
- [ ] `lib/auth.ts` actualizado
- [ ] `lib/reportes.ts` actualizado
- [ ] `lib/tareas.ts` actualizado
- [ ] `lib/inventario.ts` actualizado (si existe)
- [ ] Backend corriendo en puerto 3001
- [ ] Login funciona con admin@test.com
- [ ] Datos vienen del backend, no Supabase
- [ ] No hay errores en consola
- [ ] Preparado para migrar a VPS

---

## 🚀 SIGUIENTE: MIGRACIÓN A VPS

Cuando todo funcione:

1. Cambiar `API_BASE` en `lib/api.ts` a tu dominio VPS
2. Executar `npm run migrate` para traer datos de Supabase
3. Subir carpeta `backend/` al VPS
4. Configurar con PM2 o similar para que corra siempre
5. Configurar HTTPS con Let's Encrypt
