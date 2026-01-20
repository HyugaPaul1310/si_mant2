# 📋 PLAN DE MIGRACIÓN SUPABASE → BACKEND (Paso a Paso)

## 📊 PROGRESO GENERAL
- [ ] lib/reportes.ts (14 funciones)
- [ ] lib/tareas.ts (7 funciones)
- [ ] lib/inventario.ts (6 funciones)
- [ ] lib/auth.ts (4 funciones)

---

## 🔴 FASE 1: lib/reportes.ts (CRÍTICO - Reportes)

### 1️⃣ obtenerReportesPorUsuario()
**Estado:** ✅ COMPLETADO  
**Ubicación:** lib/reportes.ts línea 88  
**Función:** Obtiene todos los reportes de un usuario por su email  
**Backend endpoint:** GET /api/reportes/por-usuario/:email  
**Status:** DONE
```
[x] Crear endpoint en backend/routes/reportes.js
[x] Cambiar import a apiCall() en lib/reportes.ts
[x] Testear que devuelve los mismos datos
[ ] Verificar que funciona en app (PRÓXIMO: test manual)
```

### 2️⃣ obtenerTodosLosReportes()
**Estado:** ✅ COMPLETADO  
**Ubicación:** lib/reportes.ts línea 104  
**Función:** Obtiene TODOS los reportes (admin)  
**Backend endpoint:** GET /api/reportes/todos/admin/list  
**Status:** DONE
```
[x] Crear endpoint en backend/routes/reportes.js
[x] Cambiar import a apiCall() en lib/reportes.ts
[x] Testear en admin panel
[ ] Verificar que funciona (PRÓXIMO: test manual)
```

### 3️⃣ actualizarEstadoReporte()
**Estado:** ✅ COMPLETADO  
**Ubicación:** lib/reportes.ts línea 110  
**Función:** Cambia el estado de un reporte (pendiente, en_proceso, etc)  
**Backend endpoint:** PUT /api/reportes/:id/estado  
**Status:** DONE
```
[x] Crear/actualizar endpoint en backend
[x] Cambiar import a apiCall() en lib/reportes.ts
[x] Testear cambio de estado
[ ] Verificar logs en backend (PRÓXIMO: test manual)
```

### 4️⃣ asignarReporteAEmpleado()
**Estado:** ✅ COMPLETADO  
**Ubicación:** lib/reportes.ts línea 130  
**Función:** Asigna un reporte a un empleado  
**Backend endpoint:** PUT /api/reportes/:id/asignar  
**Status:** DONE
```
[x] Crear endpoint en backend
[x] Cambiar import a apiCall()
[x] Testear asignación
[ ] Verificar en app de empleado (PRÓXIMO: test manual)
```

### 5️⃣ obtenerReportesAsignados()
**Estado:** ✅ COMPLETADO  
**Ubicación:** lib/reportes.ts línea 147  
**Función:** Obtiene reportes asignados a un empleado  
**Backend endpoint:** GET /api/reportes/asignados/:email  
**Status:** DONE
```
[x] Crear endpoint en backend
[x] Cambiar import a apiCall()
[x] Testear que devuelve correctamente
[ ] Verificar en app de empleado (PRÓXIMO: test manual)
```

### 6️⃣ obtenerArchivosPorReporte()
**Estado:** ❌ SUPABASE  
**Ubicación:** lib/reportes.ts línea 246  
**Función:** Obtiene archivos (fotos/videos) de un reporte  
**Backend endpoint necesario:** GET /api/reportes/:id/archivos  
**Status:** NOT_STARTED
```
[ ] Crear endpoint en backend
[ ] Cambiar import a apiCall()
[ ] Testear galería de reportes
[ ] Verificar URLs de Cloudflare
```

### 7️⃣ guardarCotizacion()
**Estado:** ✅ COMPLETADO  
**Ubicación:** lib/reportes.ts línea 561  
**Función:** Guarda una cotización para un reporte  
**Backend endpoint:** POST /api/reportes/:id/cotizacion  
**Status:** DONE
```
[x] Crear endpoint en backend
[x] Cambiar import a apiCall()
[x] Testear guardado de cotización
[ ] Verificar que aparece en admin (PRÓXIMO: test manual)
```

### 8️⃣ obtenerCotizacionesCliente()
**Estado:** ✅ COMPLETADO  
**Ubicación:** lib/reportes.ts línea 597  
**Función:** Obtiene cotizaciones para un cliente  
**Backend endpoint:** GET /api/reportes/cotizaciones/cliente/:email  
**Status:** DONE
```
[x] Crear endpoint en backend
[x] Cambiar import a apiCall()
[x] Testear en panel del cliente
[ ] Verificar que ve sus cotizaciones (PRÓXIMO: test manual)
```

---

## 🟡 FASE 2: lib/tareas.ts (Tareas)

### 9️⃣ obtenerTareasPorUsuario()
**Estado:** ❌ SUPABASE  
**Función:** Obtiene tareas de un usuario  
**Backend endpoint necesario:** GET /api/tareas/usuario/:email  
**Status:** NOT_STARTED

### 🔟 crearTarea()
**Estado:** ❌ SUPABASE  
**Función:** Crea una nueva tarea  
**Backend endpoint necesario:** POST /api/tareas  
**Status:** NOT_STARTED

---

## 🟢 FASE 3: lib/inventario.ts (Inventario)

### 1️⃣1️⃣ obtenerHerramientas()
**Estado:** ❌ SUPABASE  
**Función:** Obtiene todas las herramientas  
**Backend endpoint necesario:** GET /api/inventario/herramientas  
**Status:** NOT_STARTED

---

## 🔵 FASE 4: lib/auth.ts (Autenticación)

### 1️⃣2️⃣ login()
**Estado:** ❌ SUPABASE  
**Nota:** Probablemente ya migrada, verificar  
**Status:** PENDING_REVIEW

---

## 📝 INSTRUCCIONES PARA MIGRAR CADA FUNCIÓN

Para cada función:

1. **Crear endpoint en backend**
   ```bash
   # Editar: backend/routes/reportes.js (o tareas.js, inventario.js)
   # Agregar: router.get() o router.post() o router.put()
   ```

2. **Cambiar lib/*.ts**
   ```typescript
   // ANTES:
   const { data, error } = await supabase.from('table')...
   
   // DESPUÉS:
   const data = await apiCall('/endpoint', 'GET');
   ```

3. **Testear**
   ```bash
   # 1. Reiniciar backend: node server.js
   # 2. Actualizar navegador: F5
   # 3. Probar función en app
   # 4. Verificar en DevTools Console
   # 5. Verificar datos en MySQL: phpMyAdmin
   ```

4. **Marcar como DONE**
   - Cambiar Status a ✅ DONE
   - Actualizar este archivo

---

## 🚀 PRÓXIMO PASO

**Empezamos con:** `obtenerReportesPorUsuario()` (Función #1)

¿Estás listo para comenzar?
