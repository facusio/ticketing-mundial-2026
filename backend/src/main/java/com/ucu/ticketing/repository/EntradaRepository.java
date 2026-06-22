package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Entrada;
import com.ucu.ticketing.rowmapper.EntradaRicaRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EntradaRepository {

    private final JdbcTemplate jdbc;

    private static final String SELECT_RICO = """
        SELECT e.id, e.venta_id, e.evento_id, e.sector_id, e.propietario_actual_id,
               e.precio, e.estado, e.transferencias_realizadas,
               s.codigo AS sector_codigo, s.capacidad_maxima AS sector_capacidad, s.estadio_id AS sector_estadio_id,
               est.nombre AS estadio_nombre,
               ev.equipo_local, ev.equipo_visitante, ev.fecha_hora AS evento_fecha_hora,
               u.id AS propietario_id, u.mail AS propietario_mail, u.numero_doc AS propietario_numero_doc
        FROM ticketing.entrada e
        JOIN ticketing.sector s ON s.id = e.sector_id
        JOIN ticketing.estadio est ON est.id = s.estadio_id
        JOIN ticketing.evento ev ON ev.id = e.evento_id
        JOIN ticketing.usuario u ON u.id = e.propietario_actual_id
        """;

    public Optional<Entrada> findById(Long id) {
        return jdbc.query(SELECT_RICO + "WHERE e.id = ?",
            new EntradaRicaRowMapper(), id).stream().findFirst();
    }

    public List<Entrada> findByPropietarioActualId(Long usuarioId) {
        return jdbc.query(SELECT_RICO + "WHERE e.propietario_actual_id = ?",
            new EntradaRicaRowMapper(), usuarioId);
    }

    public long countEntradasActivasByUsuarioYEvento(Long usuarioId, Long eventoId) {
        String sql = """
            SELECT COUNT(*) FROM ticketing.entrada e
            JOIN ticketing.venta v ON v.id = e.venta_id
            WHERE v.usuario_id = ? AND e.evento_id = ? AND e.estado != 'CONSUMIDA'
            """;
        Long count = jdbc.queryForObject(sql, Long.class, usuarioId, eventoId);
        return count != null ? count : 0L;
    }

    public Long insert(Long ventaId, Long eventoId, Long sectorId, Long propietarioActualId,
                       BigDecimal precio, String estado, short transferenciasRealizadas) {
        String sql = """
            INSERT INTO ticketing.entrada
                (venta_id, evento_id, sector_id, propietario_actual_id, precio, estado, transferencias_realizadas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, ventaId);
            ps.setLong(2, eventoId);
            ps.setLong(3, sectorId);
            ps.setLong(4, propietarioActualId);
            ps.setBigDecimal(5, precio);
            ps.setString(6, estado);
            ps.setShort(7, transferenciasRealizadas);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public void updateEstado(Long id, String estado) {
        jdbc.update("UPDATE ticketing.entrada SET estado = ? WHERE id = ?", estado, id);
    }

    public void updatePropietarioYEstado(Long id, Long nuevoPropietarioId, String estado) {
        jdbc.update(
            "UPDATE ticketing.entrada SET propietario_actual_id = ?, estado = ? WHERE id = ?",
            nuevoPropietarioId, estado, id);
    }

    public void confirmarTransferencia(Long id, Long nuevoPropietarioId) {
        jdbc.update(
            "UPDATE ticketing.entrada SET propietario_actual_id = ?, estado = 'ACTIVA', transferencias_realizadas = transferencias_realizadas + 1 WHERE id = ?",
            nuevoPropietarioId, id);
    }
}
