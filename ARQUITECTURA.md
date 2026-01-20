# 🏗️ ARQUITECTURA DEL SISTEMA

## DIAGRAMA DE LA APLICACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE (Expo/React Native)                 │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Login    │  │ Admin    │  │ Reportes │  │ Tareas   │       │
│  │ Panel    │  │ Panel    │  │ Panel    │  │ Panel    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│              lib/api.ts (wrapper de fetch)                     │
│              ↓ HTTP con JWT en header                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ POST /api/auth/login
                              ↓ GET  /api/usuarios
                              ↓ POST /api/reportes
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Backend Express (Node.js) - Puerto 3001             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ server.js (Express App)                                 │   │
│  │                                                         │   │
│  │ Middleware:                                             │   │
│  │  - CORS enabled                                         │   │
│  │  - Body parser (JSON)                                   │   │
│  │  - Error handler                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Rutas API (23 endpoints)                                │   │
│  │                                                         │   │
│  │ /api/auth        (login, register, me)                  │   │
│  │ /api/usuarios    (CRUD usuarios)                        │   │
│  │ /api/reportes    (CRUD reportes)                        │   │
│  │ /api/tareas      (CRUD tareas)                          │   │
│  │ /api/inventario  (CRUD herramientas + asignaciones)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│                   middleware/auth.js                           │
│            (Verifica JWT, valida roles)                        │
│                              ↓                                  │
│              config/database.js (Pool MySQL)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                   MySQL Database (localhost:3306)
                              ↓
                    ┌───────────────────┐
                    │ usuarios          │
                    │ empresas          │
                    │ reportes          │
                    │ tareas            │
                    │ herramientas      │
                    │ asignaciones      │
                    │ permisos          │
                    │ cotizaciones      │
                    │ encuestas         │
                    └───────────────────┘
```

---

## FLUJO DE AUTENTICACIÓN

```
1. REGISTRO
   ┌─────────┐
   │ Usuario │ → POST /api/auth/register
   │  nuevo  │   {nombre, email, contraseña, ...}
   └─────────┘
        ↓
   ┌──────────────────────────┐
   │ Backend Express          │
   │ 1. Validar datos         │
   │ 2. Hashear contraseña    │
   │    (bcrypt + 10 rondas)  │
   │ 3. Guardar en BD         │
   └──────────────────────────┘
        ↓
   ┌──────────────────────────┐
   │ MySQL                    │
   │ INSERT INTO usuarios ... │
   └──────────────────────────┘
        ↓
   ✅ Usuario registrado

2. LOGIN
   ┌─────────┐
   │ Usuario │ → POST /api/auth/login
   │ existente│   {email, contraseña}
   └─────────┘
        ↓
   ┌──────────────────────────────┐
   │ Backend Express              │
   │ 1. Buscar usuario por email  │
   │ 2. Comparar contraseña       │
   │    (bcrypt.compare())        │
   │ 3. Generar JWT token         │
   │    (válido 24h)              │
   │ 4. Retornar token + user     │
   └──────────────────────────────┘
        ↓
   ┌──────────────────────────────┐
   │ Frontend (AsyncStorage)      │
   │ 1. Guardar token             │
   │ 2. Guardar usuario           │
   │ 3. Redirigir según rol       │
   └──────────────────────────────┘
        ↓
   ✅ Sesión iniciada

3. LLAMADAS PROTEGIDAS
   ┌─────────┐
   │ Frontend│ → GET /api/usuarios
   │ (App)   │   Authorization: Bearer eyJhbGc...
   └─────────┘
        ↓
   ┌──────────────────────────────┐
   │ Backend Express              │
   │ 1. Verificar Authorization   │
   │    header                    │
   │ 2. Decodificar JWT           │
   │ 3. Validar no expiró         │
   │ 4. Verificar rol del usuario │
   │ 5. Si todo OK: retornar datos│
   │ 6. Si no: error 401/403      │
   └──────────────────────────────┘
        ↓
   ┌──────────────────────────────┐
   │ MySQL                        │
   │ SELECT * FROM usuarios ...   │
   └──────────────────────────────┘
        ↓
   ✅ Datos retornados
```

---

## ESTRUCTURA DE CARPETAS

```
si_mant2/
│
├── app/                        # Pantallas de Expo
│   ├── index.tsx              # Login
│   ├── admin.tsx              # Panel admin
│   ├── empleado-panel.tsx     # Panel empleados
│   └── cliente-panel.tsx      # Panel clientes
│
├── lib/                        # Funciones de negocio
│   ├── api.ts                 # NEW: Wrapper API ✨
│   ├── auth.ts                # Autenticación (ACTUALIZAR)
│   ├── reportes.ts            # Reportes (ACTUALIZAR)
│   ├── tareas.ts              # Tareas (ACTUALIZAR)
│   └── inventario.ts          # Inventario (ACTUALIZAR)
│
├── backend/                    # NEW: Servidor Express ✨
│   ├── server.js              # Servidor principal
│   ├── package.json           # Dependencias
│   ├── .env                   # Configuración
│   ├── setup.js               # Setup de BD
│   ├── migrate.js             # Migración Supabase
│   ├── CREATE_TABLES.sql      # Schema
│   │
│   ├── config/
│   │   └── database.js        # Pool MySQL
│   │
│   ├── middleware/
│   │   └── auth.js            # JWT + roles
│   │
│   └── routes/
│       ├── auth.js            # /api/auth
│       ├── usuarios.js        # /api/usuarios
│       ├── reportes.js        # /api/reportes
│       ├── tareas.js          # /api/tareas
│       └── inventario.js      # /api/inventario
│
├── BACKEND_COMPLETADO.md      # NEW: Este archivo ✨
├── INTEGRACION_PASO_A_PASO.md # NEW: Guía integración ✨
├── MIGRACION_RESUMEN_FINAL.md # NEW: Resumen migración ✨
└── ...
```

---

## STACK TECNOLÓGICO

```
FRONTEND
├── React Native
├── Expo (con expo-router)
├── TypeScript
├── AsyncStorage (para tokens)
└── Fetch API (con lib/api.ts)

