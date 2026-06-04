package com.voy.velvo.ms_reserva.controller;

import com.voy.velvo.ms_reserva.model.Reserva;
import com.voy.velvo.ms_reserva.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    public ResponseEntity<?> nuevaReserva(@RequestBody @Valid Reserva reserva) {
        Reserva nueva = reservaService.crearReserva(reserva);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @GetMapping
    public ResponseEntity<List<Reserva>> verReservas() {
        return ResponseEntity.ok(reservaService.obtenerTodas());
    }

    @PutMapping("/{id}/confirmar-pago")
    public ResponseEntity<Reserva> confirmarPago(@PathVariable Long id) {
        Reserva reservaActualizada = reservaService.confirmarPago(id);
        return ResponseEntity.ok(reservaActualizada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> verReservaPorId(@PathVariable Long id) {
        Reserva reserva = reservaService.obtenerPorId(id);

        if (reserva == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe la reserva");
        }

        return ResponseEntity.ok(reserva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id, @RequestBody @Valid Reserva reservaActualizada) {
        Reserva actualizada = reservaService.actualizarReserva(id, reservaActualizada);

        if (actualizada == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró para actualizar");
        }

        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id) {
        reservaService.eliminarReserva(id);
        return ResponseEntity.noContent().build();
    }

    // micho modificara este ms
}