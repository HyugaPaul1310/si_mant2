# 🧹 Limpieza de Supabase - Estado Actual

## ✅ YA ELIMINADO
- [x] Credenciales de Supabase removidas de `.env`
- [x] Credenciales de Supabase removidas de `enblocal.txt`  
- [x] Credenciales de Supabase removidas de `backend/.env`
- [x] `lib/empresas.ts` - Completamente migrado a backend (`routes/empresas.js`)

## 🔴 AÚNUSA SUPABASE - REQUIERE MIGRACIÓN URGENTE

### lib/reportes.ts (CRÍTICO - 14+ funciones)
```typescript
// SUPABASE - Necesita migración al backend
- obtenerReportesPorUsuario()
- obtenerTodosLosReportes()
- actualizarEstadoReporte()
- asignarReporteAEmpleado()
- obtenerReportesAsignados()
- actualizarEstadoReporteAsignado()
- obtenerArchivosPorReporte()
- obtenerFotosPorReporte()
- obtenerVideosPorReporte()
- guardarCotizacion()
- obtenerCotizacionesCliente()
- obtenerCotizacionesEmpleado()
- obtenerTituloReporte()
- eliminarReporte()
```

### lib/tareas.ts
```typescript
// SUPABASE - Necesita migración
- obtenerTareasPorUsuario()
- obtenerTareasPorEmpleado()
- crearTarea()
- actualizarTarea()
- cambiarEstadoTarea()
- marcarTareaCompletada()
- eliminarTarea()
```

### lib/inventario.ts
```typescript
// SUPABASE - Necesita migración
- obtenerHerramientas()
- obtenerHerramientasDisponibles()
- asignarHerramienta()
- obtenerHerramientasAsignadas()
- devolverHerramienta()
- actualizarEstadoHerramienta()
```

### lib/auth.ts
```typescript
// SUPABASE - Autenticación
- login()
- signup()
- logout()
- getCurrentUser()
```

### lib/supabase.ts
```
// Cliente de Supabase base - Se puede eliminar si todo está migrado al backend
```

## 📋 Plan de Migración (Próximos pasos)

1. **Migrar lib/reportes.ts al backend** (routes/reportes.js - ya existe parcialmente)
   - Crear/actualizar endpoints GET, POST, PUT, DELETE
   - Cambiar función imports a `apiCall()` del backend

2. **Migrar lib/tareas.ts al backend**
   - Crear routes/tareas.js con endpoints CRUD
   
3. **Migrar lib/inventario.ts al backend**
   - Crear routes/inventario.js con endpoints CRUD

4. **Migrar lib/auth.ts al backend**
   - Actualizar routes/auth.js existente si es necesario

5. **Eliminar lib/supabase.ts**
   - Solo eliminar cuando TODO esté migrado

## ⚠️ NOTA IMPORTANTE
No eliminar Supabase imports hasta que:
- ✅ Función esté implementada en backend (routes/)
- ✅ Frontend imports se cambien a `apiCall()` 
- ✅ Se pruebe completamente
- ✅ Se verifique que datos se guardan en MySQL

## 🔗 Referencias
- Backend: `backend/routes/` (Express.js)
- Frontend API: `lib/api-backend.ts` (usa `apiCall()`)
- Database: MySQL en `si_mant2` (XAMPP)