BACKEND
├── Node.js
├── Express.js
├── JavaScript/TypeScript
├── bcrypt (hashing)
├── jsonwebtoken (JWT)
└── mysql2/promise (conexión BD)

DATABASE
├── MySQL 8.0+
├── UTF-8 encoding
├── Índices optimizados
└── Foreign keys

INFRAESTRUCTURA (Local)
├── XAMPP (MySQL)
├── Node.js
└── localhost:3001 (backend)
```

---

## FLUJO DE DATOS - EJEMPLO: CREAR REPORTE

```
Frontend (React Native)        Backend (Express)           MySQL
────────────────────────────  ─────────────────────  ─────────────────

Usuario hace click
"Crear Reporte"
        ↓
Form con datos
        ↓
Valida localmente
        ↓
POST /api/reportes          →  routes/reportes.js
{                               │
  titulo: "Bug crítico",        ├─ Middleware auth.js
  descripcion: "...",           │  Verifica JWT
  estado: "pendiente",          │
  prioridad: "alta"             ├─ Valida datos
}                               │
                                ├─ Query a MySQL:
                                │  INSERT INTO reportes
                                │  (titulo, descripcion,
                                │   estado, prioridad,
                                │   usuario_id, empresa_id,
                                │   created_at)
                                │  VALUES (...)
                                │                    →  INSERT
                                │                        │
                                │                        ↓
                                │                   Reporte guardado
                                │                   ID: 42
                                │
                           ←  JSON Response
                          {
                            success: true,
                            reporteId: 42
                          }
        ↓
Mostrar toast "¡Creado!"
        ↓
Refrescar lista
        ↓
GET /api/reportes           →  routes/reportes.js
                                │
                                ├─ Middleware auth.js
                                │  Verifica JWT
                                │
                                ├─ Query a MySQL:
                                │  SELECT * FROM reportes
                                │  WHERE usuario_id = X
                                │  OR empresa_id = Y
                                │  ORDER BY created_at DESC
                                │                    →  SELECT
                                │                        │
                                │                        ↓
                                │                   Retorna 10 reportes
                                │                   (incluyendo el nuevo)
                           ←  JSON Array
                          [
                            {id: 42, titulo: "Bug crítico", ...},
                            {id: 41, titulo: "...", ...},
                            ...
                          ]
        ↓
Mostrar en pantalla
```

---

## MATRIZ DE PERMISOS

```
                   admin   empleado   cliente
GET /api/usuarios   ✅       ❌        ❌
PUT /api/usuarios/:id/role
                    ✅       ❌        ❌
POST /api/reportes  ✅       ✅        ✅
GET  /api/reportes  ✅       ✅        ✅
PUT  /api/reportes/:id
                    ✅       ✅        ✅
DELETE /api/reportes
                    ✅       ❌        ❌
POST /api/tareas    ✅       ✅        ❌
GET  /api/tareas    ✅       ✅        ❌
POST /api/inventario/asignar
                    ✅       ❌        ❌
```

---

## FLUJO DE CONEXIÓN A VPS

```
Hoy (Desarrollo Local)
────────────────────────────
App (localhost:8081)
        ↓
Express (localhost:3001)
        ↓
MySQL (localhost:3306)

Cuando esté en VPS
────────────────────────────
App (en dispositivo)
        ↓ HTTPS
tu-dominio.com/api
        ↓ Nginx (proxy reverso)
Express (localhost:3001)
        ↓
MySQL (localhost:3306)

+ PM2 (mantiene Express corriendo)
+ Let's Encrypt (certificado HTTPS)
+ Firewall configurado
```

---

## RESUMEN FINAL

✅ **Backend completamente funcional**
- 23 endpoints implementados
- Autenticación segura con JWT
- Contraseñas hasheadas con bcrypt
- Base de datos MySQL con 8 tablas

✅ **Listo para integración**
- lib/api.ts creado
- Documentación completa
- Scripts de setup y migración
- Tests de la API

✅ **Preparado para VPS**
- Estructura modular
- Variables de entorno configurables
- PM2 ready
- HTTPS compatible

---

**Siguiente paso:** [INTEGRACION_PASO_A_PASO.md](INTEGRACION_PASO_A_PASO.md)

Para comenzar la integración del frontend, sigue esa guía paso a paso.
