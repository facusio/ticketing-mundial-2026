package com.ucu.ticketing.model;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Usuario {
    private Long id;
    private String mail;
    private String password;
    private String paisDoc;
    private String tipoDoc;
    private String numeroDoc;
    private String paisDir;
    private String localidad;
    private String calle;
    private String numeroDir;
    private String codigoPostal;
    private String rol;
}
