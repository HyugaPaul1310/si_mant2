-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-01-2026 a las 21:18:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `si_mant2`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizaciones`
--

CREATE TABLE `cotizaciones` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` longtext DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `empresa_id` int(11) DEFAULT NULL,
  `estado` enum('pendiente','aceptada','rechazada') DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `created_at`, `updated_at`) VALUES
(1, 'AB ALIMENTOS', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(2, 'AEROCOMIDAS', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(3, 'PANADERIA BOH', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(4, 'ZIBARIS HOLDING', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(5, 'MERA TIJUANA', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(6, 'PICARDS', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(7, 'HOla', '2025-12-18 06:45:03', '2025-12-18 06:45:03'),
(8, 'COCINAS INSTITUCIONALES', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(9, 'ALSEA', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(10, 'BARISTI', '2025-12-18 05:03:05', '2025-12-18 05:03:05'),
(11, 'test', '2026-01-20 04:47:26', '2026-01-20 04:47:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encuestas_satisfaccion`
--

CREATE TABLE `encuestas_satisfaccion` (
  `id` int(11) NOT NULL,
  `reporte_id` int(11) NOT NULL,
  `cliente_email` varchar(255) NOT NULL,
  `cliente_nombre` varchar(255) DEFAULT NULL,
  `empleado_email` varchar(255) DEFAULT NULL,
  `empleado_nombre` varchar(255) DEFAULT NULL,
  `empresa` varchar(255) DEFAULT NULL,
  `trato_equipo` varchar(50) DEFAULT NULL,
  `equipo_tecnico` varchar(50) DEFAULT NULL,
  `personal_administrativo` varchar(50) DEFAULT NULL,
  `rapidez` varchar(50) DEFAULT NULL,
  `costo_calidad` varchar(50) DEFAULT NULL,
  `recomendacion` varchar(50) DEFAULT NULL,
  `satisfaccion` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `encuestas_satisfaccion`
--

INSERT INTO `encuestas_satisfaccion` (`id`, `reporte_id`, `cliente_email`, `cliente_nombre`, `empleado_email`, `empleado_nombre`, `empresa`, `trato_equipo`, `equipo_tecnico`, `personal_administrativo`, `rapidez`, `costo_calidad`, `recomendacion`, `satisfaccion`, `created_at`, `updated_at`) VALUES
(1, 6, 'cliente@example.com', 'Juan Cliente', 'empleado@example.com', 'Carlos Técnico', 'Tech Solutions', 'Muy satisfecho', 'Satisfecho', 'Satisfecho', 'Muy satisfecho', 'Satisfecho', 'Sí', 'Muy satisfecho', '2026-01-19 23:59:16', '2026-01-19 23:59:16'),
(2, 6, 'juan@empresa.com', 'Juan García', 'carlos@tech.com', 'Carlos López', 'Tech Solutions', 'Muy satisfecho', 'Satisfecho', 'Muy satisfecho', 'Satisfecho', 'Satisfecho', 'Sí, definitivamente', 'Muy satisfecho', '2026-01-20 00:01:07', '2026-01-20 00:01:07'),
(3, 6, 'p@gmail.com', 'Paul', 'tr@gmail.com', 'manuel', 'AEROCOMIDAS', 'Excelente', 'Excelente', 'Excelente', 'Excelente', 'Excelente', 'Excelente', 'Excelente', '2026-01-20 02:23:01', '2026-01-20 02:23:01'),
(4, 3, 'p@gmail.com', 'Paul', 'tr@gmail.com', 'manuel', 'AEROCOMIDAS', 'Excelente', 'Excelente', 'Excelente', 'Excelente', 'Excelente', 'Excelente', 'Excelente', '2026-01-20 02:26:23', '2026-01-20 02:26:23'),
(5, 7, 'p@gmail.com', 'Paul', 'tr@gmail.com', 'manuel', 'AEROCOMIDAS', 'Excelente', 'Muy Bueno', 'Bueno', 'Regular', 'Muy Bueno', 'Muy Bueno', 'Regular', '2026-01-20 05:44:08', '2026-01-20 05:44:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_asignaciones`
--

CREATE TABLE `inventario_asignaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `herramienta_id` int(11) NOT NULL,
  `estado` enum('asignada','devuelta','perdida') DEFAULT 'asignada',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventario_asignaciones`
--

INSERT INTO `inventario_asignaciones` (`id`, `usuario_id`, `herramienta_id`, `estado`, `created_at`, `updated_at`) VALUES
(1, 7, 1, 'asignada', '2026-01-06 14:16:29', '2026-01-06 14:16:29'),
(2, 7, 3, 'devuelta', '2026-01-06 14:08:40', '2026-01-06 14:13:09'),
(3, 7, 2, 'perdida', '2026-01-04 12:42:34', '2026-01-06 14:13:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_herramientas`
--

CREATE TABLE `inventario_herramientas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` longtext DEFAULT NULL,
  `estado` enum('disponible','en_uso','mantenimiento') DEFAULT 'disponible',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `inventario_herramientas`
--

INSERT INTO `inventario_herramientas` (`id`, `nombre`, `descripcion`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'Were', '', 'disponible', '2026-01-06 14:16:29', '2026-01-06 14:16:29'),
(2, 'herramienta test', '', 'disponible', '2026-01-04 12:42:34', '2026-01-04 12:42:34'),
(3, 'paptillo', '', 'disponible', '2026-01-06 14:08:40', '2026-01-06 14:08:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id` int(11) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `permiso` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id`, `rol`, `permiso`) VALUES
(2, 'admin', 'crear_reportes'),
(3, 'admin', 'editar_reportes'),
(4, 'admin', 'eliminar_reportes'),
(6, 'admin', 'gestionar_tareas'),
(5, 'admin', 'gestionar_usuarios'),
(7, 'admin', 'ver_inventario'),
(1, 'admin', 'ver_reportes'),
(11, 'cliente', 'crear_reportes'),
(13, 'cliente', 'ver_cotizaciones'),
(12, 'cliente', 'ver_reportes_propios'),
(9, 'empleado', 'actualizar_reportes'),
(10, 'empleado', 'crear_cotizaciones'),
(8, 'empleado', 'ver_reportes_asignados');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` longtext DEFAULT NULL,
  `estado` enum('pendiente','en_proceso','terminado','cotizado','cerrado_por_cliente','finalizado_por_tecnico') DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `usuario_id` int(11) DEFAULT NULL,
  `empresa_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `empleado_asignado_id` int(11) DEFAULT NULL,
  `analisis_general` longtext DEFAULT NULL,
  `precio_cotizacion` decimal(10,2) DEFAULT NULL,
  `cerrado_por_cliente_at` timestamp NULL DEFAULT NULL,
  `revision` longtext DEFAULT NULL,
  `recomendaciones` longtext DEFAULT NULL,
  `reparacion` longtext DEFAULT NULL,
  `recomendaciones_adicionales` longtext DEFAULT NULL,
  `materiales_refacciones` longtext DEFAULT NULL,
  `trabajo_completado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reportes`
--

INSERT INTO `reportes` (`id`, `titulo`, `descripcion`, `estado`, `prioridad`, `usuario_id`, `empresa_id`, `created_at`, `updated_at`, `empleado_asignado_id`, `analisis_general`, `precio_cotizacion`, `cerrado_por_cliente_at`, `revision`, `recomendaciones`, `reparacion`, `recomendaciones_adicionales`, `materiales_refacciones`, `trabajo_completado`) VALUES
(1, 'aaaa - AB ABENDEHARA TIJUANA', 'Modelo: aaaa\nSerie: aaa\nSucursal: AB ABENDEHARA TIJUANA\nComentario: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\nPrioridad: urgente', 'en_proceso', '', 6, 2, '2026-01-16 06:12:14', '2026-01-20 00:50:37', 7, 'si como no', 10000.00, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(2, 'test2 - AB ABENDEHARA TIJUANA', 'Modelo: test2\nSerie: test2\nSucursal: AB ABENDEHARA TIJUANA\nComentario: test2222222222222222\nPrioridad: media', 'pendiente', 'media', 6, 2, '2026-01-17 05:13:43', '2026-01-20 05:37:06', 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(3, 'test3 - AB ABENDEHARA TIJUANA', 'Modelo: test3\nSerie: test3\nSucursal: AB ABENDEHARA TIJUANA\nComentario: test3333333333333333333\nPrioridad: media', 'terminado', 'media', 6, 2, '2026-01-17 05:15:51', '2026-01-20 04:07:39', 7, 'rev', 21.00, '2026-01-20 10:26:25', NULL, NULL, NULL, NULL, NULL, 1),
(4, 'test6 - BAJA BAR', 'Modelo: 6\nSerie: 6\nSucursal: BAJA BAR\nComentario: 6666666666666666666666666666666666666\nPrioridad: media', 'terminado', 'media', 6, 2, '2026-01-17 06:29:05', '2026-01-20 04:07:38', 7, 'funciono', 100.00, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(5, '04 - AERODOMICAS HERMANOS LUPE SALAD B', 'Modelo: 04\nSerie: 04\nSucursal: AERODOMICAS HERMANOS LUPE SALAD B\nComentario: 04444444444444444444444444444444444444444444\nPrioridad: baja', 'terminado', 'baja', 6, 2, '2026-01-17 20:47:55', '2026-01-20 04:07:37', 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(6, 'gab - AERODOMICAS HERMANOS LUPE SALAD B', 'Modelo: gab\nSerie: gab\nSucursal: AERODOMICAS HERMANOS LUPE SALAD B\nComentario: gabbbbbbbbbbbbbbbbbbbbbbbbbbb\nPrioridad: media', 'terminado', 'media', 6, 2, '2026-01-18 19:30:56', '2026-01-20 04:07:36', 7, 'realizado', 20.00, '2026-01-20 10:23:01', NULL, NULL, NULL, NULL, NULL, 1),
(7, 'te1 - BURGER TIJUANA', 'Modelo: ts1\nSerie: ts1\nSucursal: BURGER TIJUANA\nComentario: ts1tssssssssssssssssssssssssssss\nPrioridad: media', 'cerrado_por_cliente', 'media', 6, 2, '2026-01-20 05:36:23', '2026-01-20 05:44:09', 7, 'si', 1.00, '2026-01-20 13:44:09', NULL, NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes_archivos`
--

CREATE TABLE `reportes_archivos` (
  `id` int(11) NOT NULL,
  `reporte_id` int(11) NOT NULL,
  `tipo_archivo` varchar(50) DEFAULT NULL,
  `cloudflare_url` varchar(500) DEFAULT NULL,
  `cloudflare_key` varchar(255) DEFAULT NULL,
  `nombre_original` varchar(255) DEFAULT NULL,
  `tamaño` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reportes_archivos`
--

INSERT INTO `reportes_archivos` (`id`, `reporte_id`, `tipo_archivo`, `cloudflare_url`, `cloudflare_key`, `nombre_original`, `tamaño`, `created_at`, `updated_at`) VALUES
(1, 0, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768543934831-foto-1768543934754-0.jpg', 'reportes/fotos/1768543934831-foto-1768543934754-0.jpg', 'foto-1768543934754-0.jpg', NULL, '2026-01-16 06:12:15', '2026-01-16 06:12:15'),
(2, 0, 'video', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/videos/1768543935555-video-1768543935451.mp4', 'reportes/videos/1768543935555-video-1768543935451.mp4', 'video-1768543935451.mp4', NULL, '2026-01-16 06:12:15', '2026-01-16 06:12:15'),
(3, 3, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768626951847-foto-1768626951808-0.jpg', 'reportes/fotos/1768626951847-foto-1768626951808-0.jpg', 'foto-1768626951808-0.jpg', NULL, '2026-01-17 05:15:52', '2026-01-17 05:15:52'),
(4, 3, 'video', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/videos/1768626952538-video-1768626952536.mp4', 'reportes/videos/1768626952538-video-1768626952536.mp4', 'video-1768626952536.mp4', NULL, '2026-01-17 05:15:52', '2026-01-17 05:15:52'),
(5, 4, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768631346053-foto-1768631345736-0.jpg', 'reportes/fotos/1768631346053-foto-1768631345736-0.jpg', 'foto-1768631345736-0.jpg', NULL, '2026-01-17 06:29:06', '2026-01-17 06:29:06'),
(6, 4, 'video', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/videos/1768631346840-video-1768631346843.mp4', 'reportes/videos/1768631346840-video-1768631346843.mp4', 'video-1768631346843.mp4', NULL, '2026-01-17 06:29:07', '2026-01-17 06:29:07'),
(7, 5, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768682877194-foto-1768682876355-0.jpg', 'reportes/fotos/1768682877194-foto-1768682876355-0.jpg', 'foto-1768682876355-0.jpg', NULL, '2026-01-17 20:47:58', '2026-01-17 20:47:58'),
(8, 5, 'video', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/videos/1768682878274-video-1768682878263.mp4', 'reportes/videos/1768682878274-video-1768682878263.mp4', 'video-1768682878263.mp4', NULL, '2026-01-17 20:47:58', '2026-01-17 20:47:58'),
(9, 6, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768764656894-foto-1768764656616-0.jpg', 'reportes/fotos/1768764656894-foto-1768764656616-0.jpg', 'foto-1768764656616-0.jpg', NULL, '2026-01-18 19:30:57', '2026-01-18 19:30:57'),
(10, 6, 'video', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/videos/1768764657436-video-1768764657419.mp4', 'reportes/videos/1768764657436-video-1768764657419.mp4', 'video-1768764657419.mp4', NULL, '2026-01-18 19:30:57', '2026-01-18 19:30:57'),
(11, 7, 'foto', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/fotos/1768887388195-foto-1768887383857-0.jpg', 'reportes/fotos/1768887388195-foto-1768887383857-0.jpg', 'foto-1768887383857-0.jpg', NULL, '2026-01-20 05:36:29', '2026-01-20 05:36:29'),
(12, 7, 'video', 'https://pub-e8c25e844a39558f6eb805ef07d64514.r2.dev/reportes/videos/1768887389819-video-1768887389813.mp4', 'reportes/videos/1768887389819-video-1768887389813.mp4', 'video-1768887389813.mp4', NULL, '2026-01-20 05:36:30', '2026-01-20 05:36:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursales`
--

CREATE TABLE `sucursales` (
  `id` int(11) NOT NULL,
  `empresa_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sucursales`
--

INSERT INTO `sucursales` (`id`, `empresa_id`, `nombre`, `direccion`, `ciudad`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 'AB ALIMENTOS COCHIMALLI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', 'Mexicali', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(2, 1, 'AB ALIMENTOS DELIS MEXICALI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', 'Mexicali', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(3, 1, 'AB ALIMENTOS BRISENAS', 'Gral. Agustin Olachea, Lazaro Cardenas 1409, C.P. 22880 Ensenada, B.C.', 'Ensenada', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(4, 1, 'AB ALIMENTOS COL HIPODROMO', '16 de Septiembre 2103, Zona Industrial, 21830 Tecate, B.C.', 'Tecate', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(5, 1, 'AB ALIMENTOS DUGES INDEPENDENCIA', 'Ave. Via Rapida Poniente, 1231, C.P. 22320, Col. 20 De Noviembre, Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(6, 1, 'AB ALIMENTOS BENITES', 'Privada Iguala, Gonzales S/N, C.P. 22415, Col. Sanchez Taboada, Tijuana, B.C.', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(7, 1, 'AB ALIMENTOS SAN QUINTIN', 'Ensenada - Lazaro Cardenas 1000, C.P. 22930, San Quintin, B.C.', 'San Quintin', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(8, 1, 'AB ALIMENTOS TORRELLANA TECATE', 'Guadalajara 254, Loma Alta, 21460 Tecate, B.C.', 'Tecate', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(9, 2, 'AERODOMICAS HERMANOS LUPE SALAD B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(10, 2, 'BURGER TIJUANA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(11, 2, 'CARLS JR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(12, 2, 'SUBWAY SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(13, 2, 'SUBWAY EXTERIOR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(14, 2, 'SUBWAY SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
(15, 2, 'DUNKIN DONUTS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', 1, '2026-01-11 20:02:56', '2026-01-11 20:02:56'),
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
(48, 11, 'test', 'test', NULL, 1, '2026-01-20 04:47:47', '2026-01-20 04:47:47'),
(49, 1, 'test', 'test', NULL, 1, '2026-01-20 04:48:42', '2026-01-20 04:48:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` longtext DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `creada_por` int(11) DEFAULT NULL,
  `estado` enum('pendiente','en_proceso','en_progreso','completada','rechazada') DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `admin_email` varchar(255) DEFAULT NULL,
  `admin_nombre` varchar(255) DEFAULT NULL,
  `empleado_email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tareas`
--

INSERT INTO `tareas` (`id`, `titulo`, `descripcion`, `usuario_id`, `creada_por`, `estado`, `created_at`, `updated_at`, `admin_email`, `admin_nombre`, `empleado_email`) VALUES
(0, 'Tarea del administrador', 'ambulancia', 7, 4, 'pendiente', '2026-01-20 06:07:14', '2026-01-20 06:07:14', NULL, NULL, NULL),
(1, 'Tarea 1', 'Jzjxjdjdjjd', 7, 4, 'completada', '2025-12-18 17:57:44', '2025-12-28 07:02:01', NULL, NULL, NULL),
(2, 'Tarea 2', 'Linpiame kaspatas', 7, 4, 'completada', '2025-12-30 13:34:21', '2025-12-30 13:34:40', NULL, NULL, NULL),
(3, 'Tarea 3', 'Yapap', 7, 4, 'completada', '2026-01-06 14:16:46', '2026-01-06 14:24:20', NULL, NULL, NULL),
(4, 'Tarea 4', 'tarea', 7, 4, 'completada', '2025-12-18 13:32:26', '2025-12-18 13:59:51', NULL, NULL, NULL),
(5, 'Tarea 5', 'Ssss', 7, 4, 'pendiente', '2025-12-18 17:57:37', '2025-12-18 17:57:37', NULL, NULL, NULL),
(6, 'Tarea 6', 'dw1313w33', 7, 4, 'pendiente', '2025-12-18 17:54:26', '2025-12-18 17:54:26', NULL, NULL, NULL),
(7, 'Tarea 7', 'haz una ya', 7, 4, 'pendiente', '2025-12-18 17:27:51', '2025-12-18 17:27:51', NULL, NULL, NULL),
(8, 'Tarea 8', 'dawdawdwd', 7, 4, 'pendiente', '2025-12-18 17:54:20', '2025-12-18 17:54:20', NULL, NULL, NULL),
(9, 'Tarea 9', 'Limpia los carros', 7, 4, 'pendiente', '2025-12-18 16:03:50', '2025-12-18 16:03:50', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `empresa_id` int(11) DEFAULT NULL,
  `rol` enum('cliente','empleado','admin') DEFAULT 'cliente',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `contraseña`, `telefono`, `fecha_nacimiento`, `ciudad`, `empresa_id`, `rol`, `estado`, `created_at`, `updated_at`) VALUES
(4, 'Admin', 'Principal', 'admin@simant.com', '$2b$10$TdjeLR6CrQb/OGe.F8EgXOm6QMPszt63IXCbCk47IK/0JtNTPIWoe', '0000000000', NULL, NULL, NULL, 'admin', 'activo', '2025-12-13 09:23:15', '2026-01-11 18:54:15'),
(6, 'Paul', 'Gonzalez', 'p@gmail.com', '$2b$10$htB5mc6j37WfN5viz5Xf1OYlfWOVZQ7Zm.Vn2WE/89/RmN2GEghUm', NULL, NULL, 'Baja California', 2, 'cliente', 'activo', '2025-12-16 05:15:42', '2026-01-11 19:26:38'),
(7, 'manuel', 'molina', 'tr@gmail.com', '$2b$10$yUUpBwDs2UNQJ0FJXmN1deXA2Ape55MFLzlgG/cO9ewnMeyv1ggFy', '6863123', '2002-03-12', 'ciudad', 2, 'empleado', 'activo', '2025-12-16 01:10:21', '2026-01-11 19:26:38'),
(12, 'Chupi', 'Chupu', 'ch@gmail.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', NULL, NULL, NULL, 7, 'cliente', 'inactivo', '2025-12-18 07:33:29', '2026-01-10 06:46:37'),
(13, 'Jorge', 'Perez', 'l@gmail.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6864701708', NULL, NULL, 7, 'cliente', 'inactivo', '2025-12-18 07:38:08', '2026-01-10 06:46:37'),
(14, 'Paul', 'Gonzalez', 'gon@simant.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6863413633', '2002-12-22', 'Baja California, Mexicali', 9, 'cliente', 'activo', '2025-12-30 12:17:59', '2026-01-10 06:46:37'),
(15, 'paul', 'gonzales', 'paul@simant.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6863413632', '2002-12-21', 'Baja California, mexicali', 1, 'cliente', 'activo', '2026-01-08 14:18:45', '2026-01-10 06:46:38'),
(16, 'eduardo', 'padilla', 'eduardo@simant.ccom', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P6FSK2', '6863413632', '2002-04-12', 'Baja California, mexicali', 9, 'cliente', 'activo', '2026-01-08 14:28:37', '2026-01-10 06:46:38');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `empresa_id` (`empresa_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_usuario` (`usuario_id`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nombre` (`nombre`);

--
-- Indices de la tabla `encuestas_satisfaccion`
--
ALTER TABLE `encuestas_satisfaccion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reporte_id` (`reporte_id`),
  ADD KEY `idx_cliente_email` (`cliente_email`),
  ADD KEY `idx_empleado_email` (`empleado_email`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indices de la tabla `inventario_asignaciones`
--
ALTER TABLE `inventario_asignaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_herramienta` (`herramienta_id`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `inventario_herramientas`
--
ALTER TABLE `inventario_herramientas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_nombre` (`nombre`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_rol_permiso` (`rol`,`permiso`),
  ADD KEY `idx_rol` (`rol`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_empresa` (`empresa_id`),
  ADD KEY `empleado_asignado_id` (`empleado_asignado_id`);

--
-- Indices de la tabla `reportes_archivos`
--
ALTER TABLE `reportes_archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reporte` (`reporte_id`);

--
-- Indices de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `empresa_id` (`empresa_id`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creada_por` (`creada_por`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `empresa_id` (`empresa_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_rol` (`rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `encuestas_satisfaccion`
--
ALTER TABLE `encuestas_satisfaccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `reportes_archivos`
--
ALTER TABLE `reportes_archivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `sucursales`
--
ALTER TABLE `sucursales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD CONSTRAINT `cotizaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cotizaciones_ibfk_2` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `encuestas_satisfaccion`
--
ALTER TABLE `encuestas_satisfaccion`
  ADD CONSTRAINT `encuestas_satisfaccion_ibfk_1` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario_asignaciones`
--
ALTER TABLE `inventario_asignaciones`
  ADD CONSTRAINT `inventario_asignaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventario_asignaciones_ibfk_2` FOREIGN KEY (`herramienta_id`) REFERENCES `inventario_herramientas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reportes_ibfk_2` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reportes_ibfk_3` FOREIGN KEY (`empleado_asignado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `reportes_archivos`
--
ALTER TABLE `reportes_archivos`
  ADD CONSTRAINT `reportes_archivos_ibfk_1` FOREIGN KEY (`reporte_id`) REFERENCES `reportes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sucursales`
--
ALTER TABLE `sucursales`
  ADD CONSTRAINT `sucursales_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`);

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`creada_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
