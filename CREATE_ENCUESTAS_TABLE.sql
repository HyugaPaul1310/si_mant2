-- ====================================
-- TABLA DE ENCUESTAS DE SATISFACCIÓN
-- ====================================
-- Ejecutar en Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS encuestas_satisfaccion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  empleado_email VARCHAR(255) NOT NULL,
  empleado_nombre VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  
  -- Respuestas de las preguntas
  trato_equipo VARCHAR(50),
  equipo_tecnico VARCHAR(50),
  personal_administrativo VARCHAR(50),
  rapidez VARCHAR(50),
  costo_calidad VARCHAR(50),
  recomendacion VARCHAR(50),
  satisfaccion VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_reporte FOREIGN KEY (reporte_id) REFERENCES reportes(id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_encuestas_reporte_id ON encuestas_satisfaccion(reporte_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_cliente_email ON encuestas_satisfaccion(cliente_email);
CREATE INDEX IF NOT EXISTS idx_encuestas_empleado_email ON encuestas_satisfaccion(empleado_email);
CREATE INDEX IF NOT EXISTS idx_encuestas_created_at ON encuestas_satisfaccion(created_at);

-- ====================================
-- FIN TABLA ENCUESTAS
-- ====================================
