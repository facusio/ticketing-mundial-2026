package com.ucu.ticketing.model;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Sector {
    private Long id;
    private Long estadioId;
    private String codigo;
    private Integer capacidadMaxima;
    private Estadio estadio;
}
