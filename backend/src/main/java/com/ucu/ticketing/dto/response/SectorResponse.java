package com.ucu.ticketing.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectorResponse {
    private Long id;
    private String codigo;
    private int capacidadMaxima;
}
