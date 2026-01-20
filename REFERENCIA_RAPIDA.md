# ⚡ REFERENCIA RÁPIDA

## 🎯 LO QUE CREAMOS

| Componente | Archivo | Líneas | Función |
|-----------|---------|--------|---------|
| **Servidor** | server.js | 133 | Express app + rutas |
| **Autenticación** | routes/auth.js | 108 | Login, registro, perfil |
| **Usuarios** | routes/usuarios.js | 95 | CRUD usuarios |
| **Reportes** | routes/reportes.js | 72 | CRUD reportes |
| **Tareas** | routes/tareas.js | 82 | CRUD tareas |
| **Inventario** | routes/inventario.js | 98 | Herramientas + asignaciones |
| **Migración** | migrate.js | 165 | Supabase → MySQL |
| **Setup** | setup.js | 62 | Crear BD y tablas |
| **JWT + Roles** | middleware/auth.js | 35 | Autorización |
| **Pool MySQL** | config/database.js | 18 | Conexión BD |
| **API Frontend** | lib/api.ts | 198 | Wrapper fetch |
| **Schema BD** | CREATE_TABLES.sql | 160 | 8 tablas |

---

## 📍 UBICACIÓN DE COSAS

**¿Dónde está el servidor?**  
→ `backend/server.js` (corriendo en puerto 3001)

**¿Dónde están los endpoints?**  
→ `backend/routes/` (auth, usuarios, reportes, tareas, inventario)

**¿Dónde está la BD?**  
→ MySQL local en XAMPP (base de datos: si_mant2)

**¿Dónde está la seguridad?**  
→ `backend/middleware/auth.js` (JWT + roles)

**¿Dónde está el API client?**  
→ `lib/api.ts` (para llamadas desde frontend)

**¿Dónde está la documentación?**  
→ `COMIENZA_AQUI.md` (punto de entrada)

---

## 🚀 COMANDOS RÁPIDOS

**Iniciar backend:**
```bash
cd backend
npm start              # Producción
npm run dev           # Desarrollo (con auto-reload)
```

**Setup BD:**
```bash
cd backend
npm run setup         # Crear BD + tablas + usuario admin
```

**Migrar datos:**
```bash
cd backend
npm run migrate       # Traer datos de Supabase a MySQL
```

**Probar endpoints:**
```bash
cd backend
node test-api.js      # Ejecutar tests
```

---

## 🔑 USUARIO DE PRUEBA

| Campo | Valor |
|-------|-------|
| Email | admin@test.com |
| Contraseña | admin123 |
| Rol | admin |
| Estado | activo |

**Cómo login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","contraseña":"admin123"}'
```

---

## 📡 ENDPOINTS PRINCIPALES

### Auth
```
POST   /api/auth/register    # Registrar usuario
POST   /api/auth/login       # Login (obtiene token)
GET    /api/auth/me          # Perfil actual
```

### Usuarios
```
GET    /api/usuarios         # Listar (solo admin)
GET    /api/usuarios/:id     # Obtener usuario
PUT    /api/usuarios/:id     # Actualizar
PUT    /api/usuarios/:id/role    # Cambiar rol
DELETE /api/usuarios/:id     # Desactivar
```

### Reportes
```
GET    /api/reportes         # Listar reportes
POST   /api/reportes         # Crear reporte
PUT    /api/reportes/:id     # Actualizar
DELETE /api/reportes/:id     # Eliminar
```

### Tareas
```
GET    /api/tareas           # Mis tareas
GET    /api/tareas/empleado/:id  # Tareas de empleado
POST   /api/tareas           # Crear tarea
PUT    /api/tareas/:id/status    # Cambiar estado
DELETE /api/tareas/:id       # Eliminar
```

### Inventario
```
GET    /api/inventario/herramientas      # Listar
POST   /api/inventario/herramientas      # Crear
GET    /api/inventario/asignaciones      # Ver asignaciones
POST   /api/inventario/asignar           # Asignar
DELETE /api/inventario/asignaciones/:id  # Desasignar
```

---

## 📚 DOCUMENTOS

| Documento | Lee si... | Líneas |
|-----------|-----------|--------|
| COMIENZA_AQUI.md | Quieres empezar | 100 |
| INTEGRACION_PASO_A_PASO.md | Integras frontend | 300 |
| BACKEND_COMPLETADO.md | Quieres resumen | 400 |
| MIGRACION_RESUMEN_FINAL.md | Vas al VPS | 350 |
| ARQUITECTURA.md | Entiendes el sistema | 350 |
| BACKEND_STATUS.md | Quieres estado | 250 |

---

## 🔄 FLUJO LOGIN

```
1. POST /api/auth/login
   {email, contraseña}
   ↓
