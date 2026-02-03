# 📱 SISTEMA DE REPORTES DE MANTENIMIENTO - RESUMEN COMPLETO

**Tu compañero mejoró el código significativamente. Aquí está lo que hace la app:**

---

## 🎯 ¿QUÉ ES LA APP?

Es un **sistema completo de gestión de reportes de mantenimiento** tipo ticketing para empresas. Permite a clientes reportar problemas, técnicos resolverlos y admins gestionar todo el flujo.

**Stack tecnológico:**
- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Express.js (Node.js)
- **BD**: MySQL
- **Almacenamiento**: Cloudflare (para fotos/videos)

---

## 👥 LOS 3 ROLES PRINCIPALES

### 1️⃣ **CLIENTE** (`/cliente-panel.tsx`)
Personas que reportan problemas técnicos en sus empresas.

**Funcionalidades:**
- ✅ **Ver mis reportes** - Historial de tickets activos
- ✅ **Reportes por Confirmar** - Trabajos terminados que deben aceptar + responder encuestas
- ✅ **Ver Cotizaciones** - Presupuestos de trabajos
- ✅ **Seguimiento** - Estado en tiempo real
- ✅ **Contactar Soporte**

**Crear reportes con:**
- Descripción del equipo/problema
- Fotos y videos como evidencia
- Prioridad (baja, media, urgente)
- Modelo y serie del equipo

---

### 2️⃣ **TÉCNICO/EMPLEADO** (`/empleado-panel.tsx`)
Personal que repara equipos y resuelve problemas.

**Funcionalidades:**
- ✅ **Mis Reportes Asignados** - Tickets que le toca resolver
- ✅ **Enviar Análisis** (Fase 1) - Diagnóstico inicial + cotización
- ✅ **Realizar Trabajo** (Fase 2) - Detalles de reparación
- ✅ **Mi Inventario** - Herramientas asignadas
- ✅ **Mis Tareas** - Tareas administrativas

**Puede:**
- Cargar fotos/videos de evidencia
- Cotizar trabajos
- Completar detalles de reparación
- Marcar herramientas como devueltas o perdidas

---

### 3️⃣ **ADMINISTRADOR** (`/admin.tsx`)
Gestiona todo el sistema.

**Funcionalidades (por tabs):**
- **Inicio** - Dashboard con estadísticas
- **Reportes** - Ver todos, asignar a técnicos, cotizar
- **Encuestas** - Satisfacción de clientes
- **Tareas** - Crear tareas para técnicos
- **Inventario** - Gestionar herramientas
- **Usuarios** - CRUD de clientes/técnicos/admins

---

## 🔄 EL FLUJO COMPLETO DE UN REPORTE (6 FASES)

```
1. PENDIENTE (Cliente crea reporte)
   ↓
2. EN_PROCESO (Admin asigna técnico)
   ↓
3. COTIZADO (Técnico envía análisis + precio)
   ↓
4. FINALIZADO_POR_TECNICO (Admin verifica precio y aprueba)
   ↓
5. CERRADO_POR_CLIENTE (Cliente confirma trabajo)
   ↓
6. LISTO_PARA_ENCUESTA (Cliente responde encuesta)
   ↓
7. ENCUESTA_SATISFACCION (Reporte completado)
```

### 📊 Estados Visuales (para el cliente)

| Estado BD | Se Muestra Como | Color | Ícono |
|-----------|-----------------|-------|-------|
| `pendiente` | "En Espera" | 🟡 Naranja | ⏳ |
| `en_proceso` | "En Asignando" | 🔵 Cyan | 👤 |
| `cotizado` | "En Cotización" | 🩷 Rosa | 💰 |
| `finalizado_por_tecnico` | "En Espera" | 🟡 Naranja | ⏳ |
| `cerrado_por_cliente` | "En Ejecución" | 🟢 Verde | 🔧 |
| `listo_para_encuesta` | "En Ejecución" | 🟢 Verde | 🔧 |
| `encuesta_satisfaccion` | "Cerrado" | 🟣 Violeta | ✅ |

---

## 🎯 FLUJO VISUAL DESDE LA PERSPECTIVA DEL CLIENTE

