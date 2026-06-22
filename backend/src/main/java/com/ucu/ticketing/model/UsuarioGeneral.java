package com.ucu.ticketing.model;

import lombok.*;

import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UsuarioGeneral {
    private Long usuarioId;
    private LocalDate fechaRegistro;
    private String estadoVerificacion;
}
