-- ====================================
-- LIMPIAR TODAS LAS HERRAMIENTAS
-- ====================================
-- Ejecutar en Supabase → SQL Editor
-- ADVERTENCIA: Esto borrará TODAS las herramientas y sus asignaciones

-- Paso 1: Eliminar todas las asignaciones
DELETE FROM inventario_asignaciones;

-- Paso 2: Eliminar todas las herramientas
DELETE FROM inventario_herramientas;

-- Paso 3: Verificar que están vacías
SELECT COUNT(*) as herramientas FROM inventario_herramientas;
SELECT COUNT(*) as asignaciones FROM inventario_asignaciones;

-- ====================================
-- FIN LIMPIAR HERRAMIENTAS
-- ====================================
