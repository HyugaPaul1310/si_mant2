-- SCRIPT PARA CORREGIR LA ESTRUCTURA DE LAS TABLAS
-- Solo modificaciones de estructura, sin tocar datos

-- ========== TABLA REPORTES - Agregar columnas faltantes ==========
-- Verifica y agrega las columnas que falten en la tabla reportes

ALTER TABLE `reportes` 
ADD COLUMN IF NOT EXISTS `cerrado_por_cliente_at` TIMESTAMP NULL DEFAULT NULL AFTER `precio_cotizacion`,
ADD COLUMN IF NOT EXISTS `revision` LONGTEXT DEFAULT NULL AFTER `cerrado_por_cliente_at`,
ADD COLUMN IF NOT EXISTS `recomendaciones` LONGTEXT DEFAULT NULL AFTER `revision`,
ADD COLUMN IF NOT EXISTS `reparacion` LONGTEXT DEFAULT NULL AFTER `recomendaciones`,
ADD COLUMN IF NOT EXISTS `recomendaciones_adicionales` LONGTEXT DEFAULT NULL AFTER `reparacion`,
ADD COLUMN IF NOT EXISTS `materiales_refacciones` LONGTEXT DEFAULT NULL AFTER `recomendaciones_adicionales`,
ADD COLUMN IF NOT EXISTS `trabajo_completado` TINYINT(1) DEFAULT 0 AFTER `materiales_refacciones`,
ADD COLUMN IF NOT EXISTS `finalizado_por_tecnico_at` TIMESTAMP NULL DEFAULT NULL AFTER `trabajo_completado`,
ADD COLUMN IF NOT EXISTS `empleado_asignado_email` VARCHAR(255) DEFAULT NULL AFTER `finalizado_por_tecnico_at`,
ADD COLUMN IF NOT EXISTS `empleado_asignado_nombre` VARCHAR(255) DEFAULT NULL AFTER `empleado_asignado_email`,
ADD COLUMN IF NOT EXISTS `usuario_email` VARCHAR(255) DEFAULT NULL AFTER `empleado_asignado_nombre`,
ADD COLUMN IF NOT EXISTS `usuario_nombre` VARCHAR(255) DEFAULT NULL AFTER `usuario_email`,
ADD COLUMN IF NOT EXISTS `equipo_descripcion` VARCHAR(255) DEFAULT NULL AFTER `usuario_nombre`,
ADD COLUMN IF NOT EXISTS `sucursal` VARCHAR(255) DEFAULT NULL AFTER `equipo_descripcion`,
ADD COLUMN IF NOT EXISTS `comentario` LONGTEXT DEFAULT NULL AFTER `sucursal`,
ADD COLUMN IF NOT EXISTS `empresa` VARCHAR(255) DEFAULT NULL AFTER `comentario`,
ADD COLUMN IF NOT EXISTS `cotizacion_explicacion` LONGTEXT DEFAULT NULL AFTER `empresa`;

-- Actualizar ENUM de estado si es necesario (agregar estados faltantes)
-- Si los estados están incompletos, ejecuta esto:
ALTER TABLE `reportes` MODIFY COLUMN `estado` ENUM(
  'pendiente',
  'asignado',
  'en_proceso',
  'en_cotizacion',
  'cotizado',
  'aceptado_por_cliente',
  'finalizado_por_tecnico',
  'cerrado_por_cliente',
  'listo_para_encuesta',
  'encuesta_satisfaccion',
  'terminado',
  'finalizado',
  'en_espera',
  'en_espera_confirmacion',
  'cotizacionnueva',
  'rechazado',
  'cerrado'
) DEFAULT 'pendiente';

-- ========== TABLA USUARIOS ==========
ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `empresa_id` INT(11) DEFAULT NULL AFTER `empresa`;

-- ========== TABLA INVENTARIO_ASIGNACIONES ==========
ALTER TABLE `inventario_asignaciones` 
ADD COLUMN IF NOT EXISTS `observaciones` TEXT DEFAULT NULL AFTER `estado`,
ADD COLUMN IF NOT EXISTS `cantidad` INT(11) DEFAULT 1 AFTER `observaciones`;

-- ========== INDICES - Asegurar que existan ==========
-- Para reportes
ALTER TABLE `reportes` ADD INDEX IF NOT EXISTS `idx_estado` (`estado`);
ALTER TABLE `reportes` ADD INDEX IF NOT EXISTS `idx_usuario` (`usuario_id`);
ALTER TABLE `reportes` ADD INDEX IF NOT EXISTS `idx_empresa` (`empresa_id`);
ALTER TABLE `reportes` ADD INDEX IF NOT EXISTS `empleado_asignado_id` (`empleado_asignado_id`);

-- Para inventario_asignaciones
ALTER TABLE `inventario_asignaciones` ADD INDEX IF NOT EXISTS `idx_usuario` (`usuario_id`);
ALTER TABLE `inventario_asignaciones` ADD INDEX IF NOT EXISTS `idx_herramienta` (`herramienta_id`);
ALTER TABLE `inventario_asignaciones` ADD INDEX IF NOT EXISTS `idx_estado` (`estado`);

-- Para usuarios
ALTER TABLE `usuarios` ADD INDEX IF NOT EXISTS `empresa_id` (`empresa_id`);
ALTER TABLE `usuarios` ADD INDEX IF NOT EXISTS `idx_email` (`email`);
ALTER TABLE `usuarios` ADD INDEX IF NOT EXISTS `idx_rol` (`rol`);

-- ========== FIN DEL SCRIPT ==========
