package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.Funcionario;
import com.ucu.ticketing.rowmapper.FuncionarioRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FuncionarioRepository {

    private final JdbcTemplate jdbc;

    public Optional<Funcionario> findById(Long usuarioId) {
        String sql = "SELECT usuario_id, numero_legajo FROM ticketing.funcionario WHERE usuario_id = ?";
        return jdbc.query(sql, new FuncionarioRowMapper(), usuarioId).stream().findFirst();
    }

    public Optional<Funcionario> findByLegajo(String numeroLegajo) {
        String sql = "SELECT usuario_id, numero_legajo FROM ticketing.funcionario WHERE numero_legajo = ?";
        return jdbc.query(sql, new FuncionarioRowMapper(), numeroLegajo).stream().findFirst();
    }

    public void insert(Long usuarioId, String numeroLegajo) {
        jdbc.update("INSERT INTO ticketing.funcionario (usuario_id, numero_legajo) VALUES (?, ?)", usuarioId, numeroLegajo);
    }

    public List<Map<String, Object>> findAllConMail() {
        String sql = """
            SELECT f.usuario_id AS "id", u.mail AS "mail", f.numero_legajo AS "numeroLegajo"
            FROM ticketing.funcionario f
            JOIN ticketing.usuario u ON u.id = f.usuario_id
            ORDER BY u.mail
            """;
        return jdbc.queryForList(sql);
    }
}
