package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Transferencia;
import com.ucu.ticketing.rowmapper.TransferenciaRicaRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TransferenciaRepository {

    private final JdbcTemplate jdbc;

    private static final String SELECT_RICO = """
        SELECT t.id, t.entrada_id, t.origen_id, t.destino_id, t.fecha_hora, t.estado,
               e.estado AS entrada_estado, e.transferencias_realizadas, e.propietario_actual_id,
               e.evento_id,
               ev.equipo_local, ev.equipo_visitante,
               u_origen.mail AS origen_mail,
               u_destino.mail AS destino_mail
        FROM ticketing.transferencia t
        JOIN ticketing.entrada e ON e.id = t.entrada_id
        JOIN ticketing.evento ev ON ev.id = e.evento_id
        JOIN ticketing.usuario u_origen ON u_origen.id = t.origen_id
        JOIN ticketing.usuario u_destino ON u_destino.id = t.destino_id
        """;

    public Optional<Transferencia> findById(Long id) {
        return jdbc.query(SELECT_RICO + "WHERE t.id = ?",
            new TransferenciaRicaRowMapper(), id).stream().findFirst();
    }

    public List<Transferencia> findByDestinoIdAndEstado(Long destinoId, String estado) {
        return jdbc.query(SELECT_RICO + "WHERE t.destino_id = ? AND t.estado = ?",
            new TransferenciaRicaRowMapper(), destinoId, estado);
    }

    public Long insert(Long entradaId, Long origenId, Long destinoId, LocalDateTime fechaHora, String estado) {
        String sql = """
            INSERT INTO ticketing.transferencia (entrada_id, origen_id, destino_id, fecha_hora, estado)
            VALUES (?, ?, ?, ?, ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, entradaId);
            ps.setLong(2, origenId);
            ps.setLong(3, destinoId);
            ps.setTimestamp(4, Timestamp.valueOf(fechaHora));
            ps.setString(5, estado);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }

    public void updateEstado(Long id, String estado) {
        jdbc.update("UPDATE ticketing.transferencia SET estado = ? WHERE id = ?", estado, id);
    }
}
