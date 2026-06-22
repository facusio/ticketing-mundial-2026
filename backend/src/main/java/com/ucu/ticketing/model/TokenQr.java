package com.ucu.ticketing.model;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TokenQr {
    private Long id;
    private Long entradaId;
    private String codigo;
    private LocalDateTime generadoEn;
    private LocalDateTime expiraEn;
    private Boolean activo;
    private Entrada entrada;
}
