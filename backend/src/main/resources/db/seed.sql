-- =============================================================================
-- DATOS DE PRUEBA — Sistema de Ticketing Mundial 2026
-- Ejecutar DESPUÉS de create.sql
-- Los hashes BCrypt fueron generados con Spring BCryptPasswordEncoder (cost 10)
-- Este script es IDEMPOTENTE: puede ejecutarse varias veces sin duplicar datos
-- =============================================================================

SET search_path = ticketing;

-- =============================================================================
-- USUARIOS
-- =============================================================================

-- superadmin@mundial2026.com / test1234
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('superadmin@mundial2026.com',
        '$2a$10$FbyuqJ2PVnyWVrAKecrjTe6I/6yFKi7p0bG2MC.zbuNkCuoKwX8aa',
        'Uruguay', 'CI', '00000001', 'Uruguay', 'Montevideo', 'Constituyente', '1647', '11200',
        'SUPERADMIN')
ON CONFLICT (mail) DO NOTHING;

-- admin@mundial2026.com / test1234
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('admin@mundial2026.com',
        '$2a$10$FbyuqJ2PVnyWVrAKecrjTe6I/6yFKi7p0bG2MC.zbuNkCuoKwX8aa',
        'Uruguay', 'CI', '11111111', 'Uruguay', 'Montevideo', 'Rivera', '1234', '11300',
        'ADMIN_PAIS')
ON CONFLICT (mail) DO NOTHING;

-- funcionario@mundial2026.com / test1234
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('funcionario@mundial2026.com',
        '$2a$10$FbyuqJ2PVnyWVrAKecrjTe6I/6yFKi7p0bG2MC.zbuNkCuoKwX8aa',
        'Uruguay', 'CI', '22222222', 'Uruguay', 'Montevideo', 'Agraciada', '800', '11300',
        'FUNCIONARIO')
ON CONFLICT (mail) DO NOTHING;

-- usuario@mundial2026.com / test1234
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('usuario@mundial2026.com',
        '$2a$10$FbyuqJ2PVnyWVrAKecrjTe6I/6yFKi7p0bG2MC.zbuNkCuoKwX8aa',
        'Uruguay', 'CI', '33333333', 'Uruguay', 'Montevideo', '18 de Julio', '500', '11100',
        'USUARIO_GENERAL')
ON CONFLICT (mail) DO NOTHING;

-- hincha2@mundial2026.com / test1234  (segundo comprador para enriquecer reportes)
INSERT INTO usuario (mail, password, pais_doc, tipo_doc, numero_doc, pais_dir, localidad, calle, numero_dir, codigo_postal, rol)
VALUES ('hincha2@mundial2026.com',
        '$2a$10$FbyuqJ2PVnyWVrAKecrjTe6I/6yFKi7p0bG2MC.zbuNkCuoKwX8aa',
        'Argentina', 'DNI', '44444444', 'Argentina', 'Buenos Aires', 'Corrientes', '1000', 'C1043',
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

INSERT INTO usuario_general (usuario_id, fecha_registro, estado_verificacion)
SELECT id, CURRENT_DATE, 'VERIFICADO' FROM usuario WHERE mail = 'hincha2@mundial2026.com'
ON CONFLICT DO NOTHING;

INSERT INTO telefono (usuario_id, numero)
SELECT id, '+598 91 111 111' FROM usuario WHERE mail = 'usuario@mundial2026.com'
AND NOT EXISTS (
    SELECT 1 FROM telefono t
    WHERE t.usuario_id = (SELECT id FROM usuario WHERE mail = 'usuario@mundial2026.com')
      AND t.numero = '+598 91 111 111'
);

INSERT INTO telefono (usuario_id, numero)
SELECT id, '+54 11 4444 4444' FROM usuario WHERE mail = 'hincha2@mundial2026.com'
AND NOT EXISTS (
    SELECT 1 FROM telefono t
    WHERE t.usuario_id = (SELECT id FROM usuario WHERE mail = 'hincha2@mundial2026.com')
      AND t.numero = '+54 11 4444 4444'
);

-- =============================================================================
-- ESTADIO Y SECTORES
-- =============================================================================
INSERT INTO estadio (admin_id, nombre, pais, ciudad)
SELECT id, 'Estadio Centenario', 'Uruguay', 'Montevideo'
FROM usuario WHERE mail = 'admin@mundial2026.com'
AND NOT EXISTS (
    SELECT 1 FROM estadio e
    WHERE e.admin_id = (SELECT id FROM usuario WHERE mail = 'admin@mundial2026.com')
      AND e.nombre = 'Estadio Centenario'
);

INSERT INTO sector (estadio_id, codigo, capacidad_maxima)
SELECT e.id, s.codigo, s.cap
FROM estadio e
CROSS JOIN (VALUES ('NORTE', 5000), ('SUR', 5000), ('PALCO', 1000)) AS s(codigo, cap)
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
    ('Fase de Grupos',   'Argentina', 'Brasil',       INTERVAL '7  days'),
    ('Fase de Grupos',   'Uruguay',   'Colombia',     INTERVAL '10 days'),
    ('Fase de Grupos',   'México',    'Estados Unidos',INTERVAL '12 days'),
    ('Octavos de Final', 'Argentina', 'Uruguay',      INTERVAL '20 days'),
    ('Cuartos de Final', 'Brasil',    'Colombia',     INTERVAL '30 days')
) AS ev(fase_nombre, local, visitante, dias)
WHERE e.nombre = 'Estadio Centenario'
  AND f.nombre = ev.fase_nombre
  AND NOT EXISTS (
      SELECT 1 FROM evento ex
      WHERE ex.estadio_id = e.id
        AND ex.equipo_local = ev.local
        AND ex.equipo_visitante = ev.visitante
  );

