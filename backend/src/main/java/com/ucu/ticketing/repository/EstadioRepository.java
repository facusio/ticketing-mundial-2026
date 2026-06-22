package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Estadio;
import com.ucu.ticketing.rowmapper.EstadioRowMapper;
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
public class EstadioRepository {

    private final JdbcTemplate jdbc;

    public Optional<Estadio> findById(Long id) {
        return jdbc.query(
            "SELECT id, admin_id, nombre, pais, ciudad FROM ticketing.estadio WHERE id = ?",
            new EstadioRowMapper(), id).stream().findFirst();
    }

    public List<Estadio> findAll() {
        return jdbc.query("SELECT id, admin_id, nombre, pais, ciudad FROM ticketing.estadio", new EstadioRowMapper());
    }

    public List<Estadio> findByAdminId(Long adminId) {
        return jdbc.query(
            "SELECT id, admin_id, nombre, pais, ciudad FROM ticketing.estadio WHERE admin_id = ?",
            new EstadioRowMapper(), adminId);
    }

    public Long insert(Long adminId, String nombre, String pais, String ciudad) {
        String sql = "INSERT INTO ticketing.estadio (admin_id, nombre, pais, ciudad) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, adminId);
            ps.setString(2, nombre);
            ps.setString(3, pais);
            ps.setString(4, ciudad);
            return ps;
        }, keyHolder);
        return keyHolder.getKey().longValue();
    }
}