### **Panel 1: "Ver mis reportes"** 
Muestra reportes ACTIVOS (pendiente, en_proceso, cotizado, finalizado_por_tecnico):
```
┌─────────────────────────────────────┐
│  EQUIPO: Aire Acondicionado         │
│  ESTADO: En Cotización 💰           │
│  PRIORIDAD: Urgente 🔴             │
│  FECHA: 2025-12-02                  │
│  [VER DETALLES] [VER FOTOS]         │
└─────────────────────────────────────┘
```

### **Panel 2: "Reportes por Confirmar"**
Muestra reportes FINALIZADOS esperando acción:
```
┌─────────────────────────────────────┐
│ REPORTE ID: 45                      │
│ Estado: Trabajo Completado 🟢       │
│ [CONFIRMAR] ← NUEVA ACCIÓN          │
│                                     │
│ (O si ya confirmó)                 │
│ Estado: Listo para Encuesta 🟢      │
│ [RESPONDER ENCUESTA] ← NUEVA ACCIÓN │
└─────────────────────────────────────┘
```

**La mejora de tu compañero:** Unificó todo en un solo modal. Antes había botón "Encuestas Pendientes" separado, ahora todo está en "Reportes por Confirmar".

### **Panel 3: "Seguimiento"**
Estado en progreso de reportes activos.

### **Panel 4: "Ver Cotizaciones"**
Filtro especial para reportes en estado `cotizado` o similar.

---

## 🔐 FLUJO DE AUTENTICACIÓN

**En `app/index.tsx` (Login):**
1. Usuario ingresa email + contraseña
2. Se envía a `/api/auth/login` en el backend
3. Backend verifica con bcrypt
4. Si es correcto, genera **JWT token**
5. Se guarda en AsyncStorage (almacenamiento local del celular)
6. Se redirige según el rol:
   - `admin` → `/admin`
   - `empleado` → `/empleado-panel`
   - `cliente` → `/cliente-panel`

**Base de datos:** Tabla `usuarios`
```sql
id, nombre, apellido, email, contraseña (hasheada), 
rol (cliente/empleado/admin), empresa_id, telefono, 
ciudad, estado (activo/inactivo)
```

---

## 💾 ESTRUCTURA DE BASE DE DATOS PRINCIPAL

### Tabla `reportes`
```sql
id, titulo, descripcion, estado, prioridad,
usuario_id (quien lo creó), empleado_id (técnico asignado),
empresa_id,
-- Fase 1: Análisis
analisis_general, precio_cotizacion,
-- Fase 2: Ejecución
revision, recomendaciones, reparacion, 
recomendaciones_adicionales, materiales_refacciones,
-- Timestamps
created_at, updated_at, cerrado_por_cliente_at, 
finalizado_por_tecnico_at
```

### Tabla `reportes_archivos`
```sql
id, reporte_id, cloudflare_url, cloudflare_key, 
tipo_archivo (foto/video), nombre_original
```

### Tabla `usuarios`
```sql
id, nombre, apellido, email, contraseña (hasheada),
rol (cliente/empleado/admin), empresa_id,
estado (activo/inactivo)
```

### Tabla `empresas`
```sql
id, nombre, ciudad, teléfono, email
```

### Tabla `tareas`
```sql
id, titulo, descripcion, usuario_id, estado, 
created_at, updated_at
```

### Tabla `inventario_herramientas` + `inventario_asignaciones`
```sql
herramientas: id, nombre, descripcion, estado
asignaciones: id, herramienta_id, empleado_id, fecha_asignacion
```

---

## 🎨 MAPEO DE ESTADOS (Archivo: `lib/estado-mapeo.ts`)

**La mejora de tu compañero:** Implementó un mapeo visual SIN tocar la BD.

```typescript
// En la BD se guarda como: "pendiente", "en_proceso", "cotizado", etc.
// En la UI se muestra como: "En Espera", "En Asignando", "En Cotización", etc.

estadoMapeo = {
  'pendiente': 'En Espera',
  'en_proceso': 'En Asignando',
  'cotizado': 'En Cotización',
  'finalizado_por_tecnico': 'En Espera',
  'cerrado_por_cliente': 'En Ejecución',
  'listo_para_encuesta': 'En Ejecución',
  'encuesta_satisfaccion': 'Cerrado',
}
```

**Beneficio:** Si quieren cambiar nombres visuales, solo editan este archivo. La BD no cambia.

---

## 🌐 BACKEND - ESTRUCTURA DE RUTAS API

