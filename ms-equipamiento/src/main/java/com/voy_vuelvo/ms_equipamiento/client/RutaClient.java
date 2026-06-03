package com.voy_vuelvo.ms_equipamiento.client;

import com.voy_vuelvo.ms_equipamiento.dto.RutaDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "ms-rutas")
public interface RutaClient {

    @GetMapping("/api/rutas/{id}")
    RutaDTO buscarPorId(@PathVariable("id") Long id);

    @GetMapping("/api/rutas")
    List<RutaDTO> listar();

}