-- SCRIPT PARA ACTUALIZAR BD A LA VERSION DEL COMPAÑERO
-- Este script borra y recrea los datos para que coincidan exactamente

-- Primero, vaciamos las tablas en orden inverso de dependencias
DELETE FROM reportes_archivos;
DELETE FROM reportes;
DELETE FROM cotizaciones;
DELETE FROM encuestas_satisfaccion;
DELETE FROM tareas;
DELETE FROM inventario_asignaciones;
DELETE FROM inventario_herramientas;
DELETE FROM usuarios;
DELETE FROM sucursales;
DELETE FROM empresas;

-- Restablecemos los auto_increments
ALTER TABLE reportes_archivos AUTO_INCREMENT = 1;
ALTER TABLE reportes AUTO_INCREMENT = 5;
ALTER TABLE cotizaciones AUTO_INCREMENT = 1;
ALTER TABLE encuestas_satisfaccion AUTO_INCREMENT = 1;
ALTER TABLE tareas AUTO_INCREMENT = 1;
ALTER TABLE inventario_asignaciones AUTO_INCREMENT = 1;
ALTER TABLE inventario_herramientas AUTO_INCREMENT = 1;
ALTER TABLE usuarios AUTO_INCREMENT = 1;
ALTER TABLE sucursales AUTO_INCREMENT = 1;
ALTER TABLE empresas AUTO_INCREMENT = 1;

