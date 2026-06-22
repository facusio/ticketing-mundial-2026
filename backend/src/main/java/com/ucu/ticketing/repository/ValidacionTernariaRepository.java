package com.ucu.ticketing.repository;

import com.ucu.ticketing.model.ValidacionTernaria;
import com.ucu.ticketing.rowmapper.ValidacionTernariaRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ValidacionTernariaRepository {

    private final JdbcTemplate jdbc;

    public List<ValidacionTernaria> findByFuncionarioId(Long funcionarioId) {
        String sql = """
            SELECT vt.funcionario_id, vt.dispositivo_id, vt.entrada_id, vt.token_qr_id, vt.fecha_hora,
                   e.sector_id, e.evento_id, e.propietario_actual_id, e.estado AS entrada_estado,
                   s.codigo AS sector_codigo, s.estadio_id AS sector_estadio_id,
                   est.nombre AS estadio_nombre,
                   ev.equipo_local, ev.equipo_visitante, ev.fecha_hora AS evento_fecha_hora,
                   u.id AS propietario_id, u.mail AS propietario_mail, u.numero_doc AS propietario_numero_doc
            FROM ticketing.validacion_ternaria vt
            JOIN ticketing.entrada e ON e.id = vt.entrada_id
            JOIN ticketing.sector s ON s.id = e.sector_id
            JOIN ticketing.estadio est ON est.id = s.estadio_id
            JOIN ticketing.evento ev ON ev.id = e.evento_id
            JOIN ticketing.usuario u ON u.id = e.propietario_actual_id
            WHERE vt.funcionario_id = ?
            ORDER BY vt.fecha_hora DESC
            """;
        return jdbc.query(sql, new ValidacionTernariaRowMapper(), funcionarioId);
    }

    public void insert(Long funcionarioId, Long dispositivoId, Long entradaId,
                       Long tokenQrId, LocalDateTime fechaHora) {
        jdbc.update("""
            INSERT INTO ticketing.validacion_ternaria
                (funcionario_id, dispositivo_id, entrada_id, token_qr_id, fecha_hora)
            VALUES (?, ?, ?, ?, ?)
            """,
            funcionarioId, dispositivoId, entradaId, tokenQrId, Timestamp.valueOf(fechaHora));
    }
}
