package com.voy.velvo.ms_reserva.client;

import com.voy.velvo.ms_reserva.model.Dto.EquipamientoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(contextId = "equipamientoReservaClient", name = "ms-equipamiento", url = "http://ms-equipamiento:8081")
public interface EquipamientoClient {
    @GetMapping("/api/equipamiento/{id}")
    EquipamientoDTO obtenerPorId(@PathVariable("id") Long id);
}
