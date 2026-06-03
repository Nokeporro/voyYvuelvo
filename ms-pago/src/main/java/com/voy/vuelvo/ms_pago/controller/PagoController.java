package com.voy.vuelvo.ms_pago.controller;

import com.voy.vuelvo.ms_pago.model.Pago;
import com.voy.vuelvo.ms_pago.service.PagoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @GetMapping
    public ResponseEntity<?> getPagos() {
        return ResponseEntity.ok(pagoService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createPago(@Valid @RequestBody Pago pago) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.save(pago));
    }
}