package com.voy.vuelvo.ms_ruta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class EquipamientoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Boolean obligatorio;
    private Integer capacidadPersonas;
    private Boolean impermeable;
    private String dificultad;
    private Boolean disponible;
    private Integer valorArriendo;

}