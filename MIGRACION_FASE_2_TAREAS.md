# Fase 2: Migración lib/tareas.ts ✅ COMPLETADA

## Estado General
**Status**: ✅ CÓDIGO MIGRADO - LISTO PARA TESTING
**Fecha**: [Sesión Actual]
**Funciones**: 6/6 migradas (100%)

---

## Funciones Migradas

### 1. ✅ `crearTarea()` - POST /tareas/crear
**Línea**: [lib/tareas.ts#L9-L38](lib/tareas.ts#L9-L38)

**Frontend (antes)**:
```typescript
const { data, error } = await supabase.from('tareas').insert([{...}]).select();
```

**Frontend (ahora)**:
```typescript
const result = await apiCall('/tareas/crear', {
  method: 'POST',
  body: JSON.stringify({admin_email, admin_nombre, empleado_email, descripcion})
});
```

**Backend Endpoint**: POST /api/tareas/crear
**Parámetros**: admin_email, admin_nombre, empleado_email, descripcion
**Respuesta**: {success: true, data: {id, ...tarea}}

---

### 2. ✅ `obtenerTareasEmpleado()` - GET /tareas/empleado-email/:email
**Línea**: [lib/tareas.ts#L40-L58](lib/tareas.ts#L40-L58)

**Frontend (antes)**:
```typescript
const { data, error } = await supabase.from('tareas').select('*').eq('empleado_email', empleadoEmail);
```

**Frontend (ahora)**:
```typescript
const result = await apiCall(`/tareas/empleado-email/${empleadoEmail}`, {method: 'GET'});
```

**Backend Endpoint**: GET /api/tareas/empleado-email/:email
**Parámetros**: email (ruta)
**Respuesta**: {success: true, data: [{id, ...}]}

---

### 3. ✅ `obtenerTodasLasTareas()` - GET /tareas/todas
**Línea**: [lib/tareas.ts#L60-L78](lib/tareas.ts#L60-L78)

**Frontend (antes)**:
```typescript
const { data, error } = await supabase.from('tareas').select('*').order('created_at');
```

**Frontend (ahora)**:
```typescript
const result = await apiCall('/tareas/todas', {method: 'GET'});
```

**Backend Endpoint**: GET /api/tareas/todas
**Restricción**: Solo admin
**Respuesta**: {success: true, data: [{id, ...}]}

---

### 4. ✅ `obtenerEmpleados()` - GET /tareas/empleados/lista
**Línea**: [lib/tareas.ts#L80-L98](lib/tareas.ts#L80-L98)

**Frontend (antes)**:
```typescript
const { data, error } = await supabase.from('usuarios').select(...).eq('rol', 'empleado');
```

**Frontend (ahora)**:
```typescript
const result = await apiCall('/tareas/empleados/lista', {method: 'GET'});
```

**Backend Endpoint**: GET /api/tareas/empleados/lista
**Respuesta**: {success: true, data: [{id, email, nombre, apellido, rol}]}

---

### 5. ✅ `actualizarEstadoTarea()` - PUT /tareas/:id/estado
**Línea**: [lib/tareas.ts#L100-L119](lib/tareas.ts#L100-L119)

**Frontend (antes)**:
```typescript
const { data, error } = await supabase.from('tareas').update({estado, updated_at}).eq('id', id);
```

**Frontend (ahora)**:
```typescript
const result = await apiCall(`/tareas/${id}/estado`, {
  method: 'PUT',
  body: JSON.stringify({estado})
});
```

**Backend Endpoint**: PUT /api/tareas/:id/estado
**Parámetros**: id (ruta), estado (body: 'pendiente'|'en_proceso'|'completada'|'rechazada')
**Respuesta**: {success: true, data: {...tarea actualizada}}

---

### 6. ✅ `obtenerTareaPorId()` - GET /tareas/:id
**Línea**: [lib/tareas.ts#L121-L140](lib/tareas.ts#L121-L140)

**Frontend (antes)**:
```typescript
const { data, error } = await supabase.from('tareas').select('*').eq('id', id).single();
```

**Frontend (ahora)**:
```typescript
const result = await apiCall(`/tareas/${id}`, {method: 'GET'});
```

**Backend Endpoint**: GET /api/tareas/:id
**Parámetros**: id (ruta)
**Respuesta**: {success: true, data: {...tarea}}

---

## Backend Endpoints Agregados
**Archivo**: [backend/routes/tareas.js](backend/routes/tareas.js)

✅ POST /tareas/crear - Crear tarea
✅ GET /tareas/empleado-email/:email - Tareas de empleado
✅ GET /tareas/todas - Todas las tareas (admin)
✅ GET /tareas/empleados/lista - Lista de empleados
✅ PUT /tareas/:id/estado - Actualizar estado
✅ GET /tareas/:id - Obtener tarea por ID

---

## Testing Requerido

### Antes de Empezar
1. **Reiniciar backend**:
   ```bash
   cd backend
   node server.js
   ```
   Debe ver: `[BACKEND-TAREAS]` en logs

2. **Refresh del navegador**: F5
3. **Limpiar caché**: Ctrl+Shift+Delete

### Test #1: Crear Tarea
**Como**: Admin
**Pasos**:
1. Ir a panel admin
2. Crear nueva tarea para empleado
3. Verificar mensaje de éxito
4. Verificar en MySQL:
   ```sql
   SELECT * FROM tareas WHERE estado='pendiente' ORDER BY created_at DESC LIMIT 1;
   ```

### Test #2: Obtener Tareas del Empleado
**Como**: Empleado
**Pasos**:
1. Ingresar como empleado
2. Ver sección de "Mis Tareas"
3. Debe aparecer tarea creada
4. Verificar logs: `[LIB-TAREAS] Tareas obtenidas:`

### Test #3: Obtener Todas las Tareas (Admin)
**Como**: Admin
**Pasos**:
1. Ir a panel admin
2. Ver pestaña "Tareas"
3. Debe mostrar TODAS las tareas de todos empleados
4. Verificar logs: `[LIB-TAREAS] Total de tareas:`

### Test #4: Obtener Empleados
**Como**: Admin
**Pasos**:
1. Ir a crear tarea
2. Dropdown de empleados debe cargar
3. Debe mostrar solo usuarios con rol='empleado'
4. Verificar logs: `[LIB-TAREAS] Empleados obtenidos:`

### Test #5: Actualizar Estado de Tarea
**Como**: Empleado
**Pasos**:
1. Ingresar como empleado
2. Cambiar estado de tarea (pendiente → en_proceso)
3. Debe actualizarse en tiempo real
4. Verificar en MySQL:
   ```sql
   SELECT id, estado FROM tareas WHERE estado='en_proceso' LIMIT 1;
   ```

### Test #6: Obtener Tarea por ID
**Como**: Cualquiera
**Pasos**:
1. Ir a detalle de tarea
2. Debe cargar datos completos
3. Verificar logs: `[LIB-TAREAS] Tarea obtenida:`

---

## Logs Esperados en Consola Frontend

```
[LIB-TAREAS] Creando tarea para: empleado@email.com
[LIB-TAREAS] Tarea creada exitosamente

[LIB-TAREAS] Obteniendo tareas del empleado: empleado@email.com
[LIB-TAREAS] Tareas obtenidas: 3

[LIB-TAREAS] Obteniendo TODAS las tareas (admin)
[LIB-TAREAS] Total de tareas: 15

[LIB-TAREAS] Obteniendo lista de empleados
[LIB-TAREAS] Empleados obtenidos: 5

[LIB-TAREAS] Actualizando tarea 123 a estado: en_proceso
[LIB-TAREAS] Tarea actualizada exitosamente

[LIB-TAREAS] Obteniendo tarea: 123
[LIB-TAREAS] Tarea obtenida: 123
```

---

## Logs Esperados en Backend

```
[BACKEND-TAREAS] Creando tarea para empleado: empleado@email.com
[BACKEND-TAREAS] Tarea creada: 123
[BACKEND-TAREAS] Obteniendo tareas del empleado: empleado@email.com
[BACKEND-TAREAS] Tareas obtenidas: 3
[BACKEND-TAREAS] Obteniendo TODAS las tareas (admin)
[BACKEND-TAREAS] Total de tareas: 15
[BACKEND-TAREAS] Obteniendo lista de empleados
[BACKEND-TAREAS] Empleados obtenidos: 5
[BACKEND-TAREAS] Actualizando tarea 123 a estado: en_proceso
[BACKEND-TAREAS] Tarea actualizada a estado: en_proceso
[BACKEND-TAREAS] Obteniendo tarea: 123
[BACKEND-TAREAS] Tarea obtenida: 123
```

---

## Checklist de Finalización

- [x] 6/6 funciones migradas en lib/tareas.ts
- [x] 6 nuevos endpoints en backend/routes/tareas.js
- [x] Imports cambiados de supabase a apiCall
- [x] Logging agregado en todas funciones
- [ ] Reiniciado backend
- [ ] Browser refresheado
- [ ] Test #1 completado ✓
- [ ] Test #2 completado ✓
- [ ] Test #3 completado ✓
- [ ] Test #4 completado ✓
- [ ] Test #5 completado ✓
- [ ] Test #6 completado ✓

---

## Notas

- Todos los 6 endpoints incluyen logging `[BACKEND-TAREAS]` para debugging
- Estados válidos: 'pendiente', 'en_proceso', 'completada', 'rechazada'
- El endpoint `/tareas/todas` verifica que sea admin
- Los parámetros coinciden exactamente con lo que espera MySQL
- Response format es consistente: {success: boolean, data/error: any}

---

## Siguiente Fase

**Fase 3**: lib/inventario.ts (6 funciones)
- Crear backend/routes/inventario.js (si no existe)
- Migrar 6 funciones de inventario
- Testing similar
