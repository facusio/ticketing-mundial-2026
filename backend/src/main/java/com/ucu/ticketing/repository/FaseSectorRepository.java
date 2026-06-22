package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.FaseSector;
import com.ucu.ticketing.rowmapper.FaseSectorRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FaseSectorRepository {

    private final JdbcTemplate jdbc;

    private static final String SELECT_RICO = """
        SELECT fs.id AS fs_id, fs.fase_id, fs.sector_id, fs.precio,
               s.codigo AS sector_codigo, s.capacidad_maxima AS sector_capacidad,
               s.estadio_id,
               e.nombre AS estadio_nombre
        FROM ticketing.fase_sector fs
        JOIN ticketing.sector s ON s.id = fs.sector_id
        JOIN ticketing.estadio e ON e.id = s.estadio_id
        """;

    public Optional<FaseSector> findByFaseIdAndSectorId(Long faseId, Long sectorId) {
        return jdbc.query(SELECT_RICO + "WHERE fs.fase_id = ? AND fs.sector_id = ?",
            new FaseSectorRowMapper(), faseId, sectorId).stream().findFirst();
    }

    public List<FaseSector> findByFaseIdAndEstadioId(Long faseId, Long estadioId) {
        return jdbc.query(SELECT_RICO + "WHERE fs.fase_id = ? AND s.estadio_id = ?",
            new FaseSectorRowMapper(), faseId, estadioId);
    }

    public void upsert(Long faseId, Long sectorId, BigDecimal precio) {
        Optional<Long> existingId = jdbc.query(
            "SELECT id FROM ticketing.fase_sector WHERE fase_id = ? AND sector_id = ?",
            (rs, rn) -> rs.getLong("id"), faseId, sectorId).stream().findFirst();

        if (existingId.isPresent()) {
            jdbc.update("UPDATE ticketing.fase_sector SET precio = ? WHERE id = ?", precio, existingId.get());
        } else {
            jdbc.update("INSERT INTO ticketing.fase_sector (fase_id, sector_id, precio) VALUES (?, ?, ?)",
                faseId, sectorId, precio);
        }
    }
}
