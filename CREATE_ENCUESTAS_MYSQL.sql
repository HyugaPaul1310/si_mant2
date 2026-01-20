-- ====================================
-- TABLA DE ENCUESTAS DE SATISFACCIÓN (MySQL/MariaDB)
-- ====================================

DROP TABLE IF EXISTS encuestas_satisfaccion;

CREATE TABLE IF NOT EXISTS encuestas_satisfaccion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporte_id INT NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_nombre VARCHAR(255),
  empleado_email VARCHAR(255),
  empleado_nombre VARCHAR(255),
  empresa VARCHAR(255),
  
  -- Respuestas de las 7 preguntas (valores: Muy insatisfecho, Insatisfecho, Neutral, Satisfecho, Muy satisfecho)
  trato_equipo VARCHAR(50),
  equipo_tecnico VARCHAR(50),
  personal_administrativo VARCHAR(50),
  rapidez VARCHAR(50),
  costo_calidad VARCHAR(50),
  recomendacion VARCHAR(50),
  satisfaccion VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
  INDEX idx_reporte_id (reporte_id),
  INDEX idx_cliente_email (cliente_email),
  INDEX idx_empleado_email (empleado_email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================
-- FIN TABLA ENCUESTAS
-- ====================================
