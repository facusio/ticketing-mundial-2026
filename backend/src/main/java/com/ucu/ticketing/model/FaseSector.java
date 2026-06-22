package com.ucu.ticketing.model;

import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FaseSector {
    private Long id;
    private Long faseId;
    private Long sectorId;
    private BigDecimal precio;
    private Sector sector;
}
