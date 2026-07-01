package com.ucu.ticketing.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class FuncionarioSectorRepository {

    private final JdbcTemplate jdbc;

    public List<Map<String, Object>> getSectoresAsignados(Long funcionarioId) {
        String sql = """
            SELECT s.id AS sector_id, s.codigo, s.capacidad_maxima,
                   e.id AS estadio_id, e.nombre AS estadio_nombre
            FROM ticketing.funcionario_sector fs
            JOIN ticketing.sector s ON s.id = fs.sector_id
            JOIN ticketing.estadio e ON e.id = s.estadio_id
            WHERE fs.funcionario_id = ?
            """;
        return jdbc.queryForList(sql, funcionarioId);
    }

    public boolean existsByFuncionarioIdAndSectorId(Long funcionarioId, Long sectorId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM ticketing.funcionario_sector WHERE funcionario_id = ? AND sector_id = ?",
            Integer.class, funcionarioId, sectorId);
        return count != null && count > 0;
    }

    public void insert(Long funcionarioId, Long sectorId) {
        jdbc.update(
            "INSERT INTO ticketing.funcionario_sector (funcionario_id, sector_id) VALUES (?, ?)",
            funcionarioId, sectorId);
    }

    public List<Map<String, Object>> getFuncionariosBySector(Long sectorId) {
        String sql = """
            SELECT u.id AS "id", u.mail AS "mail", f.numero_legajo AS "numeroLegajo"
            FROM ticketing.funcionario_sector fs
            JOIN ticketing.funcionario f ON f.usuario_id = fs.funcionario_id
            JOIN ticketing.usuario u ON u.id = f.usuario_id
            WHERE fs.sector_id = ?
            ORDER BY u.mail
            """;
        return jdbc.queryForList(sql, sectorId);
    }

    public void delete(Long funcionarioId, Long sectorId) {
        jdbc.update(
            "DELETE FROM ticketing.funcionario_sector WHERE funcionario_id = ? AND sector_id = ?",
            funcionarioId, sectorId);
    }
}
