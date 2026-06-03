package com.voy_vuelvo.ms_equipamiento.dto;

import lombok.Data;

@Data
public class RutaDTO {
    private Long id;
    private String nombre;
    private String dificultad;
    private Double precio;
    private boolean aptoNinos;
    private boolean aptoMascotas;
}