package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.UsuarioGeneral;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class UsuarioGeneralRowMapper implements RowMapper<UsuarioGeneral> {
    @Override
    public UsuarioGeneral mapRow(ResultSet rs, int rowNum) throws SQLException {
        return UsuarioGeneral.builder()
                .usuarioId(rs.getLong("usuario_id"))
                .fechaRegistro(rs.getDate("fecha_registro").toLocalDate())
                .estadoVerificacion(rs.getString("estado_verificacion"))
                .build();
    }
}
