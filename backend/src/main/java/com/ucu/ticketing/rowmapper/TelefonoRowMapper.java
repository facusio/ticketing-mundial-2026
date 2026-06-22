package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Telefono;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class TelefonoRowMapper implements RowMapper<Telefono> {
    @Override
    public Telefono mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Telefono.builder()
                .id(rs.getLong("id"))
                .usuarioId(rs.getLong("usuario_id"))
                .numero(rs.getString("numero"))
                .build();
    }
}
