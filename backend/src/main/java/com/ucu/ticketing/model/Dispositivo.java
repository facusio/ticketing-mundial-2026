package com.ucu.ticketing.model;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Dispositivo {
    private Long id;
    private Long funcionarioId;
    private String deviceUid;
}
