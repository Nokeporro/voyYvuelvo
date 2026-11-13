package com.voy.vuelvo.ms_pago.controller;

import com.voy.vuelvo.ms_pago.model.Pago;
import com.voy.vuelvo.ms_pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/pagos")
@Tag(
        name = "Pagos",
        description = "Gestión de pagos"
)
public class PagoController {

    @Autowired
    private PagoService pagoService;
//---------------------------------------------------------------------------
    @Operation(summary = "Listar pagos",
            description = "Obtiene todos los pagos registrados")
    @GetMapping
    public CollectionModel<Pago> getPagos() {

        List<Pago> pagos = pagoService.findAll();

        return CollectionModel.of(pagos,
                linkTo(methodOn(PagoController.class).getPagos()).withSelfRel()
        );
    }
//--------------------------------------------------------------------
    @Operation(summary = "Buscar pago por ID",
            description = "Obtiene un pago según su identificador")
    @GetMapping("/{id}")
    public EntityModel<Pago> getPagoById(
            @PathVariable Long id) {

        Pago pago = pagoService.findById(id);

        return EntityModel.of(pago,
                linkTo(methodOn(PagoController.class).getPagoById(id)).withSelfRel(),
                linkTo(methodOn(PagoController.class).getPagos()).withRel("pagos")
        );
    }
//-----------------------------------------------------------
    @Operation(summary = "Crear pago",
            description = "Registra un nuevo pago")
    @PostMapping
    public EntityModel<Pago> createPago(
            @Valid @RequestBody Pago pago) {

        Pago nuevoPago = pagoService.save(pago);

        return EntityModel.of(nuevoPago,
                linkTo(methodOn(PagoController.class).getPagoById(nuevoPago.getId())).withSelfRel(),
                linkTo(methodOn(PagoController.class).getPagos()).withRel("pagos")
        );
    }
//----------------------------------------------------------------------
    @Operation(summary = "Actualizar pago",
            description = "Actualiza un pago existente")
    @PutMapping("/{id}")
    public EntityModel<Pago> updatePago(
            @PathVariable Long id,
            @Valid @RequestBody Pago pago) {

        Pago actualizado = pagoService.update(id, pago);

        return EntityModel.of(actualizado,
                linkTo(methodOn(PagoController.class).getPagoById(id)).withSelfRel(),
                linkTo(methodOn(PagoController.class).getPagos()).withRel("pagos")
        );
    }
//--------------------------------------------------------------
    @Operation(summary = "Eliminar pago",
            description = "Elimina un pago por ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePago(
            @PathVariable Long id) {

        pagoService.delete(id);

        return ResponseEntity.noContent().build();
    }



//---------------------------------------------------------------------------------
    @Operation(summary = "Confirmar pago",
            description = "Cambia el estado de un pago pendiente a pagado")
    @PutMapping("/{id}/pagar")
    public EntityModel<Pago> confirmarPago(
            @PathVariable Long id) {

        Pago pago = pagoService.confirmarPago(id);

        return EntityModel.of(pago,
                linkTo(methodOn(PagoController.class).getPagoById(id)).withSelfRel(),
                linkTo(methodOn(PagoController.class).getPagos()).withRel("pagos")
        );
    }
}