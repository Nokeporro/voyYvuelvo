package com.voy.velvo.ms_reserva.client;

import com.voy.velvo.ms_reserva.model.Dto.RutaDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ms-rutas", url = "http://localhost:8086")
public interface RutaClient {

    @GetMapping("/api/rutas/{id}")
    RutaDTO obtenerRutaPorId(@PathVariable("id") Long id);
}