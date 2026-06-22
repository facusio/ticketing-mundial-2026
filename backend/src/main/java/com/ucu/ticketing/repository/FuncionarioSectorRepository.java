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
}
