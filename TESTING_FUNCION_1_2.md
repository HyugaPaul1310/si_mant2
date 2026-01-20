# 🧪 TESTING GUÍA - Funciones #1 y #2

## ✅ FUNCIONES MIGRADAS
1. `obtenerReportesPorUsuario()` - GET /api/reportes/por-usuario/:email
2. `obtenerTodosLosReportes()` - GET /api/reportes/todos/admin/list

## 📋 PASO 1: Reiniciar Backend
```bash
cd C:\xampp\htdocs\si_mant2\backend
node server.js
```

Espera a ver:
```
Servidor Express corriendo en puerto 3001
Environment: development
Accesible en: http://192.168.1.75:3001
```

## 📋 PASO 2: Recarga del Navegador
- Presiona **F5** en el navegador
- O **Ctrl+Shift+Delete** si necesitas limpiar caché

## 📋 PASO 3: Testing en DevTools

Abre DevTools > Console y pega esto:

### Test 1: obtenerReportesPorUsuario()
```javascript
// Obtener reportes del usuario logueado
fetch('http://192.168.1.75:3001/api/reportes/por-usuario/test@example.com', {
  headers: {
    'Authorization': localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Reportes del usuario:', data))
.catch(e => console.error('Error:', e))
```

Deberías ver:
```json
{
  "success": true,
  "data": [ { id: 1, titulo: "...", ... }, ... ]
}
```

### Test 2: obtenerTodosLosReportes()
```javascript
// Obtener TODOS los reportes (solo admin)
fetch('http://192.168.1.75:3001/api/reportes/todos/admin/list', {
  headers: {
    'Authorization': localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Todos los reportes:', data))
.catch(e => console.error('Error:', e))
```

Deberías ver:
```json
{
  "success": true,
  "data": [ {...}, {...}, ... ]
}
```

## 📋 PASO 4: Verificar en App

### Test obtenerReportesPorUsuario()
1. Ve a **Panel del Usuario** (donde ve sus propios reportes)
2. Verifica que carga correctamente
3. Abre DevTools > Console
4. Debería mostrar logs del backend: `[BACKEND-REPORTES] Reportes obtenidos: X`

### Test obtenerTodosLosReportes()
1. Ve a **Admin Panel** > **Reportes**
2. Verifica que carga todos los reportes
3. Abre DevTools > Console
4. Debería mostrar logs del backend

## 📋 PASO 5: Verificar en Base de Datos

```bash
# En otra terminal PowerShell:
& "C:\xampp\mysql\bin\mysql.exe" -u root -h localhost si_mant2 -e "SELECT COUNT(*) as total_reportes FROM reportes;" 2>&1
```

Deberías ver el número total de reportes.

## ✅ SI TODO FUNCIONA:
- [ ] Reportes aparecen en panel de usuario
- [ ] Reportes aparecen en admin
- [ ] Console muestra logs del backend
- [ ] No hay errores en DevTools
- [ ] MySQL devuelve datos

## ❌ SI HAY PROBLEMAS:

**Error: "Unknown column usuario_email"**
- Verifica que la tabla reportes tiene la columna `usuario_email`
- Query: `DESCRIBE reportes;` en MySQL

**Error: 403 Unauthorized en obtenerTodosLosReportes()**
- Significa que no eres admin
- Solo admins pueden ver todos los reportes

**Error: Network error / 500**
- Verificar que backend está corriendo
- Ver logs en consola del backend

## 📝 PRÓXIMO PASO
Una vez tests passed: **Función #3: actualizarEstadoReporte()**
