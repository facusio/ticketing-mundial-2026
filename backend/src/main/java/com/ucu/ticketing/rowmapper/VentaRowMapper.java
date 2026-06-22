package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Venta;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class VentaRowMapper implements RowMapper<Venta> {
    @Override
    public Venta mapRow(ResultSet rs, int rowNum) throws SQLException {
        return Venta.builder()
                .id(rs.getLong("id"))
                .usuarioId(rs.getLong("usuario_id"))
                .fecha(rs.getTimestamp("fecha").toLocalDateTime())
                .estado(rs.getString("estado"))
                .montoTotal(rs.getBigDecimal("monto_total"))
                .tasaComision(rs.getBigDecimal("tasa_comision"))
                .build();
    }
}
