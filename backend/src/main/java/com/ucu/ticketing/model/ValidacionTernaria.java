package com.ucu.ticketing.model;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ValidacionTernaria {
    private Long funcionarioId;
    private Long dispositivoId;
    private Long entradaId;
    private Long tokenQrId;
    private LocalDateTime fechaHora;
    private Entrada entrada;
}
