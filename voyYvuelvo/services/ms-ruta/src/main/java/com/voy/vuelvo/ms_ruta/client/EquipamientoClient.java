package com.voy.vuelvo.ms_ruta.client;

import com.voy.vuelvo.ms_ruta.dto.EquipamientoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
        contextId = "equipamientoClient",
        name = "ms-equipamiento",
        url = "http://ms-equipamiento:8081"
)
public interface EquipamientoClient {

    @GetMapping("/api/equipamiento/interno")
    List<EquipamientoDTO> listar();

    @GetMapping("/api/equipamiento/interno/disponibles")
    List<EquipamientoDTO> disponibles();

    @GetMapping("/api/equipamiento/interno/dificultad/{dificultad}")
    List<EquipamientoDTO> buscarPorDificultad(
            @PathVariable("dificultad") String dificultad);
}
