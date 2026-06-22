package com.ucu.ticketing.model;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Fase {
    private Long id;
    private String nombre;
    private Integer orden;
}
