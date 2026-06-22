package com.ucu.ticketing.model;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Telefono {
    private Long id;
    private Long usuarioId;
    private String numero;
}
