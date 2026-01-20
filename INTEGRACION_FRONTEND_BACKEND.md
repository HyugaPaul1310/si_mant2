# Integración del Frontend Expo con Backend Express

## 1. Crear nuevo archivo de configuración para API

Crear archivo `lib/api.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3001/api'; // Cambiar cuando esté en VPS

interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
  token?: string;
}

export async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error en la solicitud'
    };
  }
}
```

## 2. Reemplazar la autenticación

En `lib/auth.ts`, reemplazar las funciones para usar el backend:

```typescript
import { apiCall } from './api';

export async function registrarUsuario(datos: RegistroData) {
  return apiCall('/auth/register', 'POST', datos);
}

export async function loginUsuario(email: string, contraseña: string) {
  const result = await apiCall('/auth/login', 'POST', { email, contraseña });
  
  if (result.success && result.token) {
    // Guardar token
    await AsyncStorage.setItem('token', result.token);
    // Guardar usuario
    await AsyncStorage.setItem('user', JSON.stringify(result.user));
  }
  
  return result;
}

export async function obtenerRolUsuario(userId: string) {
  return apiCall(`/auth/me`, 'GET');
}
```

## 3. Cambiar endpoints de datos

En `lib/reportes.ts`:
```typescript
import { apiCall } from './api';

export async function obtenerReportes() {
  return apiCall('/reportes', 'GET');
}

export async function crearReporte(datos: any) {
  return apiCall('/reportes', 'POST', datos);
}
```

Similar para `lib/tareas.ts` e `lib/inventario.ts`.

## 4. Actualizar app/index.tsx

```typescript
// En el login
const resultado = await loginUsuario(email, password);

if (!resultado?.success || !resultado.user) {
  setErrorMessage(resultado?.error || 'Error al iniciar sesión');
  return;
}

// El token ya se guardó automáticamente en loginUsuario()
// El usuario se guardó automáticamente en loginUsuario()

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

## 5. Configurar URL según el entorno

Crear `lib/config.ts`:

```typescript
const ENV = {
  dev: {
    apiUrl: 'http://localhost:3001/api'
  },
  prod: {
    apiUrl: 'https://tu-vps.com/api' // Cambiar cuando tengas VPS
  }
};

const getEnvVars = () => {
  return ENV.dev; // Cambiar a prod en producción
};

export const { apiUrl } = getEnvVars();
```

## 6. Probar el sistema

**Login de prueba:**
- Email: `admin@test.com`
- Contraseña: `admin123`

**Probar endpoints:**
```bash
# Obtener token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","contraseña":"admin123"}'

# Usar token para llamadas protegidas
curl -X GET http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer <tu_token>"
```

---

## PRÓXIMOS PASOS

1. ✓ Crear estructura backend
2. ✓ Configurar Express + MySQL
3. ✓ Crear tablas en MySQL
4. ✓ Iniciar servidor Express
5. **⬜ Crear lib/api.ts**
6. **⬜ Actualizar lib/auth.ts para usar API**
7. **⬜ Actualizar lib/reportes.ts, tareas.ts, inventario.ts**
8. **⬜ Probar login con backend**
9. **⬜ Probar endpoints protegidos**
10. **⬜ Subir a VPS cuando funcione todo**

---

## IMPORTANTE

**Para desarrollo local:**
- Backend corre en `http://localhost:3001`
- Frontend (Expo) corre en `http://localhost:8081` (o similar)
- CORS ya está habilitado en el servidor Express

**Cuando sea VPS:**
- Cambiar `API_URL` en `lib/api.ts` a `https://tu-vps.com/api`
- También cambiar en `lib/config.ts`
- Usar HTTPS en producción

---

## Resumen de lo que hicimos

**Backend Express creado con:**
- ✅ Autenticación con JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Middleware de autorización
- ✅ Rutas para usuarios, reportes, tareas, inventario
- ✅ Base de datos MySQL con 8 tablas
- ✅ Usuario admin de prueba (admin@test.com / admin123)
- ✅ Servidor corriendo en puerto 3001

**Próximo paso:** Actualizar el frontend para usar este nuevo backend.
