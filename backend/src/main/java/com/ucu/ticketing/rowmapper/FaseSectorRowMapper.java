package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Estadio;
import com.ucu.ticketing.model.FaseSector;
import com.ucu.ticketing.model.Sector;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FaseSectorRowMapper implements RowMapper<FaseSector> {
    @Override
    public FaseSector mapRow(ResultSet rs, int rowNum) throws SQLException {
        Estadio estadio = Estadio.builder()
                .id(rs.getLong("estadio_id"))
                .nombre(rs.getString("estadio_nombre"))
                .build();

        Sector sector = Sector.builder()
                .id(rs.getLong("sector_id"))
                .estadioId(rs.getLong("estadio_id"))
                .codigo(rs.getString("sector_codigo"))
                .capacidadMaxima(rs.getInt("sector_capacidad"))
                .estadio(estadio)
                .build();

        return FaseSector.builder()
                .id(rs.getLong("fs_id"))
                .faseId(rs.getLong("fase_id"))
                .sectorId(rs.getLong("sector_id"))
                .precio(rs.getBigDecimal("precio"))
                .sector(sector)
                .build();
    }
}
