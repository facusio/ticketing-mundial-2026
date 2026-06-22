package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Funcionario;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FuncionarioRowMapper implements RowMapper<Funcionario> {
    @Override
    public Funcionario mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Funcionario.builder()
                .usuarioId(rs.getLong("usuario_id"))
                .numeroLegajo(rs.getString("numero_legajo"))
                .build();
    }
}
