# Guía de Prueba del Flujo de Trabajo Corregido

## Resumen Rápido de la Corrección

**Problema**: Los campos de "Revisión", "Recomendaciones" y "Reparación" aparecían en el panel del empleado sin que se hubiera cotizado.

**Causa**: Cuando el admin asignaba un reporte, el estado se cambiaba automáticamente a "en_proceso", lo que hacía que se mostraran los campos de Fase 2 inmediatamente.

**Solución**: 
1. Backend ahora mantiene estado "pendiente" al asignar
2. Empleado debe cotizar primero
3. Cliente debe aceptar la cotización
4. Solo ENTONCES aparecen los campos de Fase 2

---

## Pasos de Prueba

### PASO 1: Preparación Inicial
```
Backend: Asegurar que está corriendo en http://192.168.1.75:3001
Frontend: Asegurar que está compilado y corriendo
```

### PASO 2: Admin - Asignar Reporte

1. **Abre Admin Panel**
   - Usuario: admin@empresa.com
   - Rol: admin

2. **Busca un reporte sin asignar**
   - Sección: "Reportes"
   - Haz clic en el reporte

3. **Abre modal de detalles**
   - Verifica que el reporte esté sin empleado asignado
   - Busca el botón "Asignar a empleado"

4. **Asigna a un empleado**
   - Selecciona un empleado de la lista
   - Haz clic en "Asignar"
   - Cierra el modal

5. **Resultado esperado**:
   - El reporte ahora aparece en el panel del empleado
   - Estado: **PENDIENTE** (verificar en la consola o en la BD)

---

### PASO 3: Empleado - Cotizar el Reporte

1. **Abre Empleado Panel**
   - Usuario: empleado@empresa.com
   - Rol: empleado

2. **Busca el reporte asignado**
   - Sección: "Mis reportes" o equivalente
   - Debería ver el reporte recién asignado

3. **Abre el reporte**
   - Haz clic en el reporte o en el botón "Ver"
   - Se abre el modal de "Detalles del reporte"

4. **VERIFICACIÓN CRÍTICA**:
   ```
   ✗ NO DEBERÍA VER:
     - Campos de "REVISIÓN"
     - Campos de "RECOMENDACIONES"
     - Campos de "REPARACIÓN"
   
   ✓ DEBERÍA VER:
     - Botón "Cotizar"
     - Información del reporte
     - Archivos adjuntos (si los hay)
   ```

5. **Cotiza el reporte**
   - Haz clic en el botón "Cotizar"
   - Se abre modal "Cotizar Reporte"
   - Rellena:
     - "Análisis General": (describe el problema y lo que necesita arreglarse)
     - "Precio del arreglo": (ej: 150.00)
   - Haz clic en "Cotizar"

6. **Resultado esperado**:
   - Se guarda la cotización
   - Ver mensaje: "Cotización guardada exitosamente"
   - El modal se cierra
   - El reporte ahora tiene estado **COTIZADO**

7. **VERIFICACIÓN ADICIONAL**:
   - Si el empleado abre el reporte nuevamente
   - **SIGUE SIN VER** campos de Fase 2 (porque el cliente aún no ha aceptado)

---

### PASO 4: Cliente - Aceptar Cotización

1. **Abre Cliente Panel**
   - Usuario: cliente@empresa.com
   - Rol: cliente
   - Debería ver el mismo usuario que creó el reporte original

2. **Abre "Cotizaciones"** (o sección equivalente)
   - Debería ver la cotización recién creada
   - Estado: **"Pendiente"** (de aceptación)
   - Precio: $150.00 (o el que ingresó el empleado)

3. **Abre el detalle de la cotización**
   - Haz clic en la cotización
   - Modal muestra:
     - Información del reporte
     - Información de la cotización
     - Análisis del empleado
     - Precio
     - Botones: "Aceptar" y "Rechazar"

4. **Acepta la cotización**
   - Haz clic en "Aceptar"
   - Ver mensaje: "Cotización aceptada. El reporte está listo para trabajar."
   - El modal se cierra

5. **Resultado esperado**:
   - La cotización ahora muestra estado **"Aceptada"**
   - El reporte del empleado cambió a **EN_PROCESO**

---

### PASO 5: Empleado - Completar Fase 2

1. **Vuelve a Empleado Panel**
   - Abre el mismo reporte

2. **VERIFICACIÓN CRÍTICA**:
   ```
   ✓ AHORA DEBERÍA VER:
     - Campos de "REVISIÓN"
     - Campos de "RECOMENDACIONES"
     - Campos de "REPARACIÓN"
     - Campos de "MATERIALES/REFACCIONES"
   
   ✓ DEBERÍA VER:
     - Botón "Finalizar Trabajo"
   ```

3. **Completa los campos de Fase 2**:
   - **Revisión**: Describe qué se revisó
   - **Recomendaciones**: Qué se recomienda al cliente
   - **Reparación**: Detalla lo que fue reparado
   - **Materiales/Refacciones**: Lista de piezas utilizadas

4. **Finaliza el trabajo**
   - Haz clic en "Finalizar Trabajo"
   - Ver confirmación o modal de confirmación
   - Haz clic en "Confirmar"

5. **Resultado esperado**:
   - El reporte cambió a estado **FINALIZADO_POR_TECNICO**
   - Ver mensaje: "Trabajo finalizado. El cliente debe revisar y confirmar la finalización."
   - El reporte aparece en "Historial de reportes" (si existe esa sección)

---

### PASO 6: Cliente - Confirmar Finalización

1. **Vuelve a Cliente Panel**
   - Abre "Cotizaciones" o la sección de reportes activos
   - Debería ver la cotización con estado **"En revisión"**

