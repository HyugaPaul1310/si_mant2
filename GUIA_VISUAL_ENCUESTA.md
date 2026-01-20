# 📍 GUÍA VISUAL - ¿DÓNDE OCURRE CADA COSA?

## En Resumen Rápido

### ❓ **¿DÓNDE HACE CLICK EL CLIENTE PARA DAR POR TERMINADO?**

```
PASO 1: cliente-panel.tsx (línea 1465)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Pantalla: Panel del Cliente
🔍 Ubicación: Modal de Cotización Detalle
🟢 Botón: "Confirmar Finalización" (verde)

Condición: solo aparece cuando
   cotizacionSeleccionada.estado === 'finalizado_por_tecnico'

PASO 2: cliente-panel.tsx (línea 1615)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Pantalla: Modal Confirmar Finalización
🔍 Ubicación: Footer del modal
🟢 Botón: "Aceptar y continuar" (verde)

Acción: router.push('/encuesta', {...params})
  → ABRE LA ENCUESTA
```

---

### ❓ **¿DÓNDE RESPONDE LAS PREGUNTAS?**

```
UBICACIÓN: encuesta.tsx (líneas 200-300)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Pantalla: Encuesta de Satisfacción
📋 7 Preguntas en vista scrollable

1. Trato del equipo
2. Equipo técnico
3. Personal administrativo
4. Rapidez
5. Costo vs Calidad
6. ¿Recomendaría?
7. Satisfacción general

🔘 Opciones clickeables para cada pregunta
💾 Se guardan en estado: respuestas = { pregunta: opción }
```

---

### ❓ **¿DÓNDE CLICKEA "ENVIAR ENCUESTA"?**

```
UBICACIÓN: encuesta.tsx (línea ~400)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Pantalla: Encuesta de Satisfacción
🔍 Ubicación: Bottom del ScrollView
🟢 Botón: "Enviar Encuesta" 

Validación: Todas las preguntas deben estar respondidas
Acción: handleGuardarEncuesta()
  ├─ Valida respuestas ✓
  ├─ Envía a backend ✓
  ├─ Marca como cerrado ✓
  └─ Vuelve a cliente-panel ✓
```

---

## 📍 Ubicación Detallada en Archivos

### 1. cliente-panel.tsx

#### Línea 180-190: Filtrar reportes finalizados
```typescript
const cotizacionesFiltradas = (cotizaciones || []).filter(
  c => c.precio_cotizacion && 
    c.estado === 'finalizado_por_tecnico'  ← ESTADO CLAVE
);
```

#### Línea 1407-1480: Botón "Confirmar Finalización"
```tsx
// Dentro de modal showCotizacionesModal
// Cuando cotizacionSeleccionada.estado === 'finalizado_por_tecnico'

<TouchableOpacity
  style={[styles.actionButton, { backgroundColor: '#10b981' }]}
  onPress={async () => {
    setShowCotizacionDetalleModal(false);
    setShowConfirmarFinalizacionModal(true);  ← ABRE MODAL
  }}
>
  <Text>Confirmar Finalización</Text>
</TouchableOpacity>
```

#### Línea 1525-1600: Modal Confirmar Finalización
```tsx
{showConfirmarFinalizacionModal && reporteAConfirmar && (
  <View>
    {/* Muestra info */}
    <Text>Técnico: {reporteAConfirmar.empleado_asignado_nombre}</Text>
    <Text>Equipo: {reporteAConfirmar.equipo_descripcion}</Text>
    
    {/* Botones */}
    <TouchableOpacity onPress={() => {...}}>
      Cancelar
    </TouchableOpacity>
    
    <TouchableOpacity onPress={() => {
      router.push({
        pathname: '/encuesta',
        params: {
          reporteId: reporteAConfirmar.id,
          clienteEmail: usuario?.email,
          ...
        }
      });
    }}>
      Aceptar y continuar  ← NAVEGA A ENCUESTA
    </TouchableOpacity>
  </View>
)}
```

---

### 2. encuesta.tsx

#### Línea 1-50: Header y Setup
```typescript
export default function EncuestaPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [respuestas, setRespuestas] = useState({});
  
  // Recibe parámetros de cliente-panel
}
```

#### Línea 22-48: Definición de 7 Preguntas
```typescript
const PREGUNTAS = [
  {
    id: 1,
    texto: 'El trato que recibió por parte del equipo...',
    key: 'trato_equipo'
  },
  {
    id: 2,
    texto: 'El equipo técnico de la empresa...',
    key: 'equipo_tecnico'
  },
  // ... 5 preguntas más
];
```

#### Línea 79: Validación
```typescript
const todasLasRespuestasLlenas = PREGUNTAS.every(
  p => respuestas[p.key]
);
// Retorna true si todas tienen respuesta
```

