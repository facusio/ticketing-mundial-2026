package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Estadio;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class EstadioRowMapper implements RowMapper<Estadio> {
    @Override
    public Estadio mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Estadio.builder()
                .id(rs.getLong("id"))
                .adminId(rs.getLong("admin_id"))
                .nombre(rs.getString("nombre"))
                .pais(rs.getString("pais"))
                .ciudad(rs.getString("ciudad"))
                .build();
    }
}