2. Backend:
   - Busca usuario
   - bcrypt.compare()
   - Genera JWT
   ↓
3. Response:
   {success, token, user}
   ↓
4. Frontend:
   - Guarda token
   - Guarda usuario
   - Redirige según rol
   ↓
5. Próximas llamadas:
   Authorization: Bearer <token>
```

---

## ❌ TROUBLESHOOTING RÁPIDO

**Backend no inicia**
```
→ Verificar: cd backend && npm install
→ Verificar: MySQL corriendo
```

**Error 401 Unauthorized**
```
→ Token expiró
→ Hacer login de nuevo
```

**Error de conexión a MySQL**
```
→ Verificar XAMPP está corriendo
→ Verificar .env con credenciales correctas
```

**CORS error**
```
→ Backend ya tiene CORS habilitado
→ Verificar URL en lib/api.ts es correcta
```

**Base de datos no existe**
```
→ Ejecutar: npm run setup
```

---

## 🎯 PASOS PARA HOY

1. ✅ **Backend creado** (ya hecho)
2. **Lee:** COMIENZA_AQUI.md (5 min)
3. **Lee:** INTEGRACION_PASO_A_PASO.md (15 min)
4. **Actualiza:** lib/auth.ts (10 min)
5. **Actualiza:** lib/reportes.ts (5 min)
6. **Actualiza:** lib/tareas.ts (5 min)
7. **Actualiza:** lib/inventario.ts (5 min)
8. **Prueba:** Login con admin@test.com (2 min)

**Total: ~45 minutos para integración completa**

---

## 💡 TIPS

**Desarrollo:**
- Usa `npm run dev` para auto-reload
- Revisa logs en consola para DEBUG
- Usa Postman para probar endpoints

**Seguridad:**
- Cambiar JWT_SECRET en .env
- Usar HTTPS en producción
- No commitear .env al git

**Performance:**
- Los índices en BD están optimizados
- Pool de conexiones configurado
- Middleware de autorización es rápido

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [ ] Leer COMIENZA_AQUI.md
- [ ] Leer INTEGRACION_PASO_A_PASO.md
- [ ] Actualizar lib/auth.ts
- [ ] Actualizar lib/reportes.ts
- [ ] Actualizar lib/tareas.ts
- [ ] Actualizar lib/inventario.ts
- [ ] Probar login
- [ ] Probar crear reporte
- [ ] Probar listar usuarios
- [ ] Probar asignar herramienta
- [ ] Backend ✅ Frontend ✅ = Listo para VPS

---

## 🌐 URL IMPORTANTE

**Local (desarrollo):**
```
http://localhost:3001/api
```

**VPS (después):**
```
https://tu-dominio.com/api
```

Cambiar en: `lib/api.ts` línea con `API_BASE`

---

## 📞 SOPORTE RÁPIDO

**El servidor no está corriendo:**
```bash
cd backend
npm start
# Deberías ver: "Servidor Express corriendo en puerto 3001"
```

**¿Dónde reportar el token?**
```
Authorization: Bearer <token_aqui>
```

**¿Cómo sé si funciona?**
```bash
curl -X GET http://localhost:3001/health
# Respuesta: {"status":"Server is running"}
```

**¿Dónde están los logs?**
```
En la consola donde corriste npm start
Busca logs que empiezan con [API]
```

---

## 📋 VARIABLES DE ENTORNO

Archivo: `backend/.env`

```
DB_HOST=localhost        # Host MySQL
DB_USER=root             # Usuario MySQL
DB_PASSWORD=             # Contraseña MySQL (vacía si no tiene)
DB_NAME=si_mant2         # Nombre base datos
DB_PORT=3306             # Puerto MySQL
JWT_SECRET=tu_clave      # Clave JWT (CAMBIAR EN PROD)
JWT_EXPIRES_IN=24h       # Expiración token
PORT=3001                # Puerto servidor
NODE_ENV=development     # Entorno
```

---

## 🚀 PRÓXIMO HITO

✅ Backend funcional → Lee INTEGRACION_PASO_A_PASO.md → Frontend integrado

---

**Última actualización:** 7 enero 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Producción-ready  
