package com.ucu.ticketing.model;

import lombok.*;

import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminPais {
    private Long usuarioId;
    private String paisJurisdiccion;
    private LocalDate fechaAsignacion;
}