#### Línea 80-180: Función handleGuardarEncuesta
```typescript
const handleGuardarEncuesta = async () => {
  // 1. Validar
  if (!todasLasRespuestasLlenas) {
    Alert.alert('Validación requerida', 
      'Por favor responde todas las preguntas');
    return;
  }

  setGuardando(true);
  try {
    // 2. Preparar datos
    const encuestaData = {
      reporte_id: reporteId,
      cliente_email: clienteEmail,
      trato_equipo: respuestas['trato_equipo'],
      equipo_tecnico: respuestas['equipo_tecnico'],
      personal_administrativo: respuestas['personal_administrativo'],
      rapidez: respuestas['rapidez'],
      costo_calidad: respuestas['costo_calidad'],
      recomendacion: respuestas['recomendacion'],
      satisfaccion: respuestas['satisfaccion'],
    };

    // 3. Guardar en BD
    const resultadoEncuesta = 
      await guardarEncuestaSatisfaccion(encuestaData);

    if (!resultadoEncuesta.success) {
      throw new Error(resultadoEncuesta.error);
    }

    // 4. Cambiar estado
    const resultadoEstado = 
      await actualizarEstadoCerradoPorCliente(reporteId);

    if (!resultadoEstado.success) {
      throw new Error(resultadoEstado.error);
    }

    console.log('Reporte cerrado por cliente - CIERRE DEFINITIVO');

    // 5. Navegar de vuelta
    setTimeout(() => {
      router.push('/cliente-panel?closeModals=true');
    }, 1000);
    
  } catch (error) {
    console.error('Error al guardar encuesta:', error);
  } finally {
    setGuardando(false);
  }
};
```

#### Línea 200-300: Renderizado de Preguntas
```tsx
<ScrollView>
  {PREGUNTAS.map((pregunta) => (
    <View key={pregunta.id}>
      <Text>{pregunta.texto}</Text>
      
      {/* Opciones clickeables */}
      <View>
        {OPCIONES.map((opcion) => (
          <TouchableOpacity
            onPress={() => setRespuestas({
              ...respuestas,
              [pregunta.key]: opcion  ← GUARDA RESPUESTA
            })}
            style={[
              styles.opcion,
              respuestas[pregunta.key] === opcion && 
                styles.opcionSeleccionada
            ]}
          >
            <Text>{opcion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ))}
  
  {/* Botón Enviar */}
  <TouchableOpacity
    onPress={handleGuardarEncuesta}
    disabled={guardando || !todasLasRespuestasLlenas}
  >
    <Text>Enviar Encuesta</Text>
  </TouchableOpacity>
</ScrollView>
```

---

## 🔗 Conexión con Backend

```
encuesta.tsx
  handleGuardarEncuesta()
    ↓
  guardarEncuestaSatisfaccion(encuestaData)
    ↓ (en lib/reportes.ts, línea 824-857)
  apiCall('/reportes/encuestas/guardar', 'POST', encuesta)
    ↓ (en lib/api-backend.ts)
  fetch('http://localhost:3001/api/reportes/encuestas/guardar')
    ↓
  backend/routes/reportes.js (línea 387-450)
    ↓
  INSERT INTO encuestas_satisfaccion (...)
    ↓
  MySQL tabla
```

---

## 🎯 Checklist Visual

```
✅ Cliente ve reporte en "finalizado_por_tecnico"
✅ Cliente ve botón "Confirmar Finalización" (VERDE)
✅ Click en botón → Abre modal
✅ Modal muestra info del técnico
✅ Click en "Aceptar y continuar"
✅ Se abre encuesta.tsx
✅ 7 preguntas visibles y clickeables
✅ Cliente responde cada pregunta
✅ Todas las preguntas deben estar respondidas
✅ Botón "Enviar Encuesta" habilitado cuando completada
✅ Click en "Enviar"
✅ Se guarda en MySQL tabla encuestas_satisfaccion
✅ Reporte marcado como "cerrado_por_cliente"
✅ Vuelve a cliente-panel automáticamente
✅ Modal se cierra
✅ FLUJO COMPLETADO ✨
```

---

## 📱 Vista Física del Cliente

```
┌─────────────────────────────────┐
│ CLIENTE-PANEL                   │
│                                 │
│ Mis Reportes                    │
│ ┌───────────────────────┐       │
│ │ ID: 6                 │       │
│ │ Estado: Finalizado    │◄─── Se ve aquí
│ │ Técnico: Carlos       │       │
│ │ [Ver Cotización]      │       │
│ └───────────────────────┘       │
└─────────────────────────────────┘
           ↓ (Click)
┌─────────────────────────────────┐
│ Modal Cotización Detalle        │
│                                 │
│ Cotización #6                   │
│ Precio: $500                    │
│ [Confirmar]  [Rechazar]         │◄─── Botones
└─────────────────────────────────┘
           ↓ (Click)
┌─────────────────────────────────┐
│ Modal Confirmar Finalización    │
│                                 │
│ ¡Trabajo finalizado!            │
│ Técnico: Carlos López           │
│ Equipo: Aire Acondicionado      │
│                                 │
│ [Cancelar] [Aceptar y continuar]│◄─── Botón clave
└─────────────────────────────────┘
           ↓ (Click)
┌─────────────────────────────────┐
│ ENCUESTA.TSX                    │
│                                 │
│ Encuesta de Satisfacción        │
│                                 │
│ 1. El trato del equipo fue:     │
│    [Excelente] [Muy Bueno]...   │
│                                 │
│ 2. El equipo técnico...         │
│    [Excelente] [Muy Bueno]...   │
│                                 │
│ ... (7 preguntas total)         │
│                                 │
│              [Enviar Encuesta]  │◄─── Botón final
└─────────────────────────────────┘
           ↓ (Click)
┌─────────────────────────────────┐
│ ✅ ENCUESTA ENVIADA             │
│                                 │
│ Gracias por tu respuesta        │
│ Volviendo al panel...           │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│ CLIENTE-PANEL                   │
│ (Con modales cerrados)          │
│ REPORTE CERRADO ✓               │
└─────────────────────────────────┘
```

---

**Última actualización**: 19/01/2026  
**Formato**: Visual + Código
**Completitud**: 100%
