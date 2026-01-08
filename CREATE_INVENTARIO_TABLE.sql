-- ====================================
-- TABLAS DE INVENTARIO DE HERRAMIENTAS
-- ====================================
-- Ejecutar en Supabase → SQL Editor

-- TABLA 1: Herramientas disponibles
CREATE TABLE IF NOT EXISTS inventario_herramientas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  categoria VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'disponible', -- disponible, descontinuado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 2: Asignaciones de herramientas a empleados
CREATE TABLE IF NOT EXISTS inventario_asignaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  herramienta_id UUID NOT NULL REFERENCES inventario_herramientas(id) ON DELETE CASCADE,
  herramienta_nombre VARCHAR(255) NOT NULL,
  empleado_email VARCHAR(255) NOT NULL,
  empleado_nombre VARCHAR(255),
  cantidad INT DEFAULT 1,
  estado VARCHAR(50) DEFAULT 'asignada', -- asignada, devuelta, perdida
  observaciones TEXT,
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fecha_devolucion TIMESTAMP WITH TIME ZONE,
  admin_email VARCHAR(255),
  admin_nombre VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_herramienta FOREIGN KEY (herramienta_id) REFERENCES inventario_herramientas(id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_empleado ON inventario_asignaciones(empleado_email);
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_herramienta ON inventario_asignaciones(herramienta_id);
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_estado ON inventario_asignaciones(estado);
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_fecha ON inventario_asignaciones(fecha_asignacion);



-- ====================================
-- FIN TABLAS INVENTARIO
-- ====================================
