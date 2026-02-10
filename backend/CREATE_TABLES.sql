-- Script para crear todas las tablas necesarias en MySQL
-- Ejecutar esto en phpMyAdmin o en la línea de comandos de MySQL

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla empresas
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(255),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla reportes
CREATE TABLE IF NOT EXISTS reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion LONGTEXT,
  estado ENUM('pendiente', 'en_proceso', 'cotizado', 'aceptado_por_cliente', 'finalizado_por_tecnico', 'cerrado_por_cliente', 'listo_para_encuesta', 'encuesta_satisfaccion', 'terminado', 'finalizado', 'en_espera', 'asignado', 'en_cotizacion', 'cancelado', 'rechazado') DEFAULT 'pendiente',
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  usuario_id INT,
  empresa_id INT,
  empleado_id INT,
  analisis_general LONGTEXT,
  precio_cotizacion DECIMAL(10, 2),
  revision LONGTEXT,
  recomendaciones LONGTEXT,
  reparacion LONGTEXT,
  recomendaciones_adicionales LONGTEXT,
  materiales_refacciones LONGTEXT,
  trabajo_completado TINYINT(1) DEFAULT 0,
  cerrado_por_cliente_at TIMESTAMP NULL,
  finalizado_por_tecnico_at TIMESTAMP NULL,
  empleado_asignado_id INT,
  empleado_asignado_email VARCHAR(255),
  empleado_asignado_nombre VARCHAR(255),
  usuario_email VARCHAR(255),
  usuario_nombre VARCHAR(255),
  equipo_descripcion VARCHAR(255),
  sucursal VARCHAR(255),
  comentario LONGTEXT,
  motivo_cancelacion LONGTEXT,
  empresa VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (empleado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_usuario (usuario_id),
  INDEX idx_empresa (empresa_id),
  INDEX idx_empleado (empleado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla tareas
CREATE TABLE IF NOT EXISTS tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion LONGTEXT,
  usuario_id INT,
  creada_por INT,
  estado ENUM('pendiente', 'en_progreso', 'en_proceso', 'completada', 'rechazada') DEFAULT 'pendiente',
  admin_email VARCHAR(255),
  admin_nombre VARCHAR(255),
  empleado_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (creada_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_usuario (usuario_id),
  INDEX idx_estado (estado),
  INDEX idx_creada_por (creada_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla herramientas
CREATE TABLE IF NOT EXISTS inventario_herramientas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion LONGTEXT,
  estado ENUM('disponible', 'en_uso', 'mantenimiento') DEFAULT 'disponible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado),
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla asignaciones de herramientas
CREATE TABLE IF NOT EXISTS inventario_asignaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  herramienta_id INT NOT NULL,
  cantidad INT DEFAULT 1,
  estado ENUM('asignada', 'devuelta') DEFAULT 'asignada',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (herramienta_id) REFERENCES inventario_herramientas(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_herramienta (herramienta_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla permisos
CREATE TABLE IF NOT EXISTS permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rol VARCHAR(50) NOT NULL,
  permiso VARCHAR(255) NOT NULL,
  UNIQUE KEY unique_rol_permiso (rol, permiso),
  INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla cotizaciones (quotes)
CREATE TABLE IF NOT EXISTS cotizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255),
  descripcion LONGTEXT,
  monto DECIMAL(10, 2),
  usuario_id INT,
  empresa_id INT,
  reporte_id INT,
  empleado_nombre VARCHAR(255),
  analisis_general LONGTEXT,
  precio_cotizacion DECIMAL(10, 2),
  estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla encuestas de satisfacción
CREATE TABLE IF NOT EXISTS encuestas_satisfaccion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255),
  descripcion LONGTEXT,
  usuario_id INT,
  empresa_id INT,
  reporte_id INT,
  cliente_email VARCHAR(100),
  cliente_nombre VARCHAR(255),
  empleado_email VARCHAR(100),
  empleado_nombre VARCHAR(255),
  empresa VARCHAR(255),
  trato_equipo VARCHAR(100),
  equipo_tecnico VARCHAR(100),
  personal_administrativo VARCHAR(100),
  rapidez VARCHAR(100),
  costo_calidad VARCHAR(100),
  recomendacion VARCHAR(100),
  satisfaccion VARCHAR(100),
  calificacion INT,
  respuesta LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_usuario (usuario_id),
  INDEX idx_calificacion (calificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla reportes_archivos
CREATE TABLE IF NOT EXISTS reportes_archivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporte_id INT,
  tipo_archivo VARCHAR(50),
  cloudflare_url TEXT,
  cloudflare_key VARCHAR(255),
  nombre_original VARCHAR(255),
  tamaño INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reporte (reporte_id),
  FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
