package com.voy.vuelvo.ms_ruta.controller;

import com.voy.vuelvo.ms_ruta.dto.EquipamientoDTO; // IMPORTANTE: Importar el DTO
import com.voy.vuelvo.ms_ruta.dto.RutaResponseDTO;
import com.voy.vuelvo.ms_ruta.model.Ruta;
import com.voy.vuelvo.ms_ruta.service.RutaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.voy.vuelvo.ms_ruta.dto.RutaDTO;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/rutas")
@RequiredArgsConstructor
public class RutaController {

    private final RutaService rutaService;

    @GetMapping
    public List<Ruta> listar() {
        return rutaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ruta> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(rutaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Ruta> guardar(
            @RequestBody @Valid RutaDTO dto) {

        return new ResponseEntity<>(
                rutaService.crearRuta(dto),
                HttpStatus.CREATED);
    }

    @GetMapping("/equipamientos")
    public List<EquipamientoDTO> equipamientos() {
        return rutaService.obtenerEquipamientos();
    }

    @GetMapping("/equipamientos/disponibles")
    public List<EquipamientoDTO> disponibles() {
        return rutaService.obtenerDisponibles();
    }


    //-----------------
    @GetMapping("/{id}/equipamiento")
    public List<EquipamientoDTO> obtenerEquipamientoRuta(
            @PathVariable Long id) {

        return rutaService.obtenerEquipamientoPorRuta(id);
    }

    @GetMapping("/{id}/detalle")
    public RutaResponseDTO obtenerDetalleRuta(
            @PathVariable Long id) {

        return rutaService.obtenerRutaConEquipamiento(id);
    }
}