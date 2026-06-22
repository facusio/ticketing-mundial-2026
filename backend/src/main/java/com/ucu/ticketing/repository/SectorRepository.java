package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Sector;
import com.ucu.ticketing.rowmapper.SectorRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SectorRepository {

    private final JdbcTemplate jdbc;

    public Optional<Sector> findById(Long id) {
        return jdbc.query(
            "SELECT id, estadio_id, codigo, capacidad_maxima FROM ticketing.sector WHERE id = ?",
            new SectorRowMapper(), id).stream().findFirst();
    }

    public List<Sector> findByEstadioId(Long estadioId) {
        return jdbc.query(
            "SELECT id, estadio_id, codigo, capacidad_maxima FROM ticketing.sector WHERE estadio_id = ?",
            new SectorRowMapper(), estadioId);
    }

    public Long insert(Long estadioId, String codigo, int capacidadMaxima) {
        String sql = "INSERT INTO ticketing.sector (estadio_id, codigo, capacidad_maxima) VALUES (?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, estadioId);
            ps.setString(2, codigo);
            ps.setInt(3, capacidadMaxima);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }
}