**Archivo: `backend/server.js`**
```javascript
// Base URL: http://192.168.0.182:3001/api

app.use('/api/auth', require('./routes/auth'));        // Login/Register
app.use('/api/usuarios', require('./routes/usuarios')); // CRUD usuarios
app.use('/api/reportes', require('./routes/reportes')); // CRUD reportes
app.use('/api/tareas', require('./routes/tareas'));     // CRUD tareas
app.use('/api/inventario', require('./routes/inventario')); // Herramientas
app.use('/api/empresas', require('./routes/empresas')); // Empresas
```

### Endpoints principales:

**Autenticación** (`/api/auth`):
```
POST /login      - Iniciar sesión
POST /register   - Registrar usuario
GET  /me         - Obtener usuario actual
```

**Reportes** (`/api/reportes`):
```
GET  /           - Todos los reportes
GET  /empleado?email=xxx   - Reportes asignados a técnico
POST /           - Crear reporte
PUT  /:id        - Actualizar reporte
PUT  /:id/asignar - Asignar a técnico
GET  /:id/archivos - Obtener fotos/videos
```

**Usuarios** (`/api/usuarios`):
```
GET  /           - Todos los usuarios
POST /           - Crear usuario
PUT  /:id        - Actualizar usuario
DELETE /:id      - Eliminar usuario
```

---

## 📱 FLUJO EN LA APP - EJEMPLO PRÁCTICO

### **Escenario: Cliente reporta aire acondicionado roto**

1. **Cliente abre la app** → Login → Ve `/cliente-panel.tsx`
2. **Hace clic en crear reporte** (hay botón en encuesta.tsx)
   - Llena: Equipo, Modelo, Serie, Comentario, Prioridad
   - Sube fotos/videos
   - Presiona "Enviar"
   - Se guarda en BD con estado `pendiente`
3. **Admin ve el reporte** en `/admin.tsx` → Tab "Reportes"
   - Lo asigna a un técnico
   - Estado cambia a `en_proceso`
4. **Técnico recibe en `/empleado-panel.tsx`**
   - Ve en "Mis Reportes Asignados"
   - Hace clic → Modal de detalles
   - Botón "Enviar Análisis" (Fase 1)
   - Llena: Análisis, Precio cotización
   - Se guarda → Estado `cotizado`
5. **Admin ve en `/admin.tsx` → Tab "Reportes"**
   - Ve reportes cotizados
   - Revisa y aprueba
   - Estado cambia a `finalizado_por_tecnico`
6. **Técnico recibe confirmación**
   - Ve botón "Realizar Trabajo" (Fase 2)
   - Llena detalles de reparación realizada
   - Sube evidencia
   - Presiona "Completar"
   - Estado: `cerrado_por_cliente`
7. **Cliente ve en "Reportes por Confirmar"**
   - Botón "Confirmar" → Estado `listo_para_encuesta`
   - Botón "Responder Encuesta" → Va a `/encuesta.tsx`
8. **Encuesta de satisfacción** (7 preguntas):
   - ¿Trato del equipo?
   - ¿Equipo técnico resolvió bien?
   - ¿Personal administrativo?
   - ¿Rapidez?
   - ¿Costo/calidad?
   - ¿Lo recomendaría?
   - ¿Satisfecho con solución?
   - Al terminar → Estado `encuesta_satisfaccion` → TERMINADO ✅

---

## 🚀 TECNOLOGÍAS USADAS

### Frontend
- **React Native 19.1.0** - Framework mobile
- **Expo 54.0.27** - Tooling para React Native
- **TypeScript** - Tipado de JavaScript
- **Expo Router** - Navegación (similar a Next.js)
- **Tailwind CSS + NativeWind** - Estilos
- **AsyncStorage** - Almacenamiento local
- **Axios** - Requests HTTP (opcional, usan fetch)
- **Cloudflare** - Upload de imágenes/videos

### Backend
- **Express.js 4.18.2** - Framework web
- **MySQL2** - Driver de base de datos
- **JWT** - Autenticación
- **Bcrypt** - Hashing de contraseñas
- **Cors** - Permitir requests desde frontend
- **Multer** - Manejo de file uploads
- **Dotenv** - Variables de entorno

### Base de Datos
- **MySQL** - Base de datos relacional
- **Pool de conexiones** - Para manejo eficiente

---

## 📊 LO QUE TU COMPAÑERO MEJORÓ

