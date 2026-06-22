package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.TokenQr;
import com.ucu.ticketing.rowmapper.TokenQrRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TokenQrRepository {

    private final JdbcTemplate jdbc;

    private static final String SELECT_RICO = """
        SELECT tq.id, tq.entrada_id, tq.codigo, tq.generado_en, tq.expira_en, tq.activo,
               e.venta_id, e.evento_id, e.sector_id, e.propietario_actual_id,
               e.precio AS entrada_precio, e.estado AS entrada_estado, e.transferencias_realizadas,
               s.codigo AS sector_codigo, s.estadio_id AS sector_estadio_id,
               est.nombre AS estadio_nombre,
               ev.equipo_local, ev.equipo_visitante, ev.fecha_hora AS evento_fecha_hora,
               u.id AS propietario_id, u.mail AS propietario_mail, u.numero_doc AS propietario_numero_doc
        FROM ticketing.token_qr tq
        JOIN ticketing.entrada e ON e.id = tq.entrada_id
        JOIN ticketing.sector s ON s.id = e.sector_id
        JOIN ticketing.estadio est ON est.id = s.estadio_id
        JOIN ticketing.evento ev ON ev.id = e.evento_id
        JOIN ticketing.usuario u ON u.id = e.propietario_actual_id
        """;

    public Optional<TokenQr> findByCodigo(String codigo) {
        return jdbc.query(SELECT_RICO + "WHERE tq.codigo = ?",
            new TokenQrRowMapper(), codigo).stream().findFirst();
    }

    public Optional<TokenQr> findByEntradaIdAndActivoTrue(Long entradaId) {
        return jdbc.query(SELECT_RICO + "WHERE tq.entrada_id = ? AND tq.activo = true",
            new TokenQrRowMapper(), entradaId).stream().findFirst();
    }

    public Long insert(Long entradaId, String codigo, LocalDateTime generadoEn, LocalDateTime expiraEn, boolean activo) {
        String sql = """
            INSERT INTO ticketing.token_qr (entrada_id, codigo, generado_en, expira_en, activo)
            VALUES (?, ?, ?, ?, ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, entradaId);
            ps.setString(2, codigo);
            ps.setTimestamp(3, Timestamp.valueOf(generadoEn));
            ps.setTimestamp(4, Timestamp.valueOf(expiraEn));
            ps.setBoolean(5, activo);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public void desactivarTokensActivos(Long entradaId) {
        jdbc.update(
            "UPDATE ticketing.token_qr SET activo = false WHERE entrada_id = ? AND activo = true",
            entradaId);
    }
}
