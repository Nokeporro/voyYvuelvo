package com.voy.velvo.ms_reserva.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaEquipamiento {
    @NotNull(message = "El ID de equipamiento es obligatorio")
    private Long equipamientoId;

    @NotNull(message = "La cantidad de equipamiento es obligatoria")
    @Positive(message = "La cantidad de equipamiento debe ser mayor a cero")
    private Integer cantidad;
}