-- =============================================================================
-- ASIGNAR FUNCIONARIO AL SECTOR PALCO
-- =============================================================================
INSERT INTO funcionario_sector (funcionario_id, sector_id)
SELECT fu.usuario_id, s.id
FROM funcionario fu
JOIN usuario u ON u.id = fu.usuario_id AND u.mail = 'funcionario@mundial2026.com'
JOIN sector s ON s.codigo = 'PALCO'
JOIN estadio e ON e.id = s.estadio_id AND e.nombre = 'Estadio Centenario'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VENTAS Y ENTRADAS DE MUESTRA (para que los reportes muestren datos)
-- usuario@mundial2026.com compra entradas al primer evento de Fase de Grupos
-- hincha2@mundial2026.com compra al segundo evento
-- =============================================================================
DO $$
DECLARE
    v_usuario1_id   INTEGER;
    v_usuario2_id   INTEGER;
    v_evento1_id    INTEGER;
    v_evento2_id    INTEGER;
    v_evento3_id    INTEGER;
    v_sector_norte  INTEGER;
    v_sector_sur    INTEGER;
    v_sector_palco  INTEGER;
    v_fase1_id      INTEGER;
    v_venta_id      INTEGER;
    v_precio_norte  NUMERIC;
    v_precio_sur    NUMERIC;
    v_precio_palco  NUMERIC;
