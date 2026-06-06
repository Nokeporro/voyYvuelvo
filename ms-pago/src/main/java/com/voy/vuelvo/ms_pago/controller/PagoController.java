package com.voy.vuelvo.ms_pago.controller;

import com.voy.vuelvo.ms_pago.assemblers.PagoModelAssembler;
import com.voy.vuelvo.ms_pago.model.Pago;
import com.voy.vuelvo.ms_pago.service.PagoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @Autowired
    private PagoModelAssembler assembler;

    @GetMapping(produces = MediaTypes.HAL_JSON_VALUE)
    public CollectionModel<EntityModel<Pago>> getPagos() {
        List<EntityModel<Pago>> lista = pagoService.findAll().stream()
                .map(assembler::toModel)
                .collect(Collectors.toList());
        return CollectionModel.of(lista,
                linkTo(methodOn(PagoController.class).getPagos()).withSelfRel());
    }

    @GetMapping(value = "/{id}", produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<EntityModel<Pago>> getPagoPorId(@PathVariable Long id) {
        try {
            Pago pago = pagoService.findById(id);
            return ResponseEntity.ok(assembler.toModel(pago));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping(produces = MediaTypes.HAL_JSON_VALUE)
    public ResponseEntity<EntityModel<Pago>> createPago(@Valid @RequestBody Pago pago) {
        Pago nuevo = pagoService.save(pago);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assembler.toModel(nuevo));
    }
}