package com.voy.vuelvo.ms_ruta.controller;

import com.voy.vuelvo.ms_ruta.dto.EquipamientoDTO; // IMPORTANTE: Importar el DTO
import com.voy.vuelvo.ms_ruta.dto.RutaResponseDTO;
import com.voy.vuelvo.ms_ruta.model.Ruta;
import com.voy.vuelvo.ms_ruta.service.RutaService;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.voy.vuelvo.ms_ruta.dto.RutaDTO;
import jakarta.validation.Valid;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/rutas")
@RequiredArgsConstructor
@Tag (name = "Rutas", description ="Gestor de rutas para trekking")
public class RutaController {

    private final RutaService rutaService;
//----------------------------------------------------------------------------
    @Operation(summary = "Listar rutas",
            description = "Obtiene todas las rutas de trekking registradas")
    @GetMapping
    public CollectionModel<Ruta> listar() {

        List<Ruta> rutas = rutaService.obtenerTodas();

        return CollectionModel.of(rutas,
                linkTo(methodOn(RutaController.class).listar()).withSelfRel());
    }
//-------------------------------------------------------------------------------
    @Operation(summary = "Buscar ruta por ID",
        description = "Obtiene una ruta según su identificador")
    @GetMapping("/{id}")
    public EntityModel<Ruta> buscarPorId(
        @PathVariable Long id) {

    Ruta ruta = rutaService.obtenerPorId(id);

    return EntityModel.of(ruta,
            linkTo(methodOn(RutaController.class).buscarPorId(id)).withSelfRel(),
            linkTo(methodOn(RutaController.class).listar()).withRel("rutas")
    );
}
//----------------------------------------------------------------------
    @Operation(summary = "Crear ruta de trekking",
        description = "Registra una nueva ruta de trekking")
    @PostMapping
    public EntityModel<Ruta> guardar(
        @RequestBody @Valid RutaDTO dto) {

    Ruta ruta = rutaService.crearRuta(dto);

    return EntityModel.of(ruta,
            linkTo(methodOn(RutaController.class).buscarPorId(ruta.getId())).withSelfRel(),
            linkTo(methodOn(RutaController.class).listar()).withRel("rutas")
    );
}
//----------------------------------------------------------------------------
    @Operation(summary = "Listar equipamientos",
        description = "Obtiene todos los equipamientos disponibles" )
    @GetMapping("/equipamientos")
    public CollectionModel<EquipamientoDTO> equipamientos() {

        List<EquipamientoDTO> equipamientos =
            rutaService.obtenerEquipamientos();

    return CollectionModel.of(equipamientos,
            linkTo(methodOn(RutaController.class).equipamientos()).withSelfRel()
    );
}
//--------------------------------------------------------------------
    @Operation(summary = "Listar equipamientos disponibles",
        description = "Obtiene los equipamientos disponibles para arriendo"
    )
    @GetMapping("/equipamientos/disponibles")
    public CollectionModel<EquipamientoDTO> disponibles() {

        List<EquipamientoDTO> equipamientos =
            rutaService.obtenerDisponibles();

        return CollectionModel.of(equipamientos,
            linkTo(methodOn(RutaController.class).disponibles()).withSelfRel());
    }

//---------------------------------------------------------------------------------------

    @Operation(summary = "Obtener equipamiento recomendado",
            description = "Obtiene el equipamiento recomendado para una ruta específica")
    @GetMapping("/{id}/equipamiento")
    public CollectionModel<EquipamientoDTO> obtenerEquipamientoRuta(
            @PathVariable Long id) {

        List<EquipamientoDTO> equipamientos =
                rutaService.obtenerEquipamientoPorRuta(id);

        return CollectionModel.of(equipamientos,
                linkTo(methodOn(RutaController.class).obtenerEquipamientoRuta(id)).withSelfRel(),
                linkTo(methodOn(RutaController.class).buscarPorId(id)).withRel("ruta"));
    }
//------------------------------------------------------------------------------
    @Operation(summary = "Obtener detalle de ruta",
            description = "Obtiene una ruta junto con el equipamiento asociado")
    @GetMapping("/{id}/detalle")
    public EntityModel<RutaResponseDTO> obtenerDetalleRuta(
            @PathVariable Long id) {

        RutaResponseDTO ruta =
                rutaService.obtenerRutaConEquipamiento(id);

        return EntityModel.of(ruta,
                linkTo(methodOn(RutaController.class).obtenerDetalleRuta(id)).withSelfRel(),
                linkTo(methodOn(RutaController.class).buscarPorId(id)).withRel("ruta")
        );
    }
}