package com.voy.vuelvo.ms_ruta.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rutas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ruta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String ubicacion;
    private String dificultad;
    private Double precio;
    private Integer cupoMaximo;
    private Boolean aptoNinos;
    private Boolean aptoMascotas;
}