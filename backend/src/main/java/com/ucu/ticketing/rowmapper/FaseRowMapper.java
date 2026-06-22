package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Fase;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FaseRowMapper implements RowMapper<Fase> {
    @Override
    public Fase mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Fase.builder()
                .id(rs.getLong("id"))
                .nombre(rs.getString("nombre"))
                .orden(rs.getInt("orden"))
                .build();
    }
}
