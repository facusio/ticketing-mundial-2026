package com.ucu.ticketing.rowmapper;

import com.ucu.ticketing.model.Estadio;
import com.ucu.ticketing.model.Evento;
import com.ucu.ticketing.model.Fase;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class EventoRowMapper implements RowMapper<Evento> {
    @Override
    public Evento mapRow(ResultSet rs, int rowNum) throws SQLException {
        Estadio estadio = Estadio.builder()
                .id(rs.getLong("estadio_id"))
                .adminId(rs.getLong("admin_id"))
                .nombre(rs.getString("estadio_nombre"))
                .pais(rs.getString("estadio_pais"))
                .ciudad(rs.getString("estadio_ciudad"))
                .build();

        Fase fase = Fase.builder()
                .id(rs.getLong("fase_id"))
                .nombre(rs.getString("fase_nombre"))
                .orden(rs.getInt("fase_orden"))
                .build();

        return Evento.builder()
                .id(rs.getLong("id"))
                .estadioId(rs.getLong("estadio_id"))
                .adminId(rs.getLong("admin_id"))
                .faseId(rs.getLong("fase_id"))
                .equipoLocal(rs.getString("equipo_local"))
                .equipoVisitante(rs.getString("equipo_visitante"))
                .fechaHora(rs.getTimestamp("fecha_hora").toLocalDateTime())
                .estadio(estadio)
                .fase(fase)
                .build();
    }
}
