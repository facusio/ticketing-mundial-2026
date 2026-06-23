-- =============================================================================
-- DATOS DE PRUEBA — Sistema de Ticketing Mundial 2026
-- Ejecutar DESPUÉS de create.sql
-- Los hashes BCrypt fueron generados con Spring BCryptPasswordEncoder (cost 10)
-- =============================================================================

SET search_path = ticketing;

-- =============================================================================
-- USUARIOS (un INSERT por fila para evitar que un fallo cancele los demás)
-- =============================================================================

-- superadmin@mundial2026.com / super123
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('superadmin@mundial2026.com',
        '$2a$10$gqhHjKbFAGJCRF2wfgBc2uy2hbk83h5v4qpDtIxX.yRgmsNrRUrCq',
        'Uruguay', 'CI', '00000001', 'Uruguay', 'Montevideo', 'Constituyente', '1647', '11200',
        'SUPERADMIN')
ON CONFLICT (mail) DO NOTHING;

-- admin@mundial2026.com / admin123
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('admin@mundial2026.com',
        '$2a$10$0EV4aDoFJGE6yBRbCZEBzO36xJg11xModUb.z6g5zJTb6sT3asZB2',
        'Uruguay', 'CI', '11111111', 'Uruguay', 'Montevideo', 'Rivera', '1234', '11300',
        'ADMIN_PAIS')
ON CONFLICT (mail) DO NOTHING;

-- funcionario@mundial2026.com / func123
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('funcionario@mundial2026.com',
        '$2a$10$4WxV.wZIyMc0w/lKuus37O9rtrvhA6COphh0AdbFqEMfyp3LqnRLi',
        'Uruguay', 'CI', '22222222', 'Uruguay', 'Montevideo', 'Agraciada', '800', '11300',
        'FUNCIONARIO')
ON CONFLICT (mail) DO NOTHING;

-- usuario@mundial2026.com / user123
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('usuario@mundial2026.com',
        '$2a$10$TsbnuG2UUg9wGAw8RCqRq.aMDWv5bXH39hLmF1Q5LhzpvN4NG522q',
        'Uruguay', 'CI', '33333333', 'Uruguay', 'Montevideo', '18 de Julio', '500', '11100',
        'USUARIO_GENERAL')
ON CONFLICT (mail) DO NOTHING;

-- =============================================================================
-- SUBTIPOS
-- =============================================================================
INSERT INTO admin_pais (usuario_id, pais_jurisdiccion, fecha_asignacion)
SELECT id, 'Uruguay', CURRENT_DATE FROM usuario WHERE mail = 'admin@mundial2026.com'
ON CONFLICT DO NOTHING;

INSERT INTO funcionario (usuario_id, numero_legajo)
SELECT id, 'LEG-001' FROM usuario WHERE mail = 'funcionario@mundial2026.com'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_general (usuario_id, fecha_registro, estado_verificacion)
SELECT id, CURRENT_DATE, 'VERIFICADO' FROM usuario WHERE mail = 'usuario@mundial2026.com'
ON CONFLICT DO NOTHING;

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
WHERE e.nombre = 'Estadio Centenario'
ON CONFLICT (estadio_id, codigo) DO NOTHING;

-- =============================================================================
-- FASES
-- =============================================================================
INSERT INTO fase (nombre, orden) VALUES
    ('Fase de Grupos',   1),
    ('Octavos de Final', 2),
    ('Cuartos de Final', 3),
    ('Semifinal',        4),
    ('Final',            5)
ON CONFLICT (nombre) DO NOTHING;

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
JOIN estadio e ON e.id = s.estadio_id AND e.nombre = 'Estadio Centenario'
WHERE f.nombre IN ('Fase de Grupos', 'Octavos de Final', 'Cuartos de Final', 'Semifinal', 'Final')
ON CONFLICT (fase_id, sector_id) DO NOTHING;

-- =============================================================================
-- EVENTOS
-- =============================================================================
INSERT INTO evento (estadio_id, admin_id, fase_id, equipo_local, equipo_visitante, fecha_hora)
SELECT e.id, u.id, f.id, ev.local, ev.visitante, NOW() + ev.dias
FROM estadio e
JOIN usuario u ON u.mail = 'admin@mundial2026.com'
CROSS JOIN fase f
CROSS JOIN (VALUES
    ('Fase de Grupos',   'Argentina', 'Brasil',    INTERVAL '7 days'),
    ('Fase de Grupos',   'Uruguay',   'Colombia',  INTERVAL '10 days'),
    ('Octavos de Final', 'Argentina', 'Uruguay',   INTERVAL '20 days')
) AS ev(fase_nombre, local, visitante, dias)
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
WHERE s.codigo IN ('NORTE', 'SUR')
ON CONFLICT DO NOTHING;
