# TESTING FASE 2: lib/tareas.ts

## ⚡ Quick Start

### Step 1: Restart Backend
```bash
cd backend
# Kill previous: Ctrl+C
node server.js
```
Espera a ver logs y que el server esté escuchando.

### Step 2: Browser Refresh
Presiona: **F5** en el navegador

### Step 3: Clear Cache (Optional pero recomendado)
- Ctrl+Shift+Delete
- Clear browsing data → Cookies and other site data

---

## 🧪 Test Cases

### TEST 1: Crear Tarea
**Pre-requisito**: Estar logueado como ADMIN

**Steps**:
1. Ir al Panel Admin → Pestaña "Tareas"
2. Click en "Crear Nueva Tarea"
3. Llenar formulario:
   - Empleado: [Seleccionar cualquiera]
   - Descripción: "Test tarea #1"
   - Click "Crear"

**Expected**:
- ✅ Mensaje de éxito
- ✅ Consola muestra: `[LIB-TAREAS] Tarea creada exitosamente`
- ✅ Backend muestra: `[BACKEND-TAREAS] Tarea creada: [ID]`
- ✅ En MySQL: Nueva fila en `tareas` table

**Verify in MySQL**:
```sql
SELECT id, admin_email, empleado_email, descripcion, estado, created_at FROM tareas ORDER BY created_at DESC LIMIT 1;
```

---

### TEST 2: Ver Tareas como Empleado
**Pre-requisito**: Tarea creada en TEST 1

**Steps**:
1. Logout del admin
2. Login como EMPLEADO (cualquiera a quien le asignaste tarea)
3. Ir a sección "Mis Tareas"

**Expected**:
- ✅ Aparece la tarea creada
- ✅ Consola muestra: `[LIB-TAREAS] Tareas obtenidas: 1`
- ✅ Backend muestra: `[BACKEND-TAREAS] Tareas obtenidas: 1`

---

### TEST 3: Ver Todas las Tareas (Admin)
**Pre-requisito**: Al menos 1 tarea creada

**Steps**:
1. Login como ADMIN
2. Ir a Panel Admin → Pestaña "Tareas"
3. Debe cargar tabla con TODAS las tareas

**Expected**:
- ✅ Tabla muestra todas las tareas creadas
- ✅ Consola: `[LIB-TAREAS] Total de tareas: [N]`
- ✅ Backend: `[BACKEND-TAREAS] Total de tareas: [N]`

---

### TEST 4: Cambiar Estado de Tarea
**Pre-requisito**: Empleado con tarea asignada

**Steps**:
1. Login como EMPLEADO
2. Ir a "Mis Tareas"
3. Seleccionar una tarea
4. Cambiar estado: pendiente → en_proceso
5. Click "Guardar"

**Expected**:
- ✅ Estado actualizado en UI
- ✅ Consola: `[LIB-TAREAS] Tarea actualizada exitosamente`
- ✅ Backend: `[BACKEND-TAREAS] Tarea actualizada a estado: en_proceso`
- ✅ En MySQL: estado actualizado

**Verify in MySQL**:
```sql
SELECT id, estado FROM tareas WHERE id=[ID_TAREA];
```
Debe mostrar `estado='en_proceso'`

---

### TEST 5: Obtener Empleados (Para crear tarea)
**Pre-requisito**: Estar logueado como ADMIN

**Steps**:
1. Ir a "Crear Nueva Tarea"
2. Click en dropdown de empleados
3. Verificar que carga lista de empleados

**Expected**:
- ✅ Dropdown carga empleados
- ✅ Solo aparecen usuarios con rol='empleado'
- ✅ Consola: `[LIB-TAREAS] Empleados obtenidos: [N]`
- ✅ Backend: `[BACKEND-TAREAS] Empleados obtenidos: [N]`

**Verify in MySQL**:
```sql
SELECT COUNT(*) as total_empleados FROM usuarios WHERE rol='empleado';
```

---

### TEST 6: Obtener Tarea por ID
**Pre-requisito**: Tarea creada

**Steps**:
1. Click en una tarea específica
2. Debe cargar detalle de la tarea

**Expected**:
- ✅ Detalle carga correctamente
- ✅ Consola: `[LIB-TAREAS] Tarea obtenida: [ID]`
- ✅ Backend: `[BACKEND-TAREAS] Tarea obtenida: [ID]`
- ✅ Muestra datos completos: admin_email, empleado_email, descripcion, estado

---

## 📊 Console Logs Reference

### Frontend Console (F12 → Console)
Buscar logs que digan `[LIB-TAREAS]`:

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

### Backend Console
Buscar logs que digan `[BACKEND-TAREAS]`:

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

## 🔧 Troubleshooting

### Error: "Cannot POST /api/tareas/crear"
**Cause**: Backend no restarteado
**Fix**: 
1. Ctrl+C en terminal backend
2. `node server.js` (esperar logs)
3. F5 en browser

### Error: "Cannot GET /api/tareas/todas"
**Cause**: Endpoint no existe o endpoint name is wrong
**Fix**: Verificar [backend/routes/tareas.js](backend/routes/tareas.js) line ~150 existe `router.get('/todas'...`

### Error: "401 Unauthorized"
**Cause**: Token JWT inválido o expirado
**Fix**:
1. Logout
2. Login de nuevo
3. F5 en browser
4. Retry

### Error: "500 Internal Server Error"
**Cause**: Error en MySQL query
**Fix**:
1. Ver error completo en backend console
2. Verificar tabla `tareas` existe: `SHOW TABLES;`
3. Verificar columnas: `DESCRIBE tareas;`
4. Verificar datos: `SELECT * FROM tareas LIMIT 1;`

---

## ✅ Final Checklist

- [ ] Backend restarteado ✓
- [ ] Browser refresheado (F5) ✓
- [ ] TEST 1: Crear tarea ✓
- [ ] TEST 2: Ver tareas empleado ✓
- [ ] TEST 3: Ver todas tareas (admin) ✓
- [ ] TEST 4: Cambiar estado ✓
- [ ] TEST 5: Obtener empleados ✓
- [ ] TEST 6: Obtener tarea por ID ✓
- [ ] MySQL data verified ✓
- [ ] Logs match expected format ✓

---

## 📝 Notes

- All 6 functions use `apiCall()` to backend
- Response format: `{success: boolean, data: any, error?: string}`
- All endpoints require JWT token via `verifyToken` middleware
- Admin-only endpoints: `/tareas/todas`
- Estados válidos: 'pendiente', 'en_proceso', 'completada', 'rechazada'

---

**Ready to test?** ¡Vamos! 🚀
