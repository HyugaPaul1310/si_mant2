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
  estado ENUM('pendiente', 'en_proceso', 'cotizado', 'aceptado_por_cliente', 'finalizado_por_tecnico', 'cerrado_por_cliente', 'listo_para_encuesta', 'encuesta_satisfaccion', 'terminado', 'finalizado', 'en_espera') DEFAULT 'pendiente',
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
  cerrado_por_cliente_at TIMESTAMP NULL,
  finalizado_por_tecnico_at TIMESTAMP NULL,
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
  estado ENUM('pendiente', 'en_progreso', 'completada') DEFAULT 'pendiente',
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
  estado ENUM('asignada', 'devuelta') DEFAULT 'asignada',
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
  titulo VARCHAR(255) NOT NULL,
  descripcion LONGTEXT,
  monto DECIMAL(10, 2),
  usuario_id INT,
  empresa_id INT,
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
  titulo VARCHAR(255) NOT NULL,
  descripcion LONGTEXT,
  usuario_id INT,
  empresa_id INT,
  calificacion INT,
  respuesta LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_usuario (usuario_id),
  INDEX idx_calificacion (calificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
