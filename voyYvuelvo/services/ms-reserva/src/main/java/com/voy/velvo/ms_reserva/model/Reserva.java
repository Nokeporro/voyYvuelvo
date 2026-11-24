package com.voy.velvo.ms_reserva.model;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "RESERVAS", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "ruta_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    // 1. ID DE LA RESERVA
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 2. ID DEL PERFIL DEL USUARIO
    // Para clientes se asignara desde el JWT en el API Gateway.
    @NotNull(message = "El ID de usuario es obligatorio")
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    // 3. RUTA SELECCIONADA
    @NotNull(message = "El ID de ruta es obligatorio")
    @Column(name = "ruta_id", nullable = false)
    private Long rutaId;

    // 4. CANTIDAD DE PERSONAS
    @NotNull(message = "La cantidad de personas es obligatoria")
    @Positive(message = "La cantidad de personas debe ser mayor a cero")
    private Integer cantidadPersonas;

    // 5. FECHA DE RESERVA
    @NotNull(message = "La fecha de reserva es obligatoria")
    private LocalDate fechaReserva;

    // 6. SOLICITUD DE GUIA
    @NotNull(message = "Debe especificar si necesita guia o no")
    @Column(name = "necesita_guia")
    private Boolean necesitaGuia;

    // 7. ESTADO DEL PAGO
    // Lo establece automaticamente ReservaService.
    @Column(name = "estado_pago")
    private String estadoPago;

    // 8. EQUIPAMIENTO SOLICITADO
    @Valid
    @ElementCollection
    @CollectionTable(
            name = "RESERVA_EQUIPAMIENTO",
            joinColumns = @JoinColumn(name = "reserva_id")
    )
    private List<ReservaEquipamiento> equipamientos =
            new ArrayList<>();
}
