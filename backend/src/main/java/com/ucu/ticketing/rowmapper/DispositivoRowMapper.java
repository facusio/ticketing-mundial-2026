package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Dispositivo;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class DispositivoRowMapper implements RowMapper<Dispositivo> {
    @Override
    public Dispositivo mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Dispositivo.builder()
                .id(rs.getLong("id"))
                .funcionarioId(rs.getLong("funcionario_id"))
                .deviceUid(rs.getString("device_uid"))
                .build();
    }
}