Basándose en los commits en `WORKFLOW_SUMMARY.md`:

### ✅ **Problema 1: Error de Base de Datos**
- **Antes**: "Data truncated for column 'estado' at row 1"
- **Causa**: Faltaba `'listo_para_encuesta'` en el ENUM
- **Solución**: Agregó el estado en `CREATE_TABLES.sql` y ejecutó la migración

### ✅ **Problema 2: UI Confusa**
- **Antes**: Había botón "Encuestas Pendientes" separado en el menú
- **Problema**: Los usuarios se perdían con dos lugares donde manejar encuestas
- **Solución**: Unificó TODO en "Reportes por Confirmar"
  - Un solo modal con ambas acciones (Confirmar + Responder Encuesta)
  - Lógica más clara
  - Menos clicks

### ✅ **Problema 3: Lógica de Estados**
- **Antes**: Estados inconsistentes en la UI
- **Mejora**: Implementó `estado-mapeo.ts`
  - Estados BD vs Estados Visuales separados
  - Fácil de personalizar colores/nombres sin tocar la BD
  - Consistent UI en toda la app

---

## 🎯 PUNTOS CLAVE PARA ENTENDER

1. **JWT Token**: Se guarda en el celular, se envía en cada request al backend
2. **Roles = Control de acceso**: El backend verifica `req.user.rol` en cada ruta
3. **Estados = Máquina de estados**: Un reporte solo puede ir de un estado al siguiente
4. **Cloudflare = Almacenamiento**: Las fotos/videos no se guardan en la BD, se guardan en Cloudflare
5. **Encuesta = Cierre obligatorio**: El cliente DEBE responder antes de cerrar
6. **AsyncStorage = Cache local**: Guarda usuario + token para no pedir login cada vez

---

## 📚 ARCHIVOS MÁS IMPORTANTES

```
app/
  ├── index.tsx              ← Login (punto de entrada)
  ├── cliente-panel.tsx      ← Panel principal del cliente (3121 líneas!)
  ├── empleado-panel.tsx     ← Panel del técnico (2851 líneas)
  ├── admin.tsx              ← Panel del admin (6461 líneas)
  └── encuesta.tsx           ← Formulario de encuesta

lib/
  ├── api-backend.ts         ← Funciones para llamar API
  ├── estado-mapeo.ts        ← Mapeo de estados visuales
  ├── reportes.ts            ← Lógica de reportes
  ├── empresas.ts            ← Lógica de empresas
  └── cloudflare.ts          ← Upload de archivos

backend/
  ├── server.js              ← Servidor Express principal
  ├── routes/
  │   ├── auth.js            ← Login/Register
  │   ├── reportes.js        ← CRUD reportes
  │   ├── usuarios.js        ← CRUD usuarios
  │   ├── tareas.js          ← CRUD tareas
  │   ├── inventario.js      ← Herramientas
  │   └── empresas.js        ← Empresas
  ├── config/
  │   └── database.js        ← Pool de MySQL
  └── middleware/
      └── auth.js            ← Verificación JWT

package.json                 ← Dependencias y scripts
```

---

## 🎮 CÓMO USARLA EN DESARROLLO

1. **Backend:**
   ```bash
   cd backend
   npm install
   node server.js
   # Corre en http://192.168.0.182:3001
   ```

2. **Frontend:**
   ```bash
   npm install
   npm start
   # Abre Expo en el celular
   ```

3. **Base de Datos:**
   - Crear BD MySQL
   - Ejecutar `backend/CREATE_TABLES.sql`
   - Configurar credenciales en `backend/config/database.js`

---

## 🏆 CONCLUSIÓN

Tu compañero creó un **sistema robusto y escalable** de tickets de mantenimiento. Las mejoras recientes lo hacen más:
- ✅ **Confiable** (BD sin errores)
- ✅ **Intuitivo** (UI simplificada)
- ✅ **Flexible** (mapeo de estados separado de BD)
- ✅ **Listo para producción**

Los 3 roles tienen flujos claros y separados. La máquina de estados es predecible. El frontend y backend están bien desacoplados.

**Para agregarle funcionalidades**, solo necesitas:
1. Crear nuevas rutas en `backend/routes/`
2. Crear funciones en `lib/` para llamar esas rutas
3. Usar las funciones en los componentes (cliente-panel, admin, etc.)

¡Buen trabajo del compañero! 🚀
