-- Script para poblar la base de datos MySQL con datos de Supabase
-- Ejecutar después de CREATE_TABLES.sql

-- LIMPIAR DATOS EXISTENTES (CUIDADO - elimina todos los datos)
-- TRUNCATE TABLE inventario_asignaciones;
-- TRUNCATE TABLE inventario_herramientas;
-- TRUNCATE TABLE reporte_archivos;
-- TRUNCATE TABLE cotizaciones;
-- TRUNCATE TABLE encuestas_satisfaccion;
-- TRUNCATE TABLE reportes;
-- TRUNCATE TABLE tareas;
-- TRUNCATE TABLE usuarios;
-- TRUNCATE TABLE sucursales;
-- TRUNCATE TABLE empresas;

-- ==================== EMPRESAS ====================
INSERT INTO empresas (id, nombre, created_at, updated_at) VALUES
(1, 'AB ALIMENTOS', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(2, 'AEROCOMIDAS', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(3, 'PANADERIA BOH', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(4, 'ZIBARIS HOLDING', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(5, 'MERA TIJUANA', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(6, 'PICARDS', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(7, 'HOla', '2025-12-17 22:45:03', '2025-12-17 22:45:03'),
(8, 'COCINAS INSTITUCIONALES', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(9, 'ALSEA', '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(10, 'BARISTI', '2025-12-17 21:03:05', '2025-12-17 21:03:05');

-- ==================== USUARIOS ====================
INSERT INTO usuarios (id, nombre, apellido, email, contraseña, telefono, fecha_nacimiento, ciudad, empresa_id, rol, estado, created_at, updated_at) VALUES
(4, 'Admin', 'Principal', 'admin@simant.com', 'admin123', '0000000000', NULL, NULL, NULL, 'admin', 'activo', '2025-12-13 01:23:15', '2025-12-13 01:23:15'),
(6, 'Paul', 'Gonzalez', 'p@gmail.com', '123456', NULL, NULL, 'Baja California', 2, 'cliente', 'activo', '2025-12-15 21:15:42', '2025-12-15 21:15:42'),
(7, 'manuel', 'molina', 'tr@gmail.com', '123456', '6863123', '2002-03-12', 'ciudad', 2, 'empleado', 'activo', '2025-12-15 17:10:21', '2025-12-15 17:10:24'),
(12, 'Chupi', 'Chupu', 'ch@gmail.com', '123456', NULL, NULL, NULL, 7, 'cliente', 'inactivo', '2025-12-17 23:33:29', '2025-12-17 23:33:29'),
(13, 'Jorge', 'Perez', 'l@gmail.com', '123456', '6864701708', NULL, NULL, 7, 'cliente', 'inactivo', '2025-12-17 23:38:08', '2025-12-17 23:38:08'),
(14, 'Paul', 'Gonzalez', 'gon@simant.com', 'gon123456', '6863413633', '2002-12-22', 'Baja California, Mexicali', 9, 'cliente', 'activo', '2025-12-30 04:17:59', '2025-12-30 04:17:59'),
(15, 'paul', 'gonzales', 'paul@simant.com', '123456', '6863413632', '2002-12-21', 'Baja California, mexicali', 1, 'cliente', 'activo', '2026-01-08 06:18:45', '2026-01-08 06:18:45'),
(16, 'eduardo', 'padilla', 'eduardo@simant.ccom', '123456', '6863413632', '2002-04-12', 'Baja California, mexicali', 9, 'cliente', 'activo', '2026-01-08 06:28:37', '2026-01-08 06:28:37');

-- ==================== SUCURSALES ====================
INSERT INTO sucursales (id, empresa_id, nombre, direccion, ciudad, activo, created_at, updated_at) VALUES
(1, 1, 'AB ALIMENTOS COCHIMALLI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(2, 6, 'PICARDS SUPER MOR', 'Av. Melchor Ocampo 1973, Zona Centro, 22000 Tijuana, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(3, 2, 'TACOS FRONTERA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(4, 9, 'STARBUCKS AEROPUERTO TIJUANA SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA A ALFA', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(5, 5, 'BAJA BAR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(6, 2, 'AERODOMICAS HERMANOS LUPE SALAD B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(7, 1, 'AB ALIMENTOS DELIS MEXICALI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(8, 2, 'SUBWAY EXTERIOR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(9, 4, 'MANTEQUILLA PENIBULA', 'Transpen Ote. 6090, Local L-82, Chapultepec Alamar, 22110 Tijuana, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(10, 1, 'AB ALIMENTOS BRISENAS', 'Gral. Agustin Olachea, Lazaro Cardenas 1409, C.P. 22880 Ensenada, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(11, 2, 'BURGER TIJUANA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(12, 2, 'CARLS JR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(13, 2, 'SUBWAY SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(14, 6, 'COMBO DEL ABRO TAMPICO SINRISA', 'Avda. Tampico 5900, Col. Los Alamos 3er Sect, 22410 Tijuana, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(15, 9, 'STARBUCKS AEROPUERTO TIJUANA SALA C', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. PASILLO CENTRAL', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(16, 5, 'AB ABENDEHARA TIJUANA', 'AV. JOSE MARI MARTINEZ 1511 SECCION 18, C.P. 22018 COL. FERNANDEZ, TIJUANA, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(17, 1, 'AB ALIMENTOS COL HIPODROMO', '16 de Septiembre 2103, Zona Industrial, 21830 Tecate, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-18 09:44:46'),
(18, 5, 'LAS FAMOSAS TORTAS', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(19, 2, 'DUNKIN DONUTS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(20, 8, 'TIENDA COCINAS INSTITUCIONALES', 'Boulevard Diaz Ordaz 14535, Presa Rural, 22106 San Noviembre, 22100 Tijuana, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(21, 5, 'PANDA EXPRESS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05'),
(22, 10, 'BARISTI OSTADORES PLAYAS', 'P. del Pedregal, Playas de Tijuana, Playas Coronado, 22504 Tijuana, B.C.', NULL, TRUE, '2025-12-17 21:03:05', '2025-12-17 21:03:05');

-- ==================== TAREAS ====================
INSERT INTO tareas (id, titulo, descripcion, usuario_id, creada_por, estado, created_at, updated_at) VALUES
(1, 'Tarea 1', 'Jzjxjdjdjjd', 7, 4, 'completada', '2025-12-18 09:57:44', '2025-12-27 23:02:01'),
(2, 'Tarea 2', 'Linpiame kaspatas', 7, 4, 'completada', '2025-12-30 05:34:21', '2025-12-30 05:34:40'),
(3, 'Tarea 3', 'Yapap', 7, 4, 'completada', '2026-01-06 06:16:46', '2026-01-06 06:24:20'),
(4, 'Tarea 4', 'tarea', 7, 4, 'completada', '2025-12-18 05:32:26', '2025-12-18 05:59:51'),
(5, 'Tarea 5', 'Ssss', 7, 4, 'pendiente', '2025-12-18 09:57:37', '2025-12-18 09:57:37'),
(6, 'Tarea 6', 'dw1313w33', 7, 4, 'pendiente', '2025-12-18 09:54:26', '2025-12-18 09:54:26'),
(7, 'Tarea 7', 'haz una ya', 7, 4, 'pendiente', '2025-12-18 09:27:51', '2025-12-18 09:27:51'),
(8, 'Tarea 8', 'dawdawdwd', 7, 4, 'pendiente', '2025-12-18 09:54:20', '2025-12-18 09:54:20'),
(9, 'Tarea 9', 'Limpia los carros', 7, 4, 'pendiente', '2025-12-18 08:03:50', '2025-12-18 08:03:50');

-- ==================== INVENTARIO HERRAMIENTAS ====================
INSERT INTO inventario_herramientas (id, nombre, descripcion, estado, created_at, updated_at) VALUES
(1, 'Were', '', 'disponible', '2026-01-06 06:16:29', '2026-01-06 06:16:29'),
(2, 'herramienta test', '', 'disponible', '2026-01-04 04:42:34', '2026-01-04 04:42:34'),
(3, 'paptillo', '', 'disponible', '2026-01-06 06:08:40', '2026-01-06 06:08:40');

-- ==================== INVENTARIO ASIGNACIONES ====================
INSERT INTO inventario_asignaciones (id, usuario_id, herramienta_id, estado, created_at, updated_at) VALUES
(1, 7, 1, 'asignada', '2026-01-06 06:16:29', '2026-01-06 06:16:29'),
(2, 7, 3, 'devuelta', '2026-01-06 06:08:40', '2026-01-06 06:13:09'),
(3, 7, 2, 'perdida', '2026-01-04 04:42:34', '2026-01-06 06:13:45');

-- ==================== REPORTES ====================
INSERT INTO reportes (id, titulo, descripcion, estado, prioridad, usuario_id, empresa_id, created_at, updated_at) VALUES
(1, 'AERODOMICAS HERMANOS LUPE SALAD B', NULL, 'en_proceso', 'media', 6, 2, '2026-01-08 03:46:17', '2026-01-08 03:46:17'),
(2, 'BURGER TIJUANA', NULL, 'terminado', 'media', 6, 2, '2025-12-27 05:08:42', '2025-12-27 05:08:42'),
(3, 'AERODOMICAS HERMANOS LUPE SALAD B', NULL, 'cerrado_por_cliente', 'media', 6, 2, '2025-12-30 04:12:04', '2025-12-30 04:12:04'),
(4, 'BURGER TIJUANA', NULL, 'cerrado_por_cliente', 'media', 6, 2, '2025-12-27 21:56:06', '2025-12-27 21:56:06'),
(5, 'CARLS JR', NULL, 'cerrado_por_cliente', 'media', 6, 2, '2026-01-08 04:01:02', '2026-01-08 04:01:02'),
(6, 'VIPS AEROPUERTO TIJUANA SALA B', NULL, 'cotizado', 'media', 14, 9, '2025-12-30 04:48:33', '2025-12-30 04:48:33'),
(7, 'SUBWAY SALA B', NULL, 'terminado', 'media', 6, 2, '2025-12-27 05:40:19', '2025-12-27 05:40:19'),
(8, 'BURGER TIJUANA', NULL, 'pendiente', 'media', 6, 2, '2025-12-27 05:57:47', '2025-12-27 05:57:47'),
(9, 'BURGER TIJUANA', NULL, 'cerrado_por_cliente', 'media', 6, 2, '2025-12-27 22:24:22', '2025-12-27 22:24:22'),
(10, 'BURGER TIJUANA', NULL, 'terminado', 'media', 6, 2, '2025-12-24 06:08:44', '2025-12-24 06:08:44'),
(11, 'STARBUCKS AEROPUERTO TIJUANA SALA A', NULL, 'terminado', 'media', 14, 9, '2025-12-30 05:07:52', '2025-12-30 05:07:52'),
(12, 'Sucursal Demo', NULL, 'terminado', 'media', 14, 9, '2025-12-30 04:18:29', '2025-12-30 04:18:29'),
(13, 'AERODOMICAS HERMANOS LUPE SALAD B', NULL, 'finalizado_por_tecnico', 'media', 6, 2, '2025-12-24 06:37:27', '2025-12-24 06:37:27'),
(14, 'BURGER TIJUANA', NULL, 'terminado', 'media', 6, 2, '2025-12-27 05:59:53', '2025-12-27 05:59:53');

-- ==================== COTIZACIONES ====================
INSERT INTO cotizaciones (id, titulo, descripcion, monto, usuario_id, empresa_id, estado, created_at, updated_at) VALUES
(1, 'Cotizacion 1', 'Algo asi', 20.00, 7, 2, 'aceptada', '2025-12-30 05:09:00', '2025-12-30 05:09:01'),
(2, 'Cotizacion 2', 'Prender', 18494.00, 7, 2, 'aceptada', '2025-12-27 06:02:29', '2025-12-27 06:02:30'),
(3, 'Cotizacion 3', 'Pues si', 10.00, 7, 9, 'pendiente', '2026-01-08 03:33:17', '2026-01-08 03:33:18'),
(4, 'Cotizacion 4', 'Ee', 10058.00, 7, 2, 'aceptada', '2025-12-27 05:12:02', '2025-12-27 05:12:03'),
(5, 'Cotizacion 5', 'Si pues no', 10.00, 7, 9, 'aceptada', '2025-12-30 04:49:34', '2025-12-30 04:49:34'),
(6, 'Cotizacion 6', 'Popo', 31.00, 7, 2, 'aceptada', '2025-12-30 04:13:28', '2025-12-30 04:13:29'),
(7, 'Cotizacion 7', 'Si', 20.00, 7, 2, 'aceptada', '2026-01-08 03:48:00', '2026-01-08 03:48:01'),
(8, 'Cotizacion 8', 'Por lo que vemos no sir e', 1500.00, 7, 2, 'aceptada', '2025-12-30 06:03:57', '2025-12-30 06:03:57'),
(9, 'Cotizacion 9', 'popos', 12.00, 7, 2, 'aceptada', '2025-12-24 06:11:46', '2025-12-24 06:11:47'),
(10, 'Cotizacion 10', '10', 10.00, 7, 2, 'aceptada', '2026-01-08 04:02:14', '2026-01-08 04:02:15'),
(11, 'Cotizacion 11', 'Si', 10.00, 7, 2, 'aceptada', '2025-12-27 05:43:14', '2025-12-27 05:43:15'),
(12, 'Cotizacion 12', 'El aire es gay', 160.00, 7, 2, 'pendiente', '2025-12-24 06:39:01', '2025-12-24 06:39:00'),
(13, 'Cotizacion 13', '10S', 10.00, 7, 2, 'aceptada', '2025-12-27 22:25:51', '2025-12-27 22:25:51'),
(14, 'Cotizacion 14', '10', 10.00, 7, 2, 'aceptada', '2025-12-27 22:09:26', '2025-12-27 22:09:27');

-- ==================== ENCUESTAS DE SATISFACCIÓN ====================
INSERT INTO encuestas_satisfaccion (id, titulo, descripcion, usuario_id, empresa_id, calificacion, respuesta, created_at, updated_at) VALUES
(1, 'Encuesta 1', 'Excelente', 6, 2, 5, 'Excelente', '2025-12-27 05:44:34', '2025-12-27 05:44:34'),
(2, 'Encuesta 2', 'Bueno', 6, 2, 3, 'Bueno', '2025-12-30 06:05:55', '2025-12-30 06:05:55'),
(3, 'Encuesta 3', 'Excelente', 6, 2, 5, 'Excelente', '2026-01-08 04:03:43', '2026-01-08 04:03:43'),
(4, 'Encuesta 4', 'Malo', 6, 2, 1, 'Malo', '2025-12-27 22:16:14', '2025-12-27 22:16:14'),
(5, 'Encuesta 5', 'Excelente', 6, 2, 5, 'Excelente', '2025-12-27 05:18:36', '2025-12-27 05:18:36'),
(6, 'Encuesta 6', 'Excelente', 6, 2, 5, 'Excelente', '2025-12-27 22:27:13', '2025-12-27 22:27:13'),
(7, 'Encuesta 7', 'Excelente', 6, 2, 5, 'Excelente', '2025-12-24 06:12:34', '2025-12-24 06:12:34'),
(8, 'Encuesta 8', 'Excelente', 6, 2, 5, 'Excelente', '2025-12-27 06:03:55', '2025-12-27 06:03:55'),
(9, 'Encuesta 9', 'Muy Bueno', 6, 2, 4, 'Muy Bueno', '2025-12-30 04:15:26', '2025-12-30 04:15:26'),
(10, 'Encuesta 10', 'Malo', 14, 9, 1, 'Malo', '2025-12-30 04:51:43', '2025-12-30 04:51:43');

-- ==================== PERMISOS ====================
INSERT INTO permisos (rol, permiso) VALUES
('admin', 'ver_reportes'),
('admin', 'crear_reportes'),
('admin', 'editar_reportes'),
('admin', 'eliminar_reportes'),
('admin', 'gestionar_usuarios'),
('admin', 'gestionar_tareas'),
('admin', 'ver_inventario'),
('empleado', 'ver_reportes_asignados'),
('empleado', 'actualizar_reportes'),
('empleado', 'crear_cotizaciones'),
('cliente', 'crear_reportes'),
('cliente', 'ver_reportes_propios'),
('cliente', 'ver_cotizaciones');
