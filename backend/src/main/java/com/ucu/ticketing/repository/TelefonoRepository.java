package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Telefono;
import com.ucu.ticketing.rowmapper.TelefonoRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TelefonoRepository {

    private final JdbcTemplate jdbc;

    public List<Telefono> findByUsuarioId(Long usuarioId) {
        return jdbc.query(
            "SELECT id, usuario_id, numero FROM ticketing.telefono WHERE usuario_id = ?",
            new TelefonoRowMapper(), usuarioId);
    }

    public void insert(Long usuarioId, String numero) {
        jdbc.update("INSERT INTO ticketing.telefono (usuario_id, numero) VALUES (?, ?)", usuarioId, numero);
    }
}
