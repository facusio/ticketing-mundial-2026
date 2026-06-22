package com.ucu.ticketing.model;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Estadio {
    private Long id;
    private Long adminId;
    private String nombre;
    private String pais;
    private String ciudad;
}
