package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.AdminPais;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class AdminPaisRowMapper implements RowMapper<AdminPais> {
    @Override
    public AdminPais mapRow(ResultSet rs, int rowNum) throws SQLException {
        return AdminPais.builder()
                .usuarioId(rs.getLong("usuario_id"))
                .paisJurisdiccion(rs.getString("pais_jurisdiccion"))
                .fechaAsignacion(rs.getDate("fecha_asignacion").toLocalDate())
                .build();
    }
}
