package com.voy.velvo.ms_reserva.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "RESERVAS") // Nombra la tabla en la base de datos MySQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El ID de usuario es obligatorio")
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @NotNull(message = "El ID de ruta es obligatorio")
    @Column(name = "ruta_id", nullable = false)
    private Long rutaId;

    @NotNull(message = "La cantidad de personas no puede ser nula")
    @Positive(message = "La cantidad de personas debe ser mayor a cero")
    private Integer cantidadPersonas;

    @NotNull(message = "La fecha de reserva es obligatoria")
    private LocalDate fechaReserva;

    @NotNull(message = "Debe especificar si necesita guía o no")
    private Boolean necesitaGuia;

    @Column(name = "estado_pago")
    private String estadoPago;
}

        /* POSTMAN POST
        {
    "id":... //NO ES NECESARIO PONER ESTA ID YA QUE EL SISTEMA LA GENERA SOLA
    "usuarioId": 101,
    "rutaId": 5,
    "cantidadPersonas": 4,
    "fechaReserva": "2026-05-20",
    "necesitaGuia": true,
    "estadoPago": "PENDIENTE" ESTADO DE PAGO SIEMPRE ESTARA PENDIENTE SIN IMPORTAR EL ESTADO INGRESADO ASI QUE NO ES NECESARIO AGRREGAR
}
         */