2. **Abre el detalle**
   - Verifica que pueda ver todos los campos de Fase 2 completados por el empleado
   - Botones: "Confirmar finalización" y "Rechazar"

3. **Confirma la finalización**
   - Haz clic en "Confirmar finalización"
   - Ver mensaje de confirmación

4. **Resultado esperado**:
   - El reporte cambió a **FINALIZADO**
   - El reporte pasa a "Historial" o "Reportes completados"
   - El flujo se completó exitosamente

---

## Matriz de Prueba Resumida

```
┌───────────────────────┬──────────────┬────────────────────────┐
│ PASO                  │ ESTADO       │ QUE DEBERÍA VER        │
├───────────────────────┼──────────────┼────────────────────────┤
│ 1. Admin asigna       │ PENDIENTE    │ Reporte en panel emplea│
│ 2. Empleado abre      │ PENDIENTE    │ Botón "Cotizar" (✗Fase2)
│ 3. Empleado cotiza    │ COTIZADO     │ Cotización guardada    │
│ 4. Cliente abre cotiz │ COTIZADO     │ Botones Aceptar/Rechaz │
│ 5. Cliente acepta     │ EN_PROCESO   │ Confirmar aceptación   │
│ 6. Empleado abre      │ EN_PROCESO   │ Campos Fase 2 (✓)      │
│ 7. Empleado completa  │ FINALIZADO_* │ Trabajo finalizado     │
│ 8. Cliente confirma   │ FINALIZADO   │ Reporte en historial   │
└───────────────────────┴──────────────┴────────────────────────┘
```

---

## Verificaciones en Base de Datos

Si necesitas verificar el estado en la BD:

```sql
-- Ver estado del reporte
SELECT id, titulo, estado, empleado_asignado_id, precio_cotizacion, analisis_general
FROM reportes
WHERE id = ?;

-- Verificar cambios de estado en tiempo real
SELECT id, titulo, estado, updated_at
FROM reportes
ORDER BY updated_at DESC
LIMIT 5;
```

---

## Posibles Problemas y Soluciones

### Problema 1: Aún veo Fase 2 sin cotizar
**Posible causa**: El servidor no recargó los cambios
**Solución**: 
- Detén el servidor con Ctrl+C
- Reinicia con `npm start` en la carpeta del backend
- Recarga el frontend

### Problema 2: El cliente no ve la cotización
**Posible causa**: La cotización no se filtró correctamente
**Solución**:
- Verifica que el reporte tenga `precio_cotizacion` en la BD
- Verifica que el estado sea 'cotizado'
- Recarga el panel del cliente

### Problema 3: Después de aceptar, el empleado aún ve "Cotizar"
**Posible causa**: El estado no se actualizó en la BD
**Solución**:
- Verifica en la BD que `estado = 'en_proceso'`
- Recarga el panel del empleado
- Si sigue sin funcionar, contacta al soporte

### Problema 4: Los campos de Fase 2 siguen ocultos después de aceptar
**Posible causa**: El estado en local no se actualizó
**Solución**:
- Cierra el modal de detalles
- Abre el reporte nuevamente (para que se cargue desde `listaReportes` actualizado)
- Los campos deberían aparecer ahora

---

## Checklist de Validación

```
[ ] Admin Panel
    [ ] Puedo asignar reportes
    [ ] El estado permanece "pendiente" después de asignar
    
[ ] Empleado Panel
    [ ] Veo reportes asignados
    [ ] NO veo Fase 2 antes de cotizar
    [ ] Puedo cotizar el reporte
    [ ] Después de cotizar, el estado es "cotizado"
    [ ] AHORA veo Fase 2 después de que el cliente acepta
    [ ] Puedo completar Fase 2
    [ ] Puedo finalizar el trabajo
    
[ ] Cliente Panel
    [ ] Veo cotizaciones pendientes
    [ ] El estado muestra "Pendiente"
    [ ] Puedo aceptar/rechazar
    [ ] Después de aceptar, veo estado "Aceptada"
    [ ] Después de finalizar empleado, veo "En revisión"
    [ ] Puedo confirmar finalización
    
[ ] Historial
    [ ] Reportes finalizados aparecen en historial
    [ ] Puedo ver todos los datos completados
```

---

## Notas Técnicas

### Campos Fase 2
```javascript
// Solo visible cuando estado === 'en_proceso'
- Revisión (required para finalizar)
- Recomendaciones (required para finalizar)
- Reparación (required para finalizar)
- Recomendaciones Adicionales (opcional)
- Materiales/Refacciones (opcional)
```

### Estados en BD
```javascript
'pendiente'             // Recién asignado
'cotizado'              // Empleado cotizó, cliente decide
'en_proceso'            // Cliente aceptó, empleado trabaja
'finalizado_por_tecnico' // Empleado terminó, cliente revisa
'finalizado'            // Cliente confirmó, completado
```

### Validaciones en Frontend
- Empleado no puede finalizar sin llenar Revisión, Recomendaciones, Reparación
- Cliente no puede ver campos de Fase 2 si no es necesario
- Admin solo puede asignar empleados activos

---

## Conclusión

Si todo funciona como se describe en esta guía, el flujo de trabajo está completamente corregido. El problema de ver Fase 2 sin cotizar ha sido resuelto.

Para reportar problemas, incluye:
- Paso en el que falla
- Estado esperado vs. estado actual
- Rol del usuario (admin, empleado, cliente)
- ID del reporte (si es posible)
- Logs del navegador (F12 → Console)
- Logs del servidor (backend)
