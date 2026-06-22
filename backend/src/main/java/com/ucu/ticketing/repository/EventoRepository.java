package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Evento;
import com.ucu.ticketing.rowmapper.EventoRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EventoRepository {

    private final JdbcTemplate jdbc;

    private static final String SELECT_RICO = """
        SELECT ev.id, ev.estadio_id, ev.admin_id, ev.fase_id,
               ev.equipo_local, ev.equipo_visitante, ev.fecha_hora,
               e.nombre AS estadio_nombre, e.pais AS estadio_pais, e.ciudad AS estadio_ciudad,
               f.nombre AS fase_nombre, f.orden AS fase_orden
        FROM ticketing.evento ev
        JOIN ticketing.estadio e ON e.id = ev.estadio_id
        JOIN ticketing.fase f ON f.id = ev.fase_id
        """;

    public Optional<Evento> findById(Long id) {
        return jdbc.query(SELECT_RICO + "WHERE ev.id = ?",
            new EventoRowMapper(), id).stream().findFirst();
    }

    public List<Evento> findByAdminId(Long adminId) {
        return jdbc.query(SELECT_RICO + "WHERE ev.admin_id = ? ORDER BY ev.fecha_hora",
            new EventoRowMapper(), adminId);
    }

    public List<Evento> findProximosFiltrados(LocalDateTime desde, String pais, Long estadioId) {
        StringBuilder sql = new StringBuilder(SELECT_RICO).append("WHERE ev.fecha_hora >= ?");
        List<Object> params = new ArrayList<>();
        params.add(Timestamp.valueOf(desde));

        if (pais != null) {
            sql.append(" AND e.pais = ?");
            params.add(pais);
        }
        if (estadioId != null) {
            sql.append(" AND ev.estadio_id = ?");
            params.add(estadioId);
        }
        sql.append(" ORDER BY ev.fecha_hora");
        return jdbc.query(sql.toString(), new EventoRowMapper(), params.toArray());
    }

    public Long insert(Long estadioId, Long adminId, Long faseId,
                       String equipoLocal, String equipoVisitante, LocalDateTime fechaHora) {
        String sql = """
            INSERT INTO ticketing.evento (estadio_id, admin_id, fase_id, equipo_local, equipo_visitante, fecha_hora)
            VALUES (?, ?, ?, ?, ?, ?)
            """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, estadioId);
            ps.setLong(2, adminId);
            ps.setLong(3, faseId);
            ps.setString(4, equipoLocal);
            ps.setString(5, equipoVisitante);
            ps.setTimestamp(6, Timestamp.valueOf(fechaHora));
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }
}
