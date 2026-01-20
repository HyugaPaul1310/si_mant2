# Diagrama del Flujo de Trabajo Corregido

## Timeline Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE TRABAJO COMPLETO                        │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐
│   ESTADO: PENDIENTE    │
│   (Recién asignado)    │
└────────────────────────┘
         ↓
    EMPLEADO PANEL:
    ├─ ✓ Ver reporte asignado
    ├─ ✓ Ver archivos (fotos/videos)
    ├─ ✓ Botón: "Cotizar"
    └─ ✗ NO VE Fase 2 (Revisión, Recomendaciones, Reparación)
    
    CLIENTE PANEL:
    └─ ✗ No hay cotización aún

              ↓ [Empleado hace clic en "Cotizar"]

┌────────────────────────┐
│   ESTADO: COTIZADO     │
│   (Precio enviado)     │
└────────────────────────┘
         ↓
    EMPLEADO PANEL:
    ├─ ✓ Ver reporte con precio
    ├─ ✓ Ver análisis guardado
    └─ ✗ NO VE Fase 2 (esperando aceptación del cliente)
    
    CLIENTE PANEL:
    ├─ ✓ Ve cotización en lista
    ├─ ✓ Puede ver detalles
    ├─ ✓ Botones: "Aceptar" / "Rechazar"
    └─ Estado de cotización: "Pendiente"

        ↓ [Cliente hace clic en "Aceptar"]

┌────────────────────────┐
│   ESTADO: EN_PROCESO   │
│   (Trabajo activo)     │
└────────────────────────┘
         ↓
    EMPLEADO PANEL:
    ├─ ✓ Ver reporte
    ├─ ✓ Campos Fase 2: REVISIÓN
    ├─ ✓ Campos Fase 2: RECOMENDACIONES
    ├─ ✓ Campos Fase 2: REPARACIÓN
    ├─ ✓ Campos Fase 2: MATERIALES/REFACCIONES
    ├─ ✓ Botón: "Finalizar Trabajo"
    └─ ✓ Puede guardar Fase 2 (opcional antes de finalizar)
    
    CLIENTE PANEL:
    ├─ ✓ Ve cotización "Aceptada"
    ├─ ✓ Ve estado como "En proceso"
    └─ Esperando finalización del técnico

       ↓ [Empleado completa Fase 2 y hace clic "Finalizar Trabajo"]

┌────────────────────────────────┐
│   ESTADO: FINALIZADO_POR_TECNICO   │
│   (Esperando confirmación)     │
└────────────────────────────────┘
         ↓
    EMPLEADO PANEL:
    ├─ ✓ Trabajo finalizado
    ├─ ✓ Datos de Fase 2 guardados
    └─ Esperando confirmación del cliente
    
    CLIENTE PANEL:
    ├─ ✓ Ve cotización "En revisión"
    ├─ ✓ Puede ver Fase 2 completada
    ├─ ✓ Botones: "Confirmar finalización" / "Rechazar"
    └─ Necesita revisar y confirmar

       ↓ [Cliente confirma finalización]

┌────────────────────────┐
│   ESTADO: FINALIZADO   │
│   (Completado)         │
└────────────────────────┘
         ↓
    EMPLEADO PANEL:
    └─ ✓ Reporte en historial (reportes finalizados)
    
    CLIENTE PANEL:
    └─ ✓ Reporte en historial (completados)
```

## Estados de la BD

```
┌──────────────────────┬─────────────────────────────────────┬──────────────┐
│      ESTADO          │          VISIBLE EN                  │ FASE 2 VISIBLE│
├──────────────────────┼─────────────────────────────────────┼──────────────┤
│ pendiente            │ Empleado (asignado)                 │ NO           │
│ cotizado             │ Cliente (cotizaciones pendientes)    │ NO           │
│ en_proceso           │ Empleado (trabajando)               │ SÍ ✓         │
│ finalizado_por_tecnico│ Cliente (en revisión)              │ SÍ           │
│ finalizado           │ Historial de ambos                  │ SÍ           │
└──────────────────────┴─────────────────────────────────────┴──────────────┘
```

## Lógica de Visibilidad en Código

### Empleado Panel
```javascript
// Fase 2 solo se muestra cuando está en proceso
{reporteSeleccionado.estado === 'en_proceso' && (
  <>
    <Revisión />
    <Recomendaciones />
    <Reparación />
    <Materiales />
  </>
)}

// Botones de acción
{reporteSeleccionado.estado === 'pendiente' && <BotónCotizar />}
{reporteSeleccionado.estado === 'en_proceso' && <BotónFinalizarTrabajo />}
```

### Cliente Panel
```javascript
// Mostrar solo cotizaciones (reportes con precio_cotizacion)
const cotizacionesFiltradas = reportes.filter(r =>
  r.precio_cotizacion && 
  (r.estado === 'cotizado' || r.estado === 'en_proceso' || r.estado === 'finalizado_por_tecnico')
)

// Botones de acción
{cotizacionSeleccionada.estado === 'cotizado' && (
  <>
    <BotónAceptar />
    <BotónRechazar />
  </>
)}
```

## Cambio Principal: Asignación

**ANTES (❌ INCORRECTO)**:
```javascript
// Al asignar, se saltaba pendiente y iba directo a en_proceso
UPDATE reportes 
SET estado = 'en_proceso', empleado_asignado_id = ?
WHERE id = ?
```

**DESPUÉS (✅ CORRECTO)**:
```javascript
// Al asignar, solo se asigna el empleado, se mantiene pendiente
UPDATE reportes 
SET empleado_asignado_id = ?
WHERE id = ?
// Estado permanece: 'pendiente'
```

## Flujo en Admin Panel

```
Admin Panel: Reportes
    ↓
[Clic en reporte]
    ↓
Modal de detalles
    ├─ Información del reporte
    ├─ Botón: "Asignar a empleado"
    └─ Selector de empleado
    
    ↓ [Selecciona empleado y hace clic en "Asignar"]
    
BACKEND:
    └─ UPDATE reportes SET empleado_asignado_id = ? WHERE id = ?
       (Estado permanece 'pendiente')
    
Empleado Panel:
    ├─ Recibe notificación/refresca
    ├─ Ve nuevo reporte en "Mis reportes"
    ├─ Estado: PENDIENTE
    └─ Espera acciones del empleado
```

## Casos de Uso

### Caso 1: Flujo Normal
```
1. Admin asigna → pendiente
2. Empleado cotiza → cotizado
3. Cliente acepta → en_proceso
4. Empleado completa → finalizado_por_tecnico
5. Cliente confirma → finalizado
✓ ÉXITO
```

### Caso 2: Cliente rechaza cotización
```
1. Admin asigna → pendiente
2. Empleado cotiza → cotizado
3. Cliente rechaza → pendiente (estado vuelve?)
4. Empleado puede re-cotizar o esperar instrucciones
```
**NOTA**: Hay que implementar la lógica de rechazo

### Caso 3: Empleado necesita hacer cambios
```
1. Empleado está llenando Fase 2
2. Se da cuenta que falta información
3. Puede guardar parcialmente (sin finalizar)
4. Vuelve a abrir y continúa
5. Finalmente finaliza
✓ ÉXITO
```
