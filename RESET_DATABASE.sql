-- ====================================
-- LIMPIAR REPORTES Y DATOS RELACIONADOS
-- ====================================
-- Ejecutar en Supabase → SQL Editor
-- Mantiene: usuarios, empresas, sucursales, tareas

-- Borrar en este orden (respetando foreign keys):
DELETE FROM public.encuestas_satisfaccion;
DELETE FROM public.reportes_evidencia;
DELETE FROM public.reporte_archivos;
DELETE FROM public.cotizaciones;
DELETE FROM public.reportes;

-- Opcional: Borrar sucursales si necesitas
-- DELETE FROM public.sucursales;

-- Opcional: Borrar empresas si necesitas
-- DELETE FROM public.empresas;

-- ====================================
-- LISTO - LIMPIO PARA TESTING
-- Mantenidos: usuarios, empresas, sucursales, tareas
-- ====================================





