package com.voy.vuelvo.ms_pago.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El id de la reserva no puede ser nulo")
    private Long idReserva;

    @NotNull(message = "El monto no puede ser nulo")
    @Positive(message = "El monto debe ser mayor a cero")
    private Double monto;

    @NotBlank(message = "El estado no puede estar vacío")
    private String estado; // PENDIENTE, PAGADO, GARANTIA_RETENIDA

    private String fechaPago;
}