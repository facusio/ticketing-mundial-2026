package com.ucu.ticketing.model;

import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Entrada {
    private Long id;
    private Long ventaId;
    private Long eventoId;
    private Long sectorId;
    private Long propietarioActualId;
    private BigDecimal precio;
    private String estado;
    private Short transferenciasRealizadas;
    private Sector sector;
    private Evento evento;
    private Usuario propietarioActual;
}
