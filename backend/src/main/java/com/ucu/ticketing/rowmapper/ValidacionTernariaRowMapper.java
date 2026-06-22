package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.*;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ValidacionTernariaRowMapper implements RowMapper<ValidacionTernaria> {
    @Override
    public ValidacionTernaria mapRow(ResultSet rs, int rowNum) throws SQLException {
        Estadio estadio = Estadio.builder()
                .id(rs.getLong("sector_estadio_id"))
                .nombre(rs.getString("estadio_nombre"))
                .build();

        Sector sector = Sector.builder()
                .id(rs.getLong("sector_id"))
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
                .sectorId(rs.getLong("sector_id"))
                .eventoId(rs.getLong("evento_id"))
                .propietarioActualId(rs.getLong("propietario_actual_id"))
                .estado(rs.getString("entrada_estado"))
                .sector(sector)
                .evento(evento)
                .propietarioActual(propietario)
                .build();

        return ValidacionTernaria.builder()
                .funcionarioId(rs.getLong("funcionario_id"))
                .dispositivoId(rs.getLong("dispositivo_id"))
                .entradaId(rs.getLong("entrada_id"))
                .tokenQrId(rs.getLong("token_qr_id"))
                .fechaHora(rs.getTimestamp("fecha_hora").toLocalDateTime())
                .entrada(entrada)
                .build();
    }
}
