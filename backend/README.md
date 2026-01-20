# BACKEND EXPRESS - GUÍA DE CONFIGURACIÓN

## 1. Instalar dependencias
```bash
cd backend
npm install
```

## 2. Configurar variables de entorno
- Copia `.env.example` a `.env`
- Actualiza los valores con tus credenciales:
  - `DB_HOST`: localhost (para XAMPP local)
  - `DB_USER`: root
  - `DB_PASSWORD`: (vacío si no tiene contraseña)
  - `DB_NAME`: si_mant2
  - `JWT_SECRET`: Cambia a una clave larga y segura

## 3. Crear base de datos MySQL
En phpMyAdmin o línea de comandos:
```sql
CREATE DATABASE si_mant2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 4. Ejecutar schema SQL
Primero necesitas crear las tablas en MySQL. Copia el contenido de `CREATE_ENCUESTAS_TABLE.sql` 
y adapta para crear todas las tablas necesarias.

Ver al final de este archivo el SQL completo.

## 5. Migrar datos de Supabase
```bash
npm run migrate
```

## 6. Iniciar el servidor
**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

---

## ENDPOINTS DISPONIBLES

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil actual

### Usuarios
- `GET /api/usuarios` - Listar todos (solo admin)
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `PUT /api/usuarios/:id/role` - Cambiar rol (solo admin)
- `PUT /api/usuarios/:id/status` - Cambiar estado (solo admin)
- `DELETE /api/usuarios/:id` - Desactivar usuario (solo admin)

### Reportes
- `GET /api/reportes` - Listar reportes
- `POST /api/reportes` - Crear reporte
- `PUT /api/reportes/:id` - Actualizar reporte
- `DELETE /api/reportes/:id` - Eliminar reporte (solo admin)

### Tareas
- `GET /api/tareas` - Listar mis tareas
- `GET /api/tareas/empleado/:id` - Obtener tareas de empleado
- `POST /api/tareas` - Crear tarea
- `PUT /api/tareas/:id/status` - Cambiar estado
- `DELETE /api/tareas/:id` - Eliminar tarea

### Inventario
- `GET /api/inventario/herramientas` - Listar herramientas
- `POST /api/inventario/herramientas` - Crear herramienta (solo admin)
- `GET /api/inventario/asignaciones` - Listar asignaciones
- `POST /api/inventario/asignar` - Asignar herramienta (solo admin)
- `DELETE /api/inventario/asignaciones/:id` - Desasignar herramienta (solo admin)

---

## ESQUEMA SQL NECESARIO

```sql
-- Usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  ciudad VARCHAR(100),
  empresa VARCHAR(100),
  empresa_id INT,
  rol ENUM('cliente', 'empleado', 'admin') DEFAULT 'cliente',
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
);

-- Empresas
CREATE TABLE empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(255),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reportes
CREATE TABLE reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado ENUM('pendiente', 'en_progreso', 'completado') DEFAULT 'pendiente',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  usuario_id INT,
  empresa_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_estado (estado),
  INDEX idx_usuario (usuario_id)
);

-- Tareas
CREATE TABLE tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  usuario_id INT,
  creada_por INT,
  estado ENUM('pendiente', 'en_progreso', 'completada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (creada_por) REFERENCES usuarios(id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_estado (estado)
);

-- Herramientas
CREATE TABLE inventario_herramientas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  estado ENUM('disponible', 'en_uso', 'mantenimiento') DEFAULT 'disponible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado)
);

-- Asignaciones de herramientas
CREATE TABLE inventario_asignaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  herramienta_id INT NOT NULL,
  estado ENUM('asignada', 'devuelta') DEFAULT 'asignada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (herramienta_id) REFERENCES inventario_herramientas(id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_herramienta (herramienta_id)
);

-- Permisos
CREATE TABLE permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rol VARCHAR(50) NOT NULL,
  permiso VARCHAR(255) NOT NULL,
  UNIQUE KEY unique_rol_permiso (rol, permiso)
);
```

---

## PRÓXIMOS PASOS

1. ✓ Crear estructura backend
2. ✓ Configurar Express + MySQL
3. ✓ Crear rutas API
4. ⬜ Crear tablas en MySQL
5. ⬜ Migrar datos de Supabase
6. ⬜ Actualizar frontend para usar el nuevo backend
7. ⬜ Probar todo localmente
8. ⬜ Subir a VPS cuando esté listo

---

## TIPS IMPORTANTES

**Seguridad:**
- Cambiar JWT_SECRET en producción
- Usar HTTPS en producción
- No commitear .env al git (añadir a .gitignore)

**Headers de Autorización:**
```
Authorization: Bearer <token_jwt>
```

Todos los endpoints excepto `/api/auth/register` y `/api/auth/login` requieren este header.

**Desarrollo:**
```bash
npm run dev
```
Nodemon detectará cambios y reiniciará automáticamente.
