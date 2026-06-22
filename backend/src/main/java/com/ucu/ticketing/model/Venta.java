package com.ucu.ticketing.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Venta {
    private Long id;
    private Long usuarioId;
    private LocalDateTime fecha;
    private String estado;
    private BigDecimal montoTotal;
    private BigDecimal tasaComision;
}
