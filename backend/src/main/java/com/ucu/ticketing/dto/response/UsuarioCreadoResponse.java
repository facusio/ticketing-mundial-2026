package com.ucu.ticketing.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioCreadoResponse {
    private Long id;
    private String mail;
    private String rol;
}
