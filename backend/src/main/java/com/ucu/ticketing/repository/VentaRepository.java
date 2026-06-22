package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Venta;
import com.ucu.ticketing.rowmapper.VentaRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class VentaRepository {

    private final JdbcTemplate jdbc;

    public Optional<Venta> findById(Long id) {
        return jdbc.query(
            "SELECT id, usuario_id, fecha, estado, monto_total, tasa_comision FROM ticketing.venta WHERE id = ?",
            new VentaRowMapper(), id).stream().findFirst();
    }

    public List<Venta> findByUsuarioIdOrderByFechaDesc(Long usuarioId) {
        return jdbc.query(
            "SELECT id, usuario_id, fecha, estado, monto_total, tasa_comision FROM ticketing.venta WHERE usuario_id = ? ORDER BY fecha DESC",
            new VentaRowMapper(), usuarioId);
    }

    public Long insert(Long usuarioId, LocalDateTime fecha, String estado,
                       BigDecimal montoTotal, BigDecimal tasaComision) {
        String sql = """
            INSERT INTO ticketing.venta (usuario_id, fecha, estado, monto_total, tasa_comision)
            VALUES (?, ?, ?, ?, ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, usuarioId);
            ps.setTimestamp(2, Timestamp.valueOf(fecha));
            ps.setString(3, estado);
            ps.setBigDecimal(4, montoTotal);
            ps.setBigDecimal(5, tasaComision);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public void updateEstado(Long id, String estado) {
        jdbc.update("UPDATE ticketing.venta SET estado = ? WHERE id = ?", estado, id);
    }
}
