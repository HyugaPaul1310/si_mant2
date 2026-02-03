-- ============================================================================
-- SCRIPT 1: CLONAR/BACKUP LA BASE DE DATOS ACTUAL
-- ============================================================================

-- Primero, crear una nueva BD con el backup
CREATE DATABASE si_mant2_backup;

-- Copiar todas las tablas de si_mant2 a si_mant2_backup
CREATE TABLE si_mant2_backup.usuarios LIKE si_mant2.usuarios;
INSERT INTO si_mant2_backup.usuarios SELECT * FROM si_mant2.usuarios;

CREATE TABLE si_mant2_backup.empresas LIKE si_mant2.empresas;
INSERT INTO si_mant2_backup.empresas SELECT * FROM si_mant2.empresas;

CREATE TABLE si_mant2_backup.reportes LIKE si_mant2.reportes;
INSERT INTO si_mant2_backup.reportes SELECT * FROM si_mant2.reportes;

CREATE TABLE si_mant2_backup.reportes_archivos LIKE si_mant2.reportes_archivos;
INSERT INTO si_mant2_backup.reportes_archivos SELECT * FROM si_mant2.reportes_archivos;

CREATE TABLE si_mant2_backup.encuestas_satisfaccion LIKE si_mant2.encuestas_satisfaccion;
INSERT INTO si_mant2_backup.encuestas_satisfaccion SELECT * FROM si_mant2.encuestas_satisfaccion;

CREATE TABLE si_mant2_backup.cotizaciones LIKE si_mant2.cotizaciones;
INSERT INTO si_mant2_backup.cotizaciones SELECT * FROM si_mant2.cotizaciones;

CREATE TABLE si_mant2_backup.tareas LIKE si_mant2.tareas;
INSERT INTO si_mant2_backup.tareas SELECT * FROM si_mant2.tareas;

CREATE TABLE si_mant2_backup.inventario_herramientas LIKE si_mant2.inventario_herramientas;
INSERT INTO si_mant2_backup.inventario_herramientas SELECT * FROM si_mant2.inventario_herramientas;

CREATE TABLE si_mant2_backup.inventario_asignaciones LIKE si_mant2.inventario_asignaciones;
INSERT INTO si_mant2_backup.inventario_asignaciones SELECT * FROM si_mant2.inventario_asignaciones;

CREATE TABLE si_mant2_backup.permisos LIKE si_mant2.permisos;
INSERT INTO si_mant2_backup.permisos SELECT * FROM si_mant2.permisos;

-- Verificar que el backup fue exitoso
SELECT 'Backup completado!' as status;
SELECT 
  (SELECT COUNT(*) FROM si_mant2_backup.usuarios) as usuarios_backup,
  (SELECT COUNT(*) FROM si_mant2_backup.reportes) as reportes_backup,
  (SELECT COUNT(*) FROM si_mant2_backup.empresas) as empresas_backup;

-- ============================================================================
-- SCRIPT 2: RESETEAR LA BASE DE DATOS COMO NUEVA (DEJAR SOLO USUARIOS Y EMPRESAS)
-- ============================================================================

-- IMPORTANTE: Ejecutar esto cuando hayas confirmado que el backup está bien
-- Este script borrará todos los reportes, archivos, encuestas, cotizaciones y tareas

-- Primero, deshabilitar las FK para poder borrar en cualquier orden
SET FOREIGN_KEY_CHECKS=0;

-- 1. Limpiar archivos de reportes
DELETE FROM si_mant2.reportes_archivos;

-- 2. Limpiar encuestas de satisfacción
DELETE FROM si_mant2.encuestas_satisfaccion;

-- 3. Limpiar cotizaciones
DELETE FROM si_mant2.cotizaciones;

-- 4. Limpiar reportes (esto es lo principal)
DELETE FROM si_mant2.reportes;

-- 5. OPCIONAL: Limpiar tareas (si quieres que los técnicos no tengan tareas pendientes)
DELETE FROM si_mant2.tareas;

-- 6. OPCIONAL: Resetear asignaciones de herramientas (si quieres que técnicos devuelvan todas)
DELETE FROM si_mant2.inventario_asignaciones;

-- Reactivar las FK
SET FOREIGN_KEY_CHECKS=1;

-- Verificar que quedó limpio
SELECT 'Base de datos reseteada!' as status;
SELECT 
  (SELECT COUNT(*) FROM si_mant2.usuarios) as usuarios_total,
  (SELECT COUNT(*) FROM si_mant2.empresas) as empresas_total,
  (SELECT COUNT(*) FROM si_mant2.reportes) as reportes_total,
  (SELECT COUNT(*) FROM si_mant2.reportes_archivos) as archivos_total,
  (SELECT COUNT(*) FROM si_mant2.encuestas_satisfaccion) as encuestas_total,
  (SELECT COUNT(*) FROM si_mant2.cotizaciones) as cotizaciones_total,
  (SELECT COUNT(*) FROM si_mant2.tareas) as tareas_total;

-- ============================================================================
-- SCRIPT 3: RESETEAR TODO INCLUYENDO USUARIOS Y EMPRESAS (TOTALMENTE NUEVA)
-- ============================================================================

-- ADVERTENCIA: Esto borrará TODO. Solo usa si quieres una BD completamente limpia
-- Y tendrás que recrear usuarios y empresas desde cero

SET FOREIGN_KEY_CHECKS=0;

-- Borrar todas las tablas
TRUNCATE TABLE si_mant2.reportes_archivos;
TRUNCATE TABLE si_mant2.encuestas_satisfaccion;
TRUNCATE TABLE si_mant2.cotizaciones;
TRUNCATE TABLE si_mant2.reportes;
TRUNCATE TABLE si_mant2.tareas;
TRUNCATE TABLE si_mant2.inventario_asignaciones;
TRUNCATE TABLE si_mant2.inventario_herramientas;
TRUNCATE TABLE si_mant2.usuarios;
TRUNCATE TABLE si_mant2.empresas;
TRUNCATE TABLE si_mant2.permisos;

SET FOREIGN_KEY_CHECKS=1;

-- BD completamente nueva
SELECT 'Base de datos totalmente limpia!' as status;

