# 🚀 QUICK TEST - Tareas Arregladas

## ⚡ Pasos Rápidos (2 minutos)

### 1. Reiniciar Backend
En terminal backend:
```
Ctrl+C  (si está corriendo)
node server.js
```

Debe ver logs y el servidor escuchando en puerto 3001.

---

### 2. Refresh Browser
Presiona: **F5** (o Ctrl+Shift+Delete para cache completo)

---

### 3. Testear Cargar Tareas

**Como empleado**:
1. Ingresar en la app
2. Ir a "Mis Tareas"
3. Verificar que carga lista de tareas
4. Verificar que ahora SÍ muestra "Asignada por: [NOMBRE]"

✅ Si ve el nombre del admin, Fix #1,#2,#3 funcionó

---

### 4. Testear Actualizar Estado

**Como empleado**:
1. Click en una tarea
2. Modal abre y muestra:
   - ✅ Descripción
   - ✅ Asignada por: [NOMBRE] ← Este estaba vacío antes
   - ✅ Fecha
   - ✅ Estado: Pendiente
3. Click "✓ Marcar Completada"
4. Esperar 2-3 segundos
5. Modal debe cerrarse automáticamente
6. Tarea desaparece de "Mis Tareas (pendientes)"
7. Tarea aparece en "Mis Tareas Completadas"

✅ Si todo esto funciona, Fix #4 funcionó

---

### 5. Verificar en MySQL

```sql
-- Ver tareas completadas
SELECT id, admin_nombre, empleado_email, estado FROM tareas WHERE estado='completada';

-- Ver tareas pendientes
SELECT id, admin_nombre, empleado_email, estado FROM tareas WHERE estado='pendiente';
```

Deben aparecer los datos actualizados en tiempo real.

---

## 🔍 Console Logs Esperados

### Frontend (F12 → Console)
```
[LIB-TAREAS] Obteniendo tareas del empleado: juan@email.com
[LIB-TAREAS] Tareas obtenidas: 3
[LIB-TAREAS] Actualizando tarea 123 a estado: completada
[LIB-TAREAS] Tarea actualizada exitosamente
```

### Backend (Terminal)
```
[BACKEND-TAREAS] Obteniendo tareas del empleado: juan@email.com
[BACKEND-TAREAS] Tareas obtenidas: 3
[BACKEND-TAREAS] Actualizando tarea 123 a estado: completada
[BACKEND-TAREAS] Tarea actualizada a estado: completada
```

---

## ✅ Checklist Rápido

- [ ] Backend restarteado
- [ ] Browser refresheado
- [ ] Tareas cargan en lista
- [ ] Modal muestra "Asignada por" ← ESTO ERA EL BUG
- [ ] Click "Marcar Completada" actualiza
- [ ] Modal cierra automáticamente
- [ ] Tarea aparece en historial
- [ ] MySQL tiene datos correctos

---

## ❌ Si Algo Sigue Fallando

**Problema**: Sigue diciendo "No autorizado"
**Solución**: Logout → Login nuevamente

**Problema**: Las tareas no cargan
**Solución**: 
1. Ver console.error en browser (F12)
2. Ver error en backend terminal
3. Verificar que email es correcto en localStorage

**Problema**: Modal muestra vacío
**Solución**: 
1. Backend no devuelve datos
2. Ver logs en backend terminal
3. Verificar MySQL: `SELECT * FROM tareas LIMIT 1;`

---

## 📊 Fixes Aplicados

1. ✅ Endpoint `/status` → `/estado`
2. ✅ Ruta `/empleado/{id}` → `/empleado-email/{email}`
3. ✅ Parámetro `usuario.id` → `usuario.email` en cargarTareas
4. ✅ Parámetro `usuario.id` → `usuario.email` en cargarTareasTerminadas

---

**¿Todo funciona? ¡Excelente!** 🎉

Si sigue sin funcionar, checa [FIXES_FASE_2_TAREAS.md](FIXES_FASE_2_TAREAS.md) para más detalles.
