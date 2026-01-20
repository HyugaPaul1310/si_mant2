# Resumen de Correcciones de Flujo de Trabajo

## Problema Identificado

El usuario reportó que los campos de **Fase 2 (Revisión, Recomendaciones, Reparación)** aparecían en el panel del empleado **sin que hubiera cotización previo**. Esto rompía el flujo de trabajo esperado:

```
Flujo esperado:
1. Admin asigna reporte → pendiente
2. Empleado cotiza → cotizado
3. Cliente acepta → en_proceso
4. Empleado completa → finalizado_por_tecnico
```

## Raíz del Problema

En `backend/routes/reportes.js`, el endpoint `/asignar` estaba actualizando automáticamente el estado del reporte a `'en_proceso'`:

```javascript
// ❌ ANTES (INCORRECTO)
await pool.query(
  'UPDATE reportes SET estado = ?, empleado_asignado_id = ? WHERE id = ?',
  ['en_proceso', empleado_id, req.params.id]  // ← Estado cambió a en_proceso
);
```

Esto provocaba que:
- El reporte aparecía como "en_proceso" apenas se asignaba
- Los campos de Fase 2 se mostraban inmediatamente (porque la condición `estado === 'en_proceso'` era verdadera)
- El empleado podía llenar datos de "Revisión" y "Reparación" sin haber cotizado antes

## Soluciones Aplicadas

### 1. ✅ Backend: Mantener estado pendiente al asignar
**Archivo**: `backend/routes/reportes.js` (línea 141)

**Cambio**:
```javascript
// ✅ DESPUÉS (CORRECTO)
await pool.query(
  'UPDATE reportes SET empleado_asignado_id = ? WHERE id = ?',
  [empleado_id, req.params.id]  // Solo asigna empleado, mantiene estado pendiente
);
```

**Resultado**: Ahora cuando admin asigna un reporte, el estado permanece en `'pendiente'` y se asigna el `empleado_asignado_id`. El empleado puede ver el reporte asignado pero SIN los campos de Fase 2.

### 2. ✅ Frontend: Actualizar estado local después de cotizar
**Archivo**: `app/empleado-panel.tsx` (función `guardarCotizacion`, línea 354)

**Cambio**:
```javascript
// Antes: Borraba reporteSeleccionado
setReporteSeleccionado(null);

// Después: Actualiza con estado cotizado
setReporteSeleccionado({
  ...reporteSeleccionado,
  estado: 'cotizado',
  analisis_general: descripcionTrabajo.trim(),
  precio_cotizacion: precioNumerico
});
```

**Resultado**: El modal de detalles ahora refleja inmediatamente el cambio de estado a `'cotizado'`. Los campos de Fase 2 desaparecen (porque la condición `estado === 'en_proceso'` es falsa).

### 3. ✅ Frontend: Filtrar cotizaciones correctamente
**Archivo**: `app/cliente-panel.tsx` (función `cargarCotizaciones`, línea 164)

**Cambio**:
```javascript
// Antes: Mostraba TODOS los reportes del cliente
setCotizaciones(resultado.data);

// Después: Filtra solo cotizaciones (con precio_cotizacion)
const cotizacionesFiltradas = resultado.data.filter((r: any) => 
  r.precio_cotizacion && (r.estado === 'cotizado' || r.estado === 'en_proceso' || r.estado === 'finalizado_por_tecnico')
);
setCotizaciones(cotizacionesFiltradas);
```

**Resultado**: El cliente solo ve reportes que han sido cotizados (tienen `precio_cotizacion`).

### 4. ✅ Frontend: Actualizar condiciones de visibilidad
**Archivos**: `app/cliente-panel.tsx`

**Cambios**:
- Línea 1307: Badge de estado ahora muestra "Pendiente", "Aceptada", "En revisión" basado en `estado === 'cotizado'`, `'en_proceso'`, `'finalizado_por_tecnico'`
- Línea 1393: Mostrar estado correcto en modal de detalle
- Línea 1403: Botón "Aceptar" se muestra cuando `estado === 'cotizado'` (no `'pendiente'`)

## Flujo Correcto Ahora

```
1. Admin asigna reporte
   └─ Estado: pendiente ✓
   └─ Empleado ve: Botón "Cotizar" solamente

2. Empleado cotiza (ingresa análisis y precio)
   └─ Estado: cotizado ✓
   └─ Cliente ve: Cotización en lista, botones "Aceptar/Rechazar"
   └─ Empleado ve: Modal sin Fase 2 (esperando aceptación del cliente)

3. Cliente acepta cotización
   └─ Estado: en_proceso ✓
   └─ Empleado ve: Campos de Fase 2 (Revisión, Recomendaciones, Reparación)
   └─ Botón: "Finalizar Trabajo"

4. Empleado completa trabajo
   └─ Estado: finalizado_por_tecnico ✓
   └─ Cliente ve: Cotización marcada como "En revisión"
```

## Archivos Modificados

1. ✅ `backend/routes/reportes.js` - Cambiar lógica de asignación
2. ✅ `app/empleado-panel.tsx` - Actualizar estado local después de cotizar
3. ✅ `app/cliente-panel.tsx` - Filtrar cotizaciones y actualizar condiciones

## Validación

Para validar que el flujo funciona correctamente:

1. **Admin Panel**: Asignar un reporte a un empleado
2. **Empleado Panel**: Verificar que el reporte aparece pero SIN campos de Fase 2
3. **Empleado Panel**: Clic en "Cotizar" → ingresa análisis y precio → guarda
4. **Cliente Panel**: Abre "Cotizaciones" → debe ver la cotización con estado "Pendiente"
5. **Cliente Panel**: Clic en "Aceptar" → estado cambia a "Aceptada"
6. **Empleado Panel**: Abre reporte nuevamente → ahora ve campos de Fase 2
7. **Empleado Panel**: Completa Fase 2 → clic en "Finalizar Trabajo"
8. **Cliente Panel**: La cotización ahora muestra "En revisión"

## Notas Importantes

- Los cambios mantienen compatibilidad con el resto del sistema
- No se alteraron tablas de base de datos, solo la lógica de aplicación
- El estado `'finalizado_por_tecnico'` debe ser revisado por el cliente para confirmar la finalización
- Los archivos (fotos/videos) continúan funcionando en todos los estados