-- ========== EMPRESAS ==========
INSERT INTO `empresas` (`id`, `nombre`, `created_at`, `updated_at`) VALUES
(1, 'AB ALIMENTOS', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(2, 'AEROCOMIDAS', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(3, 'PANADERIA BOH', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(4, 'ZIBARIS HOLDING', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(5, 'MERA TIJUANA', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(6, 'PICARDS', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(8, 'COCINAS INSTITUCIONALES', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(9, 'ALSEA', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(10, 'BARISTI', '2025-12-18 05:03:05', '2025-12-18 05:03:05');

-- ========== USUARIOS ==========
INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `contraseña`, `telefono`, `fecha_nacimiento`, `ciudad`, `empresa`, `empresa_id`, `rol`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'test', 'test', 'test@simant.com', '$2b$10$RdwHoEek.90DlGSlIcnOTefaNxuwND.zWex4b.lzFLtLSSqaBSMHG', '6866666666', NULL, 'Aguascalientes, mxli', 'AB ALIMENTOS', 1, 'admin', 'activo', '2026-01-20 21:12:27', '2026-01-20 21:13:08'),
(4, 'Admin', 'Principal', 'admin@simant.com', '$2b$10$TdjeLR6CrQb/OGe.F8EgXOm6QMPszt63IXCbCk47IK/0JtNTPIWoe', '0000000000', NULL, NULL, NULL, NULL, 'admin', 'activo', '2025-12-13 09:23:15', '2026-01-11 18:54:15'),
(6, 'Paul', 'Gonzalez', 'p@gmail.com', '$2b$10$htB5mc6j37WfN5viz5Xf1OYlfWOVZQ7Zm.Vn2WE/89/RmN2GEghUm', NULL, NULL, 'Baja California', 'AEROCOMIDAS', 2, 'cliente', 'activo', '2025-12-16 05:15:42', '2026-02-02 02:07:10'),
(7, 'manuel', 'molina', 'tr@gmail.com', '$2b$10$yUUpBwDs2UNQJ0FJXmN1deXA2Ape55MFLzlgG/cO9ewnMeyv1ggFy', '6863123', '2002-03-12', 'ciudad', NULL, 2, 'empleado', 'activo', '2025-12-16 01:10:21', '2026-01-11 19:26:38'),
(12, 'Chupi', 'Chupu', 'ch@gmail.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', NULL, NULL, NULL, NULL, 7, 'cliente', 'inactivo', '2025-12-18 07:33:29', '2026-01-10 06:46:37'),
(13, 'Jorge', 'Perez', 'l@gmail.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6864701708', NULL, NULL, NULL, 7, 'cliente', 'inactivo', '2025-12-18 07:38:08', '2026-01-10 06:46:37'),
(14, 'Paul', 'Gonzalez', 'gon@simant.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6863413633', '2002-12-22', 'Baja California, Mexicali', NULL, 9, 'cliente', 'activo', '2025-12-30 12:17:59', '2026-01-10 06:46:37'),
(15, 'paul', 'gonzales', 'paul@simant.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6863413632', '2002-12-21', 'Baja California, mexicali', 'BARISTI', 10, 'cliente', 'activo', '2026-01-08 14:18:45', '2026-02-02 02:02:40'),
(16, 'eduardo', 'padilla', 'eduardo@simant.ccom', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6863413632', '2002-04-12', 'Baja California, mexicali', NULL, 9, 'cliente', 'activo', '2026-01-08 14:28:37', '2026-01-10 06:46:38'),
(17, 'traba', 'traba', 'traba@simant.com', '$2b$10$5LOyCMcc/jl3YxjEhSmPseV94sh08tYxGt0e4mMMYF.XU.ZlFiHvu', '1234566412', NULL, 'Aguascalientes, mx', NULL, 2, 'empleado', 'activo', '2026-01-20 21:29:36', '2026-01-20 21:29:44'),
(18, 'Hector', 'Hector', 'h@gmail.com', '$2b$10$O0S9/h0Sp7Y5X28zoKHYwemO2qQHLK8JqHpS1eprEhcoaMJ73apIi', '', NULL, '', NULL, 4, 'cliente', 'activo', '2026-02-02 02:20:22', '2026-02-02 02:20:22');

-- ========== SUCURSALES ==========
INSERT INTO `sucursales` (`id`, `empresa_id`, `nombre`, `direccion`, `ciudad`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 'AB ALIMENTOS COCHIMALLI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', 'Mexicali', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(2, 1, 'AB ALIMENTOS DELIS MEXICALI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', 'Mexicali', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(3, 1, 'AB ALIMENTOS BRISENAS', 'Gral. Agustin Olachea, Lazaro Cardenas 1409, C.P. 22880 Ensenada, B.C.', 'Ensenada', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(4, 1, 'AB ALIMENTOS COL HIPODROMO', '16 de Septiembre 2103, Zona Industrial, 21830 Tecate, B.C.', 'Tecate', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(5, 1, 'AB ALIMENTOS DUGES INDEPENDENCIA', 'Ave. Via Rapida Poniente, 1231, C.P. 22320, Col. 20 De Noviembre, Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(6, 1, 'AB ALIMENTOS BENITES', 'Privada Iguala, Gonzales S/N, C.P. 22415, Col. Sanchez Taboada, Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(8, 1, 'AB ALIMENTOS TORRELLANA TECATE', 'Guadalajara 254, Loma Alta, 21460 Tecate, B.C.', 'Tecate', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(9, 2, 'AERODOMICAS HERMANOS LUPE SALAD B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(10, 2, 'BURGER TIJUANA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(16, 2, 'DUNKIN DONUTS SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(17, 2, 'TACOS FRONTERA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(18, 2, 'STARBUCKS AEROPUERTO TIJUANA SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA A ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(19, 2, 'STARBUCKS AEROPUERTO TIJUANA SALA C', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. PASILLO CENTRAL', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(20, 2, 'STARBUCKS AEROPUERTO TIJUANA SALA D', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(21, 2, 'STARBUCKS AEROPUERTO TIJUANA SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA A BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(22, 2, 'VIPS AEROPUERTO TIJUANA SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(23, 2, 'VIPS AEROPUERTO TIJUANA SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(24, 2, 'BAJA BAR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(25, 2, 'AB ABENDEHARA TIJUANA', 'AV. JOSE MARI MARTINEZ 1511 SECCION 18, C.P. 22018 COL. FERNANDEZ, TIJUANA, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(26, 2, 'LAS FAMOSAS TORTAS', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(27, 2, 'PANDA EXPRESS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(28, 2, 'EL TACO BOOM', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(29, 2, 'JOHNNY ROCKETS SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(30, 2, 'JOHNNY ROCKETS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(31, 2, 'PETITE GOURMET', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(32, 2, 'PANDA EXPRESS SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(33, 2, 'DOMINO´S PIZZA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(34, 2, 'MANTEQUILLA PENIBULA', 'Transpen Ote. 6090, Local L-82, Chapultepec Alamar, 22110 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(35, 2, 'MANTEQUILLA HIPODROMO', 'Av. Tapachula 7, Chapultepec Este, 22020 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(36, 2, 'MANTEQUILLA CACHO', 'Av. Celso St 15, Del Mexico, 22040 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(37, 2, 'MANTEQUILLA PASEO DEL PARQUE', 'Ave. Parque Tematico 3, Del Mexico Del Sur, 22650, 22655, 22651 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(38, 6, 'PICARDS SUPER MOR', 'Av. Melchor Ocampo 1973, Zona Centro, 22000 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(39, 6, 'COMBO DEL ABRO TAMPICO SINRISA', 'Avda. Tampico 5900, Col. Los Alamos 3er Sect, 22410 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(40, 8, 'TIENDA COCINAS INSTITUCIONALES', 'Boulevard Diaz Ordaz 14535, Presa Rural, 22106 San Noviembre, 22100 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(41, 8, 'ALMACEN COCINAS INSTITUCIONALES', 'Av. Murios Martinez 1010 Pin 6, Fernandez, 22110 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(42, 10, 'BARISTI OSTADORES PLAYAS', 'P. del Pedregal, Playas de Tijuana, Playas Coronado, 22504 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(43, 10, 'BARISTI LAS PALMAS', 'Av. las Palmas 14751, Las Palmas, 22106 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(44, 10, 'BARISTI OSTADORES RIO', 'P. de los Heroes 10001 Zona Urbana Rio Tijuana, 22010 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(45, 3, 'PANADERIA BOH CACHO', 'Querétaro 2371, Col. Madero (Cacho), 22040 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(46, 3, 'PANADERIA BOH SPA ETAPA DEL RIO', 'P.º del Río 7124, Planta baja, Río Tijuana 3a. Etapa, 22226 Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(47, 9, 'Aqui', 'Aqui', '', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(51, 4, 'Prueba', 'Prueba', NULL, 1, '2026-02-02 02:23:59', '2026-02-02 02:23:59');

-- ========== HERRAMIENTAS DE INVENTARIO ==========
INSERT INTO `inventario_herramientas` (`id`, `nombre`, `descripcion`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'Were', '', 'disponible', '2026-01-06 14:16:29', '2026-01-06 14:16:29'),
(2, 'herramienta test', '', 'disponible', '2026-01-04 12:42:34', '2026-01-04 12:42:34'),
(3, 'paptillo', '', 'disponible', '2026-01-06 14:08:40', '2026-01-06 14:08:40'),
(4, 'martillo', 'una foto con el', 'disponible', '2026-01-20 21:13:31', '2026-01-20 21:25:37'),
(5, 'her', NULL, 'disponible', '2026-01-20 21:27:18', '2026-01-20 21:27:18'),
(6, 'marti', NULL, 'disponible', '2026-01-20 21:30:59', '2026-01-20 21:30:59'),
(7, '23', NULL, 'disponible', '2026-01-20 21:43:10', '2026-01-20 21:43:10'),
(8, 'Movil', NULL, 'disponible', '2026-01-20 21:50:42', '2026-01-20 21:50:42'),
(11, 'Martillo2', 'Martillo azul con rojo', 'disponible', '2026-01-26 23:48:25', '2026-01-26 23:48:25'),
(12, 'Tijeras profesionales', 'tijeras rojas con azul', 'disponible', '2026-01-26 23:48:55', '2026-01-26 23:48:55'),
(13, 'Mazo34', NULL, 'disponible', '2026-01-26 23:49:57', '2026-01-26 23:49:57'),
(14, 'Cuchillo de cocina', NULL, 'disponible', '2026-01-26 23:53:05', '2026-01-26 23:53:05'),
(15, 'zapato grande', NULL, 'disponible', '2026-01-26 23:54:13', '2026-01-26 23:54:13');

-- ========== ASIGNACIONES DE INVENTARIO ==========
INSERT INTO `inventario_asignaciones` (`id`, `usuario_id`, `herramienta_id`, `estado`, `created_at`, `updated_at`, `observaciones`, `cantidad`) VALUES
(1, 7, 1, 'perdida', '2026-01-06 14:16:29', '2026-01-20 21:28:55', NULL, 1),
(2, 7, 3, 'devuelta', '2026-01-06 14:08:40', '2026-01-06 14:13:09', NULL, 1),
(3, 7, 2, 'perdida', '2026-01-04 12:42:34', '2026-01-06 14:13:45', NULL, 1),
(4, 7, 5, 'devuelta', '2026-01-20 21:28:52', '2026-01-20 21:28:57', NULL, 2),
(5, 17, 6, 'asignada', '2026-01-20 21:30:59', '2026-01-20 21:30:59', 'llo', 1),
(6, 17, 7, 'asignada', '2026-01-20 21:43:10', '2026-01-20 21:43:10', '2333', 2),
(7, 17, 8, 'asignada', '2026-01-20 21:50:42', '2026-01-20 21:50:42', 'Movil', 1),
(8, 7, 12, 'asignada', '2026-01-26 23:49:22', '2026-01-26 23:49:22', NULL, 5),
(9, 7, 13, 'asignada', '2026-01-26 23:49:57', '2026-01-26 23:49:57', NULL, 1),
(10, 7, 14, 'asignada', '2026-01-26 23:53:05', '2026-01-26 23:53:05', NULL, 6),
(11, 7, 15, 'asignada', '2026-01-26 23:54:13', '2026-01-26 23:54:13', NULL, 4);

-- ========== REPORTES ==========
INSERT INTO `reportes` (`id`, `titulo`, `descripcion`, `estado`, `prioridad`, `usuario_id`, `empresa_id`, `created_at`, `updated_at`, `empleado_asignado_id`, `analisis_general`, `precio_cotizacion`, `cerrado_por_cliente_at`, `revision`, `recomendaciones`, `reparacion`, `recomendaciones_adicionales`, `materiales_refacciones`, `trabajo_completado`, `finalizado_por_tecnico_at`, `empleado_asignado_email`, `empleado_asignado_nombre`, `usuario_email`, `usuario_nombre`, `equipo_descripcion`, `sucursal`, `comentario`, `empresa`) VALUES
(5, 'test 1 - BAJA BAR', 'Modelo: test 1\nSerie: test 1\nSucursal: BAJA BAR\nComentario: test 1test 1test 1test 1\nPrioridad: baja', 'cerrado', 'baja', 6, 2, '2026-01-29 23:15:33', '2026-01-29 23:38:00', 7, 'Aquí mero', 5000.00, NULL, 'bien', 'bien', 'bien', NULL, 'bien', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'test2 - BAJA BAR', 'Modelo: test2\nSerie: test2\nSucursal: BAJA BAR\nComentario: test2test2test2test2\nPrioridad: urgente', 'cerrado', '', 6, 2, '2026-01-29 23:40:06', '2026-01-29 23:43:32', 7, 'Test2', 3000.00, NULL, 'Test', 'Test', 'Test', NULL, 'Test', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'test3 - BAJA BAR', 'Modelo: test3\nSerie: test3\nSucursal: BAJA BAR\nComentario: test3test3test3test3\nPrioridad: media', 'cerrado', 'media', 6, 2, '2026-01-30 01:09:09', '2026-01-30 01:23:08', 7, 'test3\ntest3\ntest3', 3000.00, NULL, 'test3', 'test3', 'test3', NULL, 'test3', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'test4 - AERODOMICAS HERMANOS LUPE SALAD B', 'Modelo: test4\nSerie: test4\nSucursal: AERODOMICAS HERMANOS LUPE SALAD B\nComentario: test4test4test4test4\nPrioridad: baja', 'cerrado', 'baja', 6, 2, '2026-01-30 01:38:03', '2026-01-30 01:39:53', 7, 'Test4', 4000.00, NULL, 'Test4', 'Test4', 'Test4', NULL, 'Test4', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'test5 - PANDA EXPRESS SALA B', 'Modelo: test5\nSerie: test5\nSucursal: PANDA EXPRESS SALA B\nComentario: test5test5test5test5\nPrioridad: baja', 'cerrado', 'baja', 6, 2, '2026-01-30 01:41:35', '2026-01-30 01:43:52', 7, 'Test5', 5000.00, NULL, 'test5', 'test5', 'test5', NULL, 'test5', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'test6 - AB ABENDEHARA TIJUANA', 'Modelo: test6\nSerie: test6\nSucursal: AB ABENDEHARA TIJUANA\nComentario: test6test6test6test6\nPrioridad: media', 'cerrado', 'media', 6, 2, '2026-01-30 01:57:20', '2026-01-30 02:00:55', 7, 'test6\ntest6\ntest6\ntest6\ntest6', 4000.00, NULL, 'test6', 'test6', 'test6', NULL, 'test6', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'test7 - AB ABENDEHARA TIJUANA', 'Modelo: test7\nSerie: test7\nSucursal: AB ABENDEHARA TIJUANA\nComentario: test7test7test7test7\nPrioridad: media', 'cerrado', 'media', 6, 2, '2026-01-30 02:11:20', '2026-02-01 07:17:42', 7, 'Test7', 3000.00, NULL, 'Test7', 'Test7', 'Test7', 'Test7', 'Test7', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'test8 - BURGER TIJUANA', 'Modelo: test8\nSerie: test8\nSucursal: BURGER TIJUANA\nComentario: test8test8test8test8\nPrioridad: baja', 'cerrado', 'baja', 6, 2, '2026-01-31 23:30:06', '2026-01-31 23:33:55', 7, 'falla en el calentador', 5000.00, NULL, 'test8', 'test8', 'test8', NULL, 'test8', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'test9 - BAJA BAR', 'Modelo: test9\nSerie: test9\nSucursal: BAJA BAR\nComentario: test9test9test9test9test9\nPrioridad: media', 'cerrado', 'media', 6, 2, '2026-02-01 06:56:44', '2026-02-01 07:15:59', 7, 'Test9', 3900.00, NULL, 'Test9', 'Test9', 'Test9', NULL, 'Test9', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Test10 - AB ABENDEHARA TIJUANA', 'Modelo: Test10\nSerie: Test10\nSucursal: AB ABENDEHARA TIJUANA\nComentario: Test10Test10Test10Test10\nPrioridad: urgente', 'cerrado', '', 6, 2, '2026-02-01 07:18:11', '2026-02-02 02:16:11', 7, 'Test10', 20000.00, NULL, 'Test10', 'Test10', 'Test10', 'Test10', 'Test10', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'Test11 - AERODOMICAS HERMANOS LUPE SALAD B', 'Modelo: Test11\nSerie: Test11\nSucursal: AERODOMICAS HERMANOS LUPE SALAD B\nComentario: Test11Test11Test11Test11\nPrioridad: media', 'cerrado', 'media', 6, 2, '2026-02-01 07:31:03', '2026-02-02 01:50:59', 7, 'Test11', 111111.00, NULL, 'Test11', 'Test11', 'Test11', NULL, 'Test11', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'Test12 - AB ABENDEHARA TIJUANA', 'Modelo: Test12\nSerie: Test12\nSucursal: AB ABENDEHARA TIJUANA\nComentario: Test12Test12Test12Test12\nPrioridad: baja', 'cerrado', 'baja', 6, 2, '2026-02-01 07:38:22', '2026-02-01 07:41:03', 7, 'Test12', 2000.00, NULL, 'Test12', 'Test12', 'Test12', NULL, 'Test12', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'Test13 - AERODOMICAS HERMANOS LUPE SALAD B', 'Modelo: Test13\nSerie: Test13\nSucursal: AERODOMICAS HERMANOS LUPE SALAD B\nComentario: Test13Test13Test13Test13\nPrioridad: media', 'cerrado', 'media', 6, 2, '2026-02-01 07:45:20', '2026-02-02 02:19:25', 7, 'test13', 3000.00, NULL, 'test13', 'test13', 'test13', NULL, 'test13', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'Test14 - AERODOMICAS HERMANOS LUPE SALAD B', 'Modelo: Test14\nSerie: Test14\nSucursal: AERODOMICAS HERMANOS LUPE SALAD B\nComentario: Test14Test14Test14Test14\nPrioridad: baja', 'pendiente', 'baja', 6, 2, '2026-02-01 07:48:04', '2026-02-01 07:48:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, 'Test15 - Prueba', 'Modelo: Test15\nSerie: Test15\nSucursal: Prueba\nComentario: Test15Test15Test15Test15\nPrioridad: media', 'cerrado', 'media', 18, 4, '2026-02-02 02:24:13', '2026-02-02 02:30:35', 7, 'Test15', 3000.00, NULL, 'Test15', 'Test15', 'Test15', 'Test15', 'Test15', 0, NULL, 'tr@gmail.com', 'manuel molina', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'Test16 - Prueba', 'Modelo: Test16\nSerie: Test16\nSucursal: Prueba\nComentario: Test16Test16Test16Test16\nPrioridad: media', 'pendiente', 'media', 18, 4, '2026-02-02 02:26:21', '2026-02-02 02:26:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- ========== ARCHIVOS DE REPORTES ==========
INSERT INTO `reportes_archivos` (`id`, `reporte_id`, `tipo_archivo`, `cloudflare_url`, `cloudflare_key`, `nombre_original`, `tamaño`, `created_at`, `updated_at`) VALUES
(1, 1, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768942825160-foto-1768942825145-0.jpg', 'reportes/fotos/1768942825160-foto-1768942825145-0.jpg', 'foto-1768942825145-0.jpg', NULL, '2026-01-20 21:00:25', '2026-01-20 21:00:25'),
(2, 2, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768945607170-foto-1768945605533-0.jpg', 'reportes/fotos/1768945607170-foto-1768945605533-0.jpg', 'foto-1768945605533-0.jpg', NULL, '2026-01-20 21:46:48', '2026-01-20 21:46:48'),
(3, 2, 'video', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/videos/1768945608541-video-1768945607014.mp4', 'reportes/videos/1768945608541-video-1768945607014.mp4', 'video-1768945607014.mp4', NULL, '2026-01-20 21:46:49', '2026-01-20 21:46:49'),
(4, 3, 'foto', 'https://pub-8ee5e0587a364399853ee43c6871ab1d.r2.dev/reportes/fotos/1769463950904-foto-1769463950867-0.jpg', 'reportes/fotos/1769463950904-foto-1769463950867-0.jpg', 'foto-1769463950867-0.jpg', NULL, '2026-01-26 21:45:51', '2026-01-26 21:45:51'),
(5, 3, 'video', 'https://pub-8ee5e0587a364399853ee43c6871ab1d.r2.dev/reportes/videos/1769463952018-video-1769463951994.mp4', 'reportes/videos/1769463952018-video-1769463951994.mp4', 'video-1769463951994.mp4', NULL, '2026-01-26 21:45:53', '2026-01-26 21:45:53');

-- ========== TAREAS ==========
INSERT INTO `tareas` (`id`, `titulo`, `descripcion`, `usuario_id`, `creada_por`, `estado`, `created_at`, `updated_at`, `admin_email`, `admin_nombre`, `empleado_email`) VALUES
(1, '', 'tarea1', NULL, NULL, 'completada', '2026-01-20 21:05:31', '2026-01-20 21:05:52', 'admin@simant.com', 'Admin', 'tr@gmail.com'),
(2, '', 'haz una comida', NULL, NULL, 'completada', '2026-01-31 23:34:33', '2026-01-31 23:35:00', 'admin@simant.com', 'Admin', 'tr@gmail.com'),
(3, '', 'dawdawdawd', NULL, NULL, 'pendiente', '2026-02-02 01:53:29', '2026-02-02 01:53:29', 'admin@simant.com', 'Admin', 'traba@simant.com');

-- Los permisos ya están configurados, no es necesario modificarlos
-- Los cotizaciones y encuestas se mantienen vacías como en la BD del compañero
