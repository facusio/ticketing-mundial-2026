package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.*;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class TokenQrRowMapper implements RowMapper<TokenQr> {
    @Override
    public TokenQr mapRow(ResultSet rs, int rowNum) throws SQLException {
        Estadio estadio = Estadio.builder()
                .id(rs.getLong("sector_estadio_id"))
                .nombre(rs.getString("estadio_nombre"))
                .build();

        Sector sector = Sector.builder()
                .id(rs.getLong("sector_id"))
                .estadioId(rs.getLong("sector_estadio_id"))
                .codigo(rs.getString("sector_codigo"))
                .estadio(estadio)
                .build();

        Evento evento = Evento.builder()
                .id(rs.getLong("evento_id"))
                .equipoLocal(rs.getString("equipo_local"))
                .equipoVisitante(rs.getString("equipo_visitante"))
                .fechaHora(rs.getTimestamp("evento_fecha_hora").toLocalDateTime())
                .build();

        Usuario propietario = Usuario.builder()
                .id(rs.getLong("propietario_id"))
                .mail(rs.getString("propietario_mail"))
                .numeroDoc(rs.getString("propietario_numero_doc"))
                .build();

        Entrada entrada = Entrada.builder()
                .id(rs.getLong("entrada_id"))
                .ventaId(rs.getLong("venta_id"))
                .eventoId(rs.getLong("evento_id"))
                .sectorId(rs.getLong("sector_id"))
                .propietarioActualId(rs.getLong("propietario_actual_id"))
                .precio(rs.getBigDecimal("entrada_precio"))
                .estado(rs.getString("entrada_estado"))
                .transferenciasRealizadas(rs.getShort("transferencias_realizadas"))
                .sector(sector)
                .evento(evento)
                .propietarioActual(propietario)
                .build();

        return TokenQr.builder()
                .id(rs.getLong("id"))
                .entradaId(rs.getLong("entrada_id"))
                .codigo(rs.getString("codigo"))
                .generadoEn(rs.getTimestamp("generado_en").toLocalDateTime())
                .expiraEn(rs.getTimestamp("expira_en").toLocalDateTime())
                .activo(rs.getBoolean("activo"))
                .entrada(entrada)
                .build();
    }
}
