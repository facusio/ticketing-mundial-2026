package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Usuario;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class UsuarioRowMapper implements RowMapper<Usuario> {
    @Override
    public Usuario mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Usuario.builder()
                .id(rs.getLong("id"))
                .mail(rs.getString("mail"))
                .password(rs.getString("password"))
                .paisDoc(rs.getString("pais_doc"))
                .tipoDoc(rs.getString("tipo_doc"))
                .numeroDoc(rs.getString("numero_doc"))
                .paisDir(rs.getString("pais_dir"))
                .localidad(rs.getString("localidad"))
                .calle(rs.getString("calle"))
                .numeroDir(rs.getString("numero_dir"))
                .codigoPostal(rs.getString("codigo_postal"))
                .rol(rs.getString("rol"))
                .build();
    }
}
