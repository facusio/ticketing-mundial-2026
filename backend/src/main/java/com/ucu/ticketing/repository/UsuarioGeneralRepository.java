package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.UsuarioGeneral;
import com.ucu.ticketing.rowmapper.UsuarioGeneralRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UsuarioGeneralRepository {

    private final JdbcTemplate jdbc;

    public Optional<UsuarioGeneral> findById(Long usuarioId) {
        String sql = "SELECT usuario_id, fecha_registro, estado_verificacion FROM ticketing.usuario_general WHERE usuario_id = ?";
        return jdbc.query(sql, new UsuarioGeneralRowMapper(), usuarioId).stream().findFirst();
    }

    public boolean existsById(Long usuarioId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM ticketing.usuario_general WHERE usuario_id = ?", Integer.class, usuarioId);
        return count != null && count > 0;
    }

    public void insert(Long usuarioId, LocalDate fechaRegistro, String estadoVerificacion) {
        jdbc.update(
            "INSERT INTO ticketing.usuario_general (usuario_id, fecha_registro, estado_verificacion) VALUES (?, ?, ?)",
            usuarioId, java.sql.Date.valueOf(fechaRegistro), estadoVerificacion);
    }
}
