# 🧪 TESTING FUNCIÓN #3: actualizarEstadoReporte()

## ✅ MIGRADO
- Endpoint backend: `PUT /api/reportes/:id/estado`
- Función frontend: `actualizarEstadoReporte(id, estado)`

## 📋 ESTADOS VÁLIDOS
- `pendiente`
- `en_proceso` o `en proceso`
- `en espera` o `en_espera`
- `terminado` o `finalizado` o `resuelto`

---

## 🧪 PASO 1: Reiniciar Backend

```bash
cd C:\xampp\htdocs\si_mant2\backend
node server.js
```

Espera:
```
Servidor Express corriendo en puerto 3001
```

## 🧪 PASO 2: Recarga Navegador
**F5** o **Ctrl+Shift+Delete**

## 🧪 PASO 3: Testing en DevTools

Abre DevTools > Console y copia esto:

```javascript
// Obtener el primer reporte para probar
fetch('http://192.168.1.75:3001/api/reportes', {
  headers: { 'Authorization': localStorage.getItem('token') }
})
.then(r => r.json())
.then(data => {
  if (data.data.length > 0) {
    const reporteId = data.data[0].id;
    console.log('Primer reporte ID:', reporteId);
    
    // Ahora cambiar su estado
    fetch(`http://192.168.1.75:3001/api/reportes/${reporteId}/estado`, {
      method: 'PUT',
      headers: {
        'Authorization': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado: 'en_proceso' })
    })
    .then(r => r.json())
    .then(result => {
      console.log('Respuesta actualización:', result);
      if (result.success) {
        console.log('✅ Estado actualizado a:', result.data.estado);
      }
    })
    .catch(e => console.error('Error:', e))
  }
})
.catch(e => console.error('Error:', e))
```

Deberías ver:
```
✅ Estado actualizado a: en_proceso
```

## 🧪 PASO 4: Testing en App (Manual)

### Opción 1: Si tienes acceso a cambiar estado en Admin
1. Ve a **Admin > Reportes**
2. Busca un reporte
3. Haz clic en cambiar estado
4. Verifica que cambia en la interfaz
5. Revisa DevTools > Console para ver logs del backend:
   ```
   [BACKEND-ESTADO] ID: 123, entrada: "en_proceso" -> normalized: "en_proceso"
   [BACKEND-ESTADO] Reporte actualizado a estado: "en_proceso"
   ```

### Opción 2: Testing directo en Database
```bash
# Ver estado antes:
& "C:\xampp\mysql\bin\mysql.exe" -u root -h localhost si_mant2 -e "SELECT id, estado FROM reportes LIMIT 1;" 2>&1

# Cambiar estado vía app

# Ver estado después:
& "C:\xampp\mysql\bin\mysql.exe" -u root -h localhost si_mant2 -e "SELECT id, estado FROM reportes LIMIT 1;" 2>&1
```

## ✅ VERIFICACIÓN FINAL

- [ ] El estado cambia en la app
- [ ] No hay errores en Console
- [ ] El backend muestra logs: `[BACKEND-ESTADO] Reporte actualizado`
- [ ] MySQL refleja el cambio

## 📝 PRÓXIMO PASO
Una vez tests passed: **Función #4: asignarReporteAEmpleado()**
