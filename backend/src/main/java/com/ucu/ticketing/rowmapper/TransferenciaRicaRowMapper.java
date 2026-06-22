package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.*;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class TransferenciaRicaRowMapper implements RowMapper<Transferencia> {
    @Override
    public Transferencia mapRow(ResultSet rs, int rowNum) throws SQLException {
        Evento evento = Evento.builder()
                .id(rs.getLong("evento_id"))
                .equipoLocal(rs.getString("equipo_local"))
                .equipoVisitante(rs.getString("equipo_visitante"))
                .build();

        Entrada entrada = Entrada.builder()
                .id(rs.getLong("entrada_id"))
                .eventoId(rs.getLong("evento_id"))
                .estado(rs.getString("entrada_estado"))
                .transferenciasRealizadas(rs.getShort("transferencias_realizadas"))
                .propietarioActualId(rs.getLong("propietario_actual_id"))
                .evento(evento)
                .build();

        Usuario origen = Usuario.builder()
                .id(rs.getLong("origen_id"))
                .mail(rs.getString("origen_mail"))
                .build();

        Usuario destino = Usuario.builder()
                .id(rs.getLong("destino_id"))
                .mail(rs.getString("destino_mail"))
                .build();

        return Transferencia.builder()
                .id(rs.getLong("id"))
                .entradaId(rs.getLong("entrada_id"))
                .origenId(rs.getLong("origen_id"))
                .destinoId(rs.getLong("destino_id"))
                .fechaHora(rs.getTimestamp("fecha_hora").toLocalDateTime())
                .estado(rs.getString("estado"))
                .entrada(entrada)
                .origen(origen)
                .destino(destino)
                .build();
    }
}
