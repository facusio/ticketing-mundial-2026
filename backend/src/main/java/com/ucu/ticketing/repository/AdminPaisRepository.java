package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.AdminPais;
import com.ucu.ticketing.rowmapper.AdminPaisRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AdminPaisRepository {

    private final JdbcTemplate jdbc;

    public Optional<AdminPais> findById(Long usuarioId) {
        String sql = "SELECT usuario_id, pais_jurisdiccion, fecha_asignacion FROM ticketing.admin_pais WHERE usuario_id = ?";
        return jdbc.query(sql, new AdminPaisRowMapper(), usuarioId).stream().findFirst();
    }

    public void insert(Long usuarioId, String paisJurisdiccion, LocalDate fechaAsignacion) {
        jdbc.update(
            "INSERT INTO ticketing.admin_pais (usuario_id, pais_jurisdiccion, fecha_asignacion) VALUES (?, ?, ?)",
            usuarioId, paisJurisdiccion, java.sql.Date.valueOf(fechaAsignacion));
    }
}
