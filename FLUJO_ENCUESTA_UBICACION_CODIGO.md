# 📍 FLUJO DE ENCUESTA - UBICACIÓN EN EL CÓDIGO

## 🎯 ¿En qué punto el cliente da por terminado el reporte y responde la encuesta?

---

## 1️⃣ PASO 1: Cliente ve reporte en estado "Finalizado por Técnico"

**Archivo**: [app/cliente-panel.tsx](app/cliente-panel.tsx#L1)

**Ubicación**: Líneas 180-190 (filtrado de cotizaciones)
```typescript
// Se muestran solo reportes que tienen precio_cotizacion (fueron cotizados)
const cotizacionesFiltradas = (cotizaciones || []).filter(
  c => c.precio_cotizacion && (
    c.estado === 'cotizado' || 
    c.estado === 'en_proceso' || 
    c.estado === 'finalizado_por_tecnico'  // ← AQUÍ EL CLIENTE VE ESTE ESTADO
  )
);
```

---

## 2️⃣ PASO 2: Cliente ve botón "Confirmar Finalización"

**Archivo**: [app/cliente-panel.tsx](app/cliente-panel.tsx#L1407-L1480)

**Ubicación**: Líneas 1407-1480 (Modal de Cotización Detalle)
```tsx
// Dentro del modal de cotización detalle (showCotizacionesModal)
// Cuando cotizacionSeleccionada.estado === 'finalizado_por_tecnico'

{cotizacionSeleccionada.estado === 'finalizado_por_tecnico' && (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: '#10b981' }]}
      onPress={async () => {
        // PASO 3: Se abre modal para confirmar
        setReporteAConfirmar({...});
        setShowConfirmarFinalizacionModal(true);
      }}
    >
      <Text>Confirmar Finalización</Text>  // ← BOTÓN VERDE
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
      onPress={...}
    >
      <Text>Rechazar</Text>  // ← BOTÓN ROJO
    </TouchableOpacity>
  </View>
)}
```

---

## 3️⃣ PASO 3: Se abre Modal de "Confirmar Finalización"

**Archivo**: [app/cliente-panel.tsx](app/cliente-panel.tsx#L1525-L1600)

**Ubicación**: Líneas 1525-1600 (Modal Confirmar Finalización)
```tsx
{/* PASO 4: Modal para Confirmar Finalización del Trabajo */}
{showConfirmarFinalizacionModal && reporteAConfirmar && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Confirmar finalización</Text>
        <Text style={styles.modalSubtitle}>Revisión de trabajo completado</Text>
      </View>
      
      {/* Muestra info del técnico y equipo */}
      <View style={styles.reportCard}>
        <Text>Técnico: {reporteAConfirmar.empleado_asignado_nombre}</Text>
      </View>
      
      {/* Botones */}
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => setShowConfirmarFinalizacionModal(false)}
      >
        <Text>Cancelar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={async () => {
          // PASO 5: NAVEGA A ENCUESTA
          router.push({
            pathname: '/encuesta',
            params: {
              reporteId: reporteAConfirmar.id,
              clienteEmail: usuario?.email,
              clienteNombre: usuario?.nombre,
              empresa: usuario?.empresa,
              empleadoEmail: reporteAConfirmar.empleado_asignado_email,
              empleadoNombre: reporteAConfirmar.empleado_asignado_nombre,
            },
          });
        }}
      >
        <Text>Aceptar y continuar</Text>  // ← BOTÓN QUE ABRE ENCUESTA
      </TouchableOpacity>
    </View>
  </View>
)}
```

---

## 4️⃣ PASO 4: Se abre pantalla de Encuesta

**Archivo**: [app/encuesta.tsx](app/encuesta.tsx#L1-150)

**Ubicación**: Línea 1 hasta línea 150 (Configuración y manejo de encuesta)

### Estructura de la encuesta:
```typescript
const PREGUNTAS = [
  {
    id: 1,
    texto: 'El trato que recibió por parte del equipo de Simant me pareció:',
    key: 'trato_equipo'
  },
  {
    id: 2,
    texto: 'El equipo técnico de la empresa le resuelve sus problemas de forma:',
    key: 'equipo_tecnico'
  },
  {
    id: 3,
    texto: 'El personal administrativo que recibe mi solicitud me atiende de forma:',
    key: 'personal_administrativo'
  },
  {
    id: 4,
    texto: 'La rapidez en la resolución del problema fue:',
    key: 'rapidez'
  },
  {
    id: 5,
    texto: 'El costo del servicio en relación a la calidad fue:',
    key: 'costo_calidad'
  },
  {
    id: 6,
    texto: '¿Recomendaría nuestros servicios a otros clientes?',
    key: 'recomendacion'
  },
  {
    id: 7,
    texto: '¿Qué tan satisfecho está con la solución proporcionada?',
    key: 'satisfaccion'
  },
];
```

---

## 5️⃣ PASO 5: Cliente Responde Preguntas

**Archivo**: [app/encuesta.tsx](app/encuesta.tsx#L200-300)

**Ubicación**: Líneas 200-300 (Renderizado de preguntas)

```tsx
// Renderizado de cada pregunta
{PREGUNTAS.map((pregunta) => (
  <View key={pregunta.id} style={styles.preguntaContainer}>
    <Text style={styles.preguntaTexto}>{pregunta.texto}</Text>
    
    {/* Opciones clickeables */}
    <View style={styles.opcionesContainer}>
      {OPCIONES.map((opcion) => (
        <TouchableOpacity
          key={opcion}
          style={[
            styles.opcion,
            respuestas[pregunta.key] === opcion && styles.opcionSeleccionada
          ]}
          onPress={() => setRespuestas({ ...respuestas, [pregunta.key]: opcion })}
        >
          <Text style={styles.opcionText}>{opcion}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
))}
```

**Validación**: Línea 79
```typescript
const todasLasRespuestasLlenas = PREGUNTAS.every(p => respuestas[p.key]);
// Todos los campos deben estar respondidos
```

---

## 6️⃣ PASO 6: Cliente Envía la Encuesta

**Archivo**: [app/encuesta.tsx](app/encuesta.tsx#L350-450)

**Ubicación**: Líneas 80-150 (Función handleGuardarEncuesta)

```typescript
const handleGuardarEncuesta = async () => {
  if (!todasLasRespuestasLlenas) {
    Alert.alert('Validación requerida', 
      'Por favor responde todas las preguntas');
    return;
  }

  setGuardando(true);
  try {
    // Preparar datos
    const encuestaData = {
      reporte_id: reporteId,
      cliente_email: clienteEmail,
      cliente_nombre: clienteNombre,
      empleado_email: empleadoEmail,
      empleado_nombre: empleadoNombre,
      empresa: empresa,
      trato_equipo: respuestas['trato_equipo'],        // ← Respuesta 1
      equipo_tecnico: respuestas['equipo_tecnico'],    // ← Respuesta 2
      personal_administrativo: respuestas['personal_administrativo'],  // ← Respuesta 3
      rapidez: respuestas['rapidez'],                  // ← Respuesta 4
      costo_calidad: respuestas['costo_calidad'],      // ← Respuesta 5
      recomendacion: respuestas['recomendacion'],      // ← Respuesta 6
      satisfaccion: respuestas['satisfaccion'],        // ← Respuesta 7
    };

    // GUARDAR EN BASE DE DATOS
    const resultadoEncuesta = await guardarEncuestaSatisfaccion(encuestaData);
    // ↓
    // lib/reportes.ts → apiCall('/reportes/encuestas/guardar', 'POST', encuesta)
    // ↓
    // backend/routes/reportes.js → POST /api/reportes/encuestas/guardar
    // ↓
    // MySQL tabla encuestas_satisfaccion
    
    // Cambiar estado a "cerrado_por_cliente"
    const resultadoEstado = await actualizarEstadoCerradoPorCliente(reporteId);
    
    // Navegar de vuelta
    router.push('/cliente-panel?closeModals=true');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setGuardando(false);
  }
};
```

---

## 🔄 Flujo Completo Visualizado

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENTE-PANEL.TSX                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. Cliente ve lista de cotizaciones                             │
│    ↓                                                             │
│ 2. Abre modal de cotización detalle (showCotizacionesModal)    │
│    ↓                                                             │
│ 3. VE ESTADO "finalizado_por_tecnico" → APARECE BOTÓN           │
│    "Confirmar Finalización" (Línea 1465)                        │
│    ↓                                                             │
│ 4. Click en botón → Abre modal "Confirmar finalización"         │
│    (Línea 1525 - showConfirmarFinalizacionModal)               │
│    ↓                                                             │
│ 5. Click en "Aceptar y continuar"                               │
│    ↓                                                             │
│    router.push('/encuesta', params)  ← NAVEGA A ENCUESTA       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ ENCUESTA.TSX                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. Se cargan 7 preguntas (PREGUNTAS array)                      │
│    ↓                                                             │
│ 2. Cliente responde cada pregunta (setRespuestas)               │
│    ↓                                                             │
│ 3. Valida: todasLasRespuestasLlenas = true ✅                  │
│    ↓                                                             │
│ 4. Click en "Enviar Encuesta"                                   │
│    ↓                                                             │
│    handleGuardarEncuesta() ejecuta:                             │
│    ├─ guardarEncuestaSatisfaccion(encuestaData)                │
│    │  └─ apiCall('/reportes/encuestas/guardar')                │
│    │     └─ Backend inserta en MySQL ✅                        │
│    │                                                             │
│    ├─ actualizarEstadoCerradoPorCliente()                      │
│    │  └─ Cambia estado a "cerrado_por_cliente" ✅              │
│    │                                                             │
│    └─ router.push('/cliente-panel?closeModals=true')           │
│       └─ VUELVE AL PANEL DEL CLIENTE ✅                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Resumen de Ubicaciones Clave

| Acción | Archivo | Líneas | Componente |
|--------|---------|--------|-----------|
| **Ver botón "Confirmar Finalización"** | cliente-panel.tsx | 1407-1480 | Modal Cotización Detalle |
| **Abrir modal Confirmar** | cliente-panel.tsx | 1450-1465 | TouchableOpacity onPress |
| **Modal Confirmar Finalización** | cliente-panel.tsx | 1525-1600 | showConfirmarFinalizacionModal |
| **Navegar a encuesta** | cliente-panel.tsx | 1610-1619 | router.push('/encuesta') |
| **Cargar encuesta** | encuesta.tsx | 1-150 | EncuestaPage component |
| **Responder preguntas** | encuesta.tsx | 200-300 | PREGUNTAS map |
| **Validar respuestas** | encuesta.tsx | 79 | todasLasRespuestasLlenas |
| **Guardar encuesta** | encuesta.tsx | 80-150 | handleGuardarEncuesta |
| **Enviar a backend** | lib/reportes.ts | 824-857 | guardarEncuestaSatisfaccion |
| **Recibir en backend** | backend/routes/reportes.js | 387-450 | POST /encuestas/guardar |

---

## 🎯 Conclusión

**El cliente da por terminado el reporte en 2 momentos**:

1. **Primer paso**: Click en "Confirmar Finalización" (cliente-panel.tsx, línea 1465)
   - Abre modal de confirmación

2. **Segundo paso**: Click en "Aceptar y continuar" (cliente-panel.tsx, línea 1615)
   - Navega a encuesta.tsx

**El cliente responde la encuesta en**:
- **app/encuesta.tsx** (líneas 200-300)
- Responde las 7 preguntas
- Click en "Enviar Encuesta"
- Se guarda en la BD y se marca como cerrado

---

**Última actualización**: 19/01/2026  
**Estado**: ✅ COMPLETAMENTE DOCUMENTADO
