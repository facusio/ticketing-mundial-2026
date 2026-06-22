package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Fase;
import com.ucu.ticketing.rowmapper.FaseRowMapper;
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
public class FaseRepository {

    private final JdbcTemplate jdbc;

    public Optional<Fase> findById(Long id) {
        return jdbc.query(
            "SELECT id, nombre, orden FROM ticketing.fase WHERE id = ?",
            new FaseRowMapper(), id).stream().findFirst();
    }

    public List<Fase> findAll() {
        return jdbc.query("SELECT id, nombre, orden FROM ticketing.fase ORDER BY orden", new FaseRowMapper());
    }

    public Long insert(String nombre, int orden) {
        String sql = "INSERT INTO ticketing.fase (nombre, orden) VALUES (?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, nombre);
            ps.setInt(2, orden);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }
}
