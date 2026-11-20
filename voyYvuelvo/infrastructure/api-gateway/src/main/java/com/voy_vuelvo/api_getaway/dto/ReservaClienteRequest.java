package com.voy_vuelvo.api_getaway.dto;

import java.time.LocalDate;
import java.util.List;

public record ReservaClienteRequest(

        // Ruta que el cliente desea reservar.
        Long rutaId,

        // Numero de personas que participaran.
        Integer cantidadPersonas,

        // Fecha seleccionada para la reserva.
        LocalDate fechaReserva,

        // Indica si necesita guia.
        Boolean necesitaGuia,

        // Lista de equipamientos solicitados.
        List<EquipamientoSolicitado> equipamientos

) {

    // Datos de cada equipamiento.
    public record EquipamientoSolicitado(

            Long equipamientoId,

            Integer cantidad

    ) {
    }
}
