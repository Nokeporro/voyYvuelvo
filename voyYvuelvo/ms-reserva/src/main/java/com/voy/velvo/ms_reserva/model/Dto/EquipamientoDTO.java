package com.voy.velvo.ms_reserva.model.Dto;

import lombok.Data;

@Data
public class EquipamientoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private boolean obligatorio;
    private int capacidadPersonas;
    private boolean impermeable;
    private String dificultad;
    private boolean disponible;
    private int valorArriendo;
}
