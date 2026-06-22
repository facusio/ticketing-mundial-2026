package com.ucu.ticketing.model;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Transferencia {
    private Long id;
    private Long entradaId;
    private Long origenId;
    private Long destinoId;
    private LocalDateTime fechaHora;
    private String estado;
    private Entrada entrada;
    private Usuario origen;
    private Usuario destino;
}