BEGIN
    -- IDs de usuarios
    SELECT id INTO v_usuario1_id FROM usuario WHERE mail = 'usuario@mundial2026.com';
    SELECT id INTO v_usuario2_id FROM usuario WHERE mail = 'hincha2@mundial2026.com';

    -- IDs de sectores
    SELECT s.id INTO v_sector_norte
    FROM sector s JOIN estadio e ON e.id = s.estadio_id
    WHERE e.nombre = 'Estadio Centenario' AND s.codigo = 'NORTE';

    SELECT s.id INTO v_sector_sur
    FROM sector s JOIN estadio e ON e.id = s.estadio_id
    WHERE e.nombre = 'Estadio Centenario' AND s.codigo = 'SUR';

    SELECT s.id INTO v_sector_palco
    FROM sector s JOIN estadio e ON e.id = s.estadio_id
    WHERE e.nombre = 'Estadio Centenario' AND s.codigo = 'PALCO';

    -- Fase de grupos
    SELECT id INTO v_fase1_id FROM fase WHERE nombre = 'Fase de Grupos';

    -- Precios fase de grupos
    SELECT fs.precio INTO v_precio_norte
    FROM fase_sector fs WHERE fs.fase_id = v_fase1_id AND fs.sector_id = v_sector_norte;

    SELECT fs.precio INTO v_precio_sur
    FROM fase_sector fs WHERE fs.fase_id = v_fase1_id AND fs.sector_id = v_sector_sur;

    SELECT fs.precio INTO v_precio_palco
    FROM fase_sector fs WHERE fs.fase_id = v_fase1_id AND fs.sector_id = v_sector_palco;

    -- Evento 1: Argentina vs Brasil
    SELECT id INTO v_evento1_id FROM evento
    WHERE equipo_local = 'Argentina' AND equipo_visitante = 'Brasil' LIMIT 1;

    -- Evento 2: Uruguay vs Colombia
    SELECT id INTO v_evento2_id FROM evento
    WHERE equipo_local = 'Uruguay' AND equipo_visitante = 'Colombia' LIMIT 1;

    -- Evento 3: México vs Estados Unidos
    SELECT id INTO v_evento3_id FROM evento
    WHERE equipo_local = 'México' AND equipo_visitante = 'Estados Unidos' LIMIT 1;

    -- Venta 1: usuario@mundial2026.com compra 2 entradas a Argentina vs Brasil (NORTE + PALCO)
    IF v_usuario1_id IS NOT NULL AND v_evento1_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM venta WHERE usuario_id = v_usuario1_id AND
                       id IN (SELECT venta_id FROM entrada WHERE evento_id = v_evento1_id)) THEN

        INSERT INTO venta (usuario_id, fecha, estado, monto_total, tasa_comision)
        VALUES (v_usuario1_id, NOW() - INTERVAL '2 days', 'PAGA',
                ROUND((v_precio_norte + v_precio_palco) * 1.05, 2), 0.05)
        RETURNING id INTO v_venta_id;

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento1_id, v_sector_norte, v_usuario1_id, v_precio_norte, 'ACTIVA', 0);

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento1_id, v_sector_palco, v_usuario1_id, v_precio_palco, 'ACTIVA', 0);
    END IF;

    -- Venta 2: usuario@mundial2026.com compra 1 entrada a Uruguay vs Colombia (SUR)
    IF v_usuario1_id IS NOT NULL AND v_evento2_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM venta WHERE usuario_id = v_usuario1_id AND
                       id IN (SELECT venta_id FROM entrada WHERE evento_id = v_evento2_id)) THEN

        INSERT INTO venta (usuario_id, fecha, estado, monto_total, tasa_comision)
        VALUES (v_usuario1_id, NOW() - INTERVAL '1 day', 'PAGA',
                ROUND(v_precio_sur * 1.05, 2), 0.05)
        RETURNING id INTO v_venta_id;

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento2_id, v_sector_sur, v_usuario1_id, v_precio_sur, 'ACTIVA', 0);
    END IF;

    -- Venta 3: hincha2@mundial2026.com compra 3 entradas (Argentina vs Brasil: 2xNORTE + 1xSUR)
    IF v_usuario2_id IS NOT NULL AND v_evento1_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM venta WHERE usuario_id = v_usuario2_id AND
                       id IN (SELECT venta_id FROM entrada WHERE evento_id = v_evento1_id)) THEN

        INSERT INTO venta (usuario_id, fecha, estado, monto_total, tasa_comision)
        VALUES (v_usuario2_id, NOW() - INTERVAL '3 days', 'PAGA',
                ROUND((v_precio_norte * 2 + v_precio_sur) * 1.05, 2), 0.05)
        RETURNING id INTO v_venta_id;

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento1_id, v_sector_norte, v_usuario2_id, v_precio_norte, 'ACTIVA', 0);

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento1_id, v_sector_norte, v_usuario2_id, v_precio_norte, 'ACTIVA', 0);

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento1_id, v_sector_sur, v_usuario2_id, v_precio_sur, 'ACTIVA', 0);
    END IF;

    -- Venta 4: hincha2@mundial2026.com compra entradas a México vs Estados Unidos (PALCO)
    IF v_usuario2_id IS NOT NULL AND v_evento3_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM venta WHERE usuario_id = v_usuario2_id AND
                       id IN (SELECT venta_id FROM entrada WHERE evento_id = v_evento3_id)) THEN

        INSERT INTO venta (usuario_id, fecha, estado, monto_total, tasa_comision)
        VALUES (v_usuario2_id, NOW() - INTERVAL '1 day', 'PAGA',
                ROUND(v_precio_palco * 2 * 1.05, 2), 0.05)
        RETURNING id INTO v_venta_id;

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento3_id, v_sector_palco, v_usuario2_id, v_precio_palco, 'ACTIVA', 0);

        INSERT INTO entrada (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
        VALUES (v_venta_id, v_evento3_id, v_sector_palco, v_usuario2_id, v_precio_palco, 'ACTIVA', 0);
    END IF;
END $$;
