package com.ucu.ticketing.model;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Funcionario {
    private Long usuarioId;
    private String numeroLegajo;
}
