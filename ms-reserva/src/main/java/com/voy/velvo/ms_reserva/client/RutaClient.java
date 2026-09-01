package com.voy.velvo.ms_reserva.client;

import com.voy.velvo.ms_reserva.model.Dto.RutaDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(contextId = "rutaClient", name = "ms-ruta", url = "http://ms-ruta:8086")
public interface RutaClient {

    @GetMapping("/api/rutas/{id}")
    RutaDTO obtenerRutaPorId(@PathVariable("id") Long id);

    @PutMapping("/api/rutas/{id}/descontar-cupos")
    RutaDTO descontarCupos(
            @PathVariable Long id,
            @RequestParam Integer cantidad);

    @PutMapping("/api/rutas/{id}/aumentar-cupos")
    RutaDTO aumentarCupos(
            @PathVariable Long id,
            @RequestParam Integer cantidad);
}