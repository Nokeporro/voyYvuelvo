package com.voy_vuelvo.ms_equipamiento.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EquipamientoDto {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    private boolean obligatorio;

    @Min(value = 1, message = "Capacidad mínima 1")
    private int capacidadPersonas;

    private boolean impermeable;

    @NotBlank(message = "La dificultad es obligatoria")
    private String dificultad;

    private boolean disponible;

    @Min(value = 1, message = "El valor debe ser mayor a 0")
    private int valorArriendo;
}
