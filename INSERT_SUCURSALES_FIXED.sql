-- Script para insertar sucursales en MySQL
-- Mapeo de UUIDs de Supabase a IDs de MySQL
-- PRIMERO: Resetear auto_increment de la tabla sucursales

ALTER TABLE sucursales AUTO_INCREMENT = 1;

-- Limpiar tabla para asegurar que esté vacía
TRUNCATE TABLE sucursales;

-- AHORA: Insertar todas las sucursales
INSERT INTO sucursales (empresa_id, nombre, direccion, ciudad, activo) VALUES
-- AB ALIMENTOS (empresa_id = 1)
(1, 'AB ALIMENTOS COCHIMALLI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', 'Mexicali', TRUE),
(1, 'AB ALIMENTOS DELIS MEXICALI', 'Blvd. Lazaro Cardenas 3596, 21800 Mexicali, B.C.', 'Mexicali', TRUE),
(1, 'AB ALIMENTOS BRISENAS', 'Gral. Agustin Olachea, Lazaro Cardenas 1409, C.P. 22880 Ensenada, B.C.', 'Ensenada', TRUE),
(1, 'AB ALIMENTOS COL HIPODROMO', '16 de Septiembre 2103, Zona Industrial, 21830 Tecate, B.C.', 'Tecate', TRUE),
(1, 'AB ALIMENTOS DUGES INDEPENDENCIA', 'Ave. Via Rapida Poniente, 1231, C.P. 22320, Col. 20 De Noviembre, Tijuana, B.C.', 'Tijuana', TRUE),
(1, 'AB ALIMENTOS BENITES', 'Privada Iguala, Gonzales S/N, C.P. 22415, Col. Sanchez Taboada, Tijuana, B.C.', 'Tijuana', TRUE),
(1, 'AB ALIMENTOS SAN QUINTIN', 'Ensenada - Lazaro Cardenas 1000, C.P. 22930, San Quintin, B.C.', 'San Quintin', TRUE),
(1, 'AB ALIMENTOS TORRELLANA TECATE', 'Guadalajara 254, Loma Alta, 21460 Tecate, B.C.', 'Tecate', TRUE),

-- AEROCOMIDAS (empresa_id = 2)
(2, 'AERODOMICAS HERMANOS LUPE SALAD B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'BURGER TIJUANA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'CARLS JR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', TRUE),
(2, 'SUBWAY SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'SUBWAY EXTERIOR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', TRUE),
(2, 'SUBWAY SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'DUNKIN DONUTS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'DUNKIN DONUTS SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'TACOS FRONTERA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', TRUE),
(2, 'STARBUCKS AEROPUERTO TIJUANA SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA A ALFA', 'Tijuana', TRUE),
(2, 'STARBUCKS AEROPUERTO TIJUANA SALA C', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. PASILLO CENTRAL', 'Tijuana', TRUE),
(2, 'STARBUCKS AEROPUERTO TIJUANA SALA D', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA EXTERIOR', 'Tijuana', TRUE),
(2, 'STARBUCKS AEROPUERTO TIJUANA SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA A BRAVO', 'Tijuana', TRUE),
(2, 'VIPS AEROPUERTO TIJUANA SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'VIPS AEROPUERTO TIJUANA SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'BAJA BAR', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'AB ABENDEHARA TIJUANA', 'AV. JOSE MARI MARTINEZ 1511 SECCION 18, C.P. 22018 COL. FERNANDEZ, TIJUANA, B.C.', 'Tijuana', TRUE),
(2, 'LAS FAMOSAS TORTAS', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'PANDA EXPRESS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'EL TACO BOOM', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'JOHNNY ROCKETS SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'JOHNNY ROCKETS SALA B', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'PETITE GOURMET', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA BRAVO', 'Tijuana', TRUE),
(2, 'PANDA EXPRESS SALA A', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'DOMINO´S PIZZA', 'Aeropuerto Abelardo L. Rodriguez, 22435 Tijuana, B.C. SALA ALFA', 'Tijuana', TRUE),
(2, 'MANTEQUILLA PENIBULA', 'Transpen Ote. 6090, Local L-82, Chapultepec Alamar, 22110 Tijuana, B.C.', 'Tijuana', TRUE),
(2, 'MANTEQUILLA HIPODROMO', 'Av. Tapachula 7, Chapultepec Este, 22020 Tijuana, B.C.', 'Tijuana', TRUE),
(2, 'MANTEQUILLA CACHO', 'Av. Celso St 15, Del Mexico, 22040 Tijuana, B.C.', 'Tijuana', TRUE),
(2, 'MANTEQUILLA PASEO DEL PARQUE', 'Ave. Parque Tematico 3, Del Mexico Del Sur, 22650, 22655, 22651 Tijuana, B.C.', 'Tijuana', TRUE),

-- PICARDS (empresa_id = 6)
(6, 'PICARDS SUPER MOR', 'Av. Melchor Ocampo 1973, Zona Centro, 22000 Tijuana, B.C.', 'Tijuana', TRUE),
(6, 'COMBO DEL ABRO TAMPICO SINRISA', 'Avda. Tampico 5900, Col. Los Alamos 3er Sect, 22410 Tijuana, B.C.', 'Tijuana', TRUE),

-- COCINAS INSTITUCIONALES (empresa_id = 8)
(8, 'TIENDA COCINAS INSTITUCIONALES', 'Boulevard Diaz Ordaz 14535, Presa Rural, 22106 San Noviembre, 22100 Tijuana, B.C.', 'Tijuana', TRUE),
(8, 'ALMACEN COCINAS INSTITUCIONALES', 'Av. Murios Martinez 1010 Pin 6, Fernandez, 22110 Tijuana, B.C.', 'Tijuana', TRUE),

-- BARISTI (empresa_id = 10)
(10, 'BARISTI OSTADORES PLAYAS', 'P. del Pedregal, Playas de Tijuana, Playas Coronado, 22504 Tijuana, B.C.', 'Tijuana', TRUE),
(10, 'BARISTI LAS PALMAS', 'Av. las Palmas 14751, Las Palmas, 22106 Tijuana, B.C.', 'Tijuana', TRUE),
(10, 'BARISTI OSTADORES RIO', 'P. de los Heroes 10001 Zona Urbana Rio Tijuana, 22010 Tijuana, B.C.', 'Tijuana', TRUE),

-- PANADERIA BOH (empresa_id = 3)
(3, 'PANADERIA BOH CACHO', 'Querétaro 2371, Col. Madero (Cacho), 22040 Tijuana, B.C.', 'Tijuana', TRUE),
(3, 'PANADERIA BOH SPA ETAPA DEL RIO', 'P.º del Río 7124, Planta baja, Río Tijuana 3a. Etapa, 22226 Tijuana, B.C.', 'Tijuana', TRUE),

-- ALSEA (empresa_id = 9)
(9, 'Aqui', 'Aqui', '', TRUE);

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_sucursales FROM sucursales;
