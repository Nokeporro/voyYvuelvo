package com.voy.vuelvo.ms_ruta.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RutaDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La ubicación es obligatoria")
    private String ubicacion;

    @NotBlank(message = "La dificultad es obligatoria")
    private String dificultad;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 1, message = "El precio debe ser mayor a 0")
    private Double precio;

    @NotNull(message = "El cupo máximo es obligatorio")
    @Min(value = 1, message = "El cupo máximo debe ser mayor a 0")
    private Integer cupoMaximo;

    @NotNull(message = "Debe indicar si es apto para niños")
    private Boolean aptoNinos;

    @NotNull(message = "Debe indicar si es apto para mascotas")
    private Boolean aptoMascotas;
}