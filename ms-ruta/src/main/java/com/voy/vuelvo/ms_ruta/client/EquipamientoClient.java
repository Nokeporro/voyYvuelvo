package com.voy.vuelvo.ms_ruta.client;

import com.voy.vuelvo.ms_ruta.dto.EquipamientoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List; // Importar List

@FeignClient(name = "ms-equipamiento", url = "http://localhost:8081")
public interface EquipamientoClient {

    @GetMapping("/api/equipamiento")
    List<EquipamientoDTO> listar();

    @GetMapping("/api/equipamiento/disponibles")
    List<EquipamientoDTO> disponibles();

    @GetMapping("/api/equipamiento/dificultad/{dificultad}")
    List<EquipamientoDTO> buscarPorDificultad(
            @PathVariable("dificultad") String dificultad);
}