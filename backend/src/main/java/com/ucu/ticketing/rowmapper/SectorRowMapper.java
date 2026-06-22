package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Sector;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class SectorRowMapper implements RowMapper<Sector> {
    @Override
    public Sector mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Sector.builder()
                .id(rs.getLong("id"))
                .estadioId(rs.getLong("estadio_id"))
                .codigo(rs.getString("codigo"))
                .capacidadMaxima(rs.getInt("capacidad_maxima"))
                .build();
    }
}
