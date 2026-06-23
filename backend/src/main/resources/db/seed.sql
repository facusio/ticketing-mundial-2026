-- =============================================================================
-- DATOS DE PRUEBA — Sistema de Ticketing Mundial 2026
-- Ejecutar DESPUÉS de create.sql
-- Requiere la extensión pgcrypto (incluida en PostgreSQL por defecto)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET search_path = ticketing;

-- =============================================================================
-- USUARIOS (uno por rol)
-- =============================================================================
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES
    ('superadmin@mundial2026.com',
     crypt('super123', gen_salt('bf', 10)),
     'Uruguay', 'CI', '00000001', 'Uruguay', 'Montevideo', 'Constituyente', '1647', '11200',
     'SUPERADMIN'),

    ('admin@mundial2026.com',
     crypt('admin123', gen_salt('bf', 10)),
     'Uruguay', 'CI', '11111111', 'Uruguay', 'Montevideo', 'Rivera', '1234', '11300',
     'ADMIN_PAIS'),

    ('funcionario@mundial2026.com',
     crypt('func123', gen_salt('bf', 10)),
     'Uruguay', 'CI', '22222222', 'Uruguay', 'Montevideo', 'Agraciada', '800', '11300',
     'FUNCIONARIO'),

    ('usuario@mundial2026.com',
     crypt('user123', gen_salt('bf', 10)),
     'Uruguay', 'CI', '33333333', 'Uruguay', 'Montevideo', '18 de Julio', '500', '11100',
     'USUARIO_GENERAL');

-- Subtipos
INSERT INTO admin_pais (usuario_id, pais_jurisdiccion, fecha_asignacion)
SELECT id, 'Uruguay', CURRENT_DATE FROM usuario WHERE mail = 'admin@mundial2026.com';

INSERT INTO funcionario (usuario_id, numero_legajo)
SELECT id, 'LEG-001' FROM usuario WHERE mail = 'funcionario@mundial2026.com';

INSERT INTO usuario_general (usuario_id, fecha_registro, estado_verificacion)
SELECT id, CURRENT_DATE, 'VERIFICADO' FROM usuario WHERE mail = 'usuario@mundial2026.com';

INSERT INTO telefono (usuario_id, numero)
SELECT id, '+598 91 111 111' FROM usuario WHERE mail = 'usuario@mundial2026.com';

-- =============================================================================
-- ESTADIO Y SECTORES
-- =============================================================================
INSERT INTO estadio (admin_id, nombre, pais, ciudad)
SELECT id, 'Estadio Centenario', 'Uruguay', 'Montevideo'
FROM usuario WHERE mail = 'admin@mundial2026.com';

INSERT INTO sector (estadio_id, codigo, capacidad_maxima)
SELECT e.id, s.codigo, s.cap
FROM estadio e
CROSS JOIN (VALUES ('NORTE', 500), ('SUR', 500), ('PALCO', 200)) AS s(codigo, cap)
WHERE e.nombre = 'Estadio Centenario';

-- =============================================================================
-- FASES
-- =============================================================================
INSERT INTO fase (nombre, orden) VALUES
    ('Fase de Grupos', 1),
    ('Octavos de Final', 2),
    ('Cuartos de Final', 3),
    ('Semifinal', 4),
    ('Final', 5);

-- =============================================================================
-- PRECIOS POR FASE Y SECTOR
-- =============================================================================
INSERT INTO fase_sector (fase_id, sector_id, precio)
SELECT f.id, s.id,
    CASE f.nombre
        WHEN 'Fase de Grupos'   THEN CASE s.codigo WHEN 'NORTE' THEN  80.00 WHEN 'SUR' THEN  60.00 ELSE 150.00 END
        WHEN 'Octavos de Final' THEN CASE s.codigo WHEN 'NORTE' THEN 120.00 WHEN 'SUR' THEN  90.00 ELSE 220.00 END
        WHEN 'Cuartos de Final' THEN CASE s.codigo WHEN 'NORTE' THEN 180.00 WHEN 'SUR' THEN 140.00 ELSE 320.00 END
        WHEN 'Semifinal'        THEN CASE s.codigo WHEN 'NORTE' THEN 250.00 WHEN 'SUR' THEN 200.00 ELSE 450.00 END
        WHEN 'Final'            THEN CASE s.codigo WHEN 'NORTE' THEN 400.00 WHEN 'SUR' THEN 320.00 ELSE 700.00 END
    END
FROM fase f
CROSS JOIN sector s
JOIN estadio e ON e.id = s.estadio_id AND e.nombre = 'Estadio Centenario';

-- =============================================================================
-- EVENTOS (3 partidos de prueba)
-- =============================================================================
INSERT INTO evento (estadio_id, admin_id, fase_id, equipo_local, equipo_visitante, fecha_hora)
SELECT e.id, u.id, f.id, ev.local, ev.visitante, NOW() + ev.offset_days
FROM estadio e
JOIN usuario u ON u.mail = 'admin@mundial2026.com'
CROSS JOIN fase f
CROSS JOIN (VALUES
    ('Fase de Grupos', 'Argentina',  'Brasil',    INTERVAL '7 days'),
    ('Fase de Grupos', 'Uruguay',    'Colombia',  INTERVAL '10 days'),
    ('Octavos de Final', 'Argentina', 'Uruguay',  INTERVAL '20 days')
) AS ev(fase_nombre, local, visitante, offset_days)
WHERE e.nombre = 'Estadio Centenario'
  AND f.nombre = ev.fase_nombre;

-- =============================================================================
-- ASIGNAR FUNCIONARIO A SECTORES NORTE Y SUR
-- =============================================================================
INSERT INTO funcionario_sector (funcionario_id, sector_id)
SELECT fu.usuario_id, s.id
FROM funcionario fu
JOIN usuario u ON u.id = fu.usuario_id AND u.mail = 'funcionario@mundial2026.com'
CROSS JOIN sector s
JOIN estadio e ON e.id = s.estadio_id AND e.nombre = 'Estadio Centenario'
WHERE s.codigo IN ('NORTE', 'SUR');
