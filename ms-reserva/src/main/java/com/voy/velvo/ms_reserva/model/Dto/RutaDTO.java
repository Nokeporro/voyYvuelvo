package com.voy.velvo.ms_reserva.model.Dto;


import lombok.Data;

@Data
public class RutaDTO {
    private Long id;
    private String nombre;
    private String ubicacion;
    private String dificultad;
    private Double precio;
    private Integer cupoMaximo;
    private Boolean aptoNinos;
    private Boolean aptoMascotas;
}