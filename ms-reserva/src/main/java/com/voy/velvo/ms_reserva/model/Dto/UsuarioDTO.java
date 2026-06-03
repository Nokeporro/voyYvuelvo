package com.voy.velvo.ms_reserva.model.Dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private String telefono;
}