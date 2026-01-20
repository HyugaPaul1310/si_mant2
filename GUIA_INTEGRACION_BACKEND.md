# GUÍA: Integrar Backend Express en Frontend Expo

## Estado Actual

✅ **Backend Express creado y corriendo** en `http://localhost:3001`
✅ **Base de datos MySQL** con todas las tablas
✅ **Usuario de prueba** listo: `admin@test.com` / `admin123`
✅ **Archivo api-backend.ts** creado con todas las funciones

---

## Paso 1: Usar el nuevo archivo de API

Desde ahora, en lugar de usar `lib/supabase.ts`, vas a usar `lib/api-backend.ts`.

**Ejemplo en app/index.tsx:**

```typescript
// VIEJO (Supabase)
import { loginUsuario } from '@/lib/auth';

// NUEVO (Backend Express)
import { loginBackend } from '@/lib/api-backend';

// En el handler del botón login:
const resultado = await loginBackend(email, password);

if (!resultado?.success || !resultado.user) {
  setErrorMessage(resultado?.error || 'Error al iniciar sesión');
  return;
}

// El token y usuario ya se guardaron automáticamente
switch (resultado.user.rol) {
  case 'admin':
    router.replace('/admin');
    break;
  case 'empleado':
    router.replace('/empleado-panel');
    break;
  default:
    router.replace('/cliente-panel');
}
```

---

## Paso 2: Reemplazar funciones en cada pantalla

### Para reportes (app/admin.tsx):

```typescript
// VIEJO
import { obtenerReportes } from '@/lib/reportes';

// NUEVO
import { obtenerReportesBackend } from '@/lib/api-backend';

// En useEffect:
const { data } = await obtenerReportesBackend();
```

### Para tareas:

```typescript
// VIEJO
import { obtenerTareas } from '@/lib/tareas';

// NUEVO
import { obtenerTareasBackend } from '@/lib/api-backend';

// En useEffect:
const { data } = await obtenerTareasBackend();
```

### Para inventario:

```typescript
// VIEJO
import { obtenerHerramientas, asignarHerramientaAEmpleado } from '@/lib/inventario';

// NUEVO
import { obtenerHerramientasBackend, asignarHerramientaBackend } from '@/lib/api-backend';

// En el código:
const { data: herramientas } = await obtenerHerramientasBackend();
await asignarHerramientaBackend(empleadoId, nombreHerramienta);
```

---

## Paso 3: Logout

```typescript
// VIEJO
await AsyncStorage.removeItem('user');

// NUEVO
import { logoutBackend } from '@/lib/api-backend';

await logoutBackend();
```

---

## Referencia Completa de Funciones

### Autenticación
- `loginBackend(email, contraseña)` - Login
- `registerBackend(datos)` - Registro
- `getCurrentUser()` - Obtener usuario actual
- `logoutBackend()` - Cerrar sesión

### Reportes
- `obtenerReportesBackend()` - Listar todos
- `crearReporteBackend(datos)` - Crear
- `actualizarReporteBackend(id, datos)` - Actualizar
- `eliminarReporteBackend(id)` - Eliminar

### Tareas
- `obtenerTareasBackend()` - Mis tareas
- `obtenerTareasEmpleadoBackend(id)` - Tareas de empleado
- `crearTareaBackend(datos)` - Crear
- `actualizarEstadoTareaBackend(id, estado)` - Cambiar estado
- `eliminarTareaBackend(id)` - Eliminar

### Inventario
- `obtenerHerramientasBackend()` - Listar herramientas
- `crearHerramientaBackend(datos)` - Crear herramienta
- `obtenerAsignacionesBackend()` - Listar asignaciones
- `asignarHerramientaBackend(usuario_id, nombre)` - Asignar
- `desasignarHerramientaBackend(id)` - Desasignar

### Usuarios
- `obtenerUsuariosBackend()` - Listar (solo admin)
- `obtenerUsuarioBackend(id)` - Obtener uno
- `actualizarUsuarioBackend(id, datos)` - Actualizar
- `cambiarRolUsuarioBackend(id, rol)` - Cambiar rol
- `cambiarEstadoUsuarioBackend(id, estado)` - Cambiar estado
- `eliminarUsuarioBackend(id)` - Eliminar

---

## Testing

**Probar login:**
```typescript
import { loginBackend } from '@/lib/api-backend';

const result = await loginBackend('admin@test.com', 'admin123');
console.log(result);
// Debe retornar { success: true, token: "...", user: {...} }
```

**Probar endpoint protegido:**
```typescript
import { obtenerUsuariosBackend } from '@/lib/api-backend';

const result = await obtenerUsuariosBackend();
console.log(result);
// Debe retornar lista de usuarios (si eres admin)
```

---

## Importante

**El servidor Express debe estar corriendo:**
```bash
cd backend
node server.js
```

O en desarrollo con nodemon:
```bash
npm run dev
```

---

## Próximos pasos

1. ✓ Backend creado
2. ✓ Archivo api-backend.ts creado
3. **⬜ Actualizar app/index.tsx para login**
4. **⬜ Actualizar pantallas para usar nuevas funciones**
5. **⬜ Probar todo que funcione**
6. **⬜ Cuando todo funcione, subir a VPS**

---

## Cuando estés en VPS

Cambiar en `lib/api-backend.ts`:

```typescript
// De esto:
const API_URL = 'http://localhost:3001/api';

// A esto:
const API_URL = 'https://tu-vps.com/api';
```

Y actualizar en backend también:
```bash
# En tu VPS
npm run start
```

¡Listo! El sistema funcionará sin necesidad de Supabase.
