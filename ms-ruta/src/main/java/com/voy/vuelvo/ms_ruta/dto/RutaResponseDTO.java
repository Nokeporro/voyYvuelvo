package com.voy.vuelvo.ms_ruta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class RutaResponseDTO {

    private Long id;
    private String nombre;
    private String ubicacion;
    private String dificultad;
    private double precio;
    private Integer cupoMaximo;
    private Boolean aptoNinos;
    private Boolean aptoMascotas;

    private List<EquipamientoDTO> equipamiento;
}
