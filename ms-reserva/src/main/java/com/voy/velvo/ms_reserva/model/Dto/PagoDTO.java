package com.voy.velvo.ms_reserva.model.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagoDTO {
    private Long idReserva;
    private Double monto;
    private String estado;
    private String fechaPago;
}