package com.voy.vuelvo.ms_pago.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(name = "ms-reservas")
public interface ExitPago {

    @GetMapping("/api/reservas/{idReserva}")
    Optional<?> findById(@PathVariable("idReserva") Long idReserva);

}