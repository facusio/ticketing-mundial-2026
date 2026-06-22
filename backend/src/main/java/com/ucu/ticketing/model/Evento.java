package com.ucu.ticketing.model;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Evento {
    private Long id;
    private Long estadioId;
    private Long adminId;
    private Long faseId;
    private String equipoLocal;
    private String equipoVisitante;
    private LocalDateTime fechaHora;
    private Estadio estadio;
    private Fase fase;
}
