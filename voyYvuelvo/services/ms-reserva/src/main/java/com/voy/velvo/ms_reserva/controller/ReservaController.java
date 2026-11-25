package com.voy.velvo.ms_reserva.controller;

import com.voy.velvo.ms_reserva.model.Reserva;
import com.voy.velvo.ms_reserva.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.naming.Name;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@Tag(name = "reservas", description = "gestor de reserva para rutas de trekking")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    @Operation(summary = "crea una nueva reserva", description = "crea la ruta si el id de usuario y ruta son validos esperando la confirmacion del estado de pago a 'PAGADO'.")
    public ResponseEntity<?> nuevaReserva(@RequestBody @Valid Reserva reserva) {
        Reserva nueva = reservaService.crearReserva(reserva);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @GetMapping
    @Operation(summary = "muestra todas las reservas", description = "muestra historial de reservas creadas,confirmadas,canceladas.")
    public ResponseEntity<List<Reserva>> verReservas() {
        return ResponseEntity.ok(reservaService.obtenerTodas());
    }

    @PutMapping("/{id}/confirmar-pago")
    @Operation(summary = "confirma estado de pago", description = "actuliza el estado de pago de la reserva con el ID seleccionado de procesando a pagado dando fin al ciclo de pago de una reserva")
    public ResponseEntity<Reserva> confirmarPago(@PathVariable Long id) {
        Reserva reservaActualizada = reservaService.confirmarPago(id);
        return ResponseEntity.ok(reservaActualizada);
    }

    @GetMapping("/{id}")
    @Operation(summary ="buscar reservas",description = "busca reservas por su numero de ID y muestra sus datos, si no encuentra el ID de la reserva mostrara en pantalla 'no existe la reserva'")
    public ResponseEntity<?> verReservaPorId(@PathVariable Long id) {
        Reserva reserva = reservaService.obtenerPorId(id);

        if (reserva == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe la reserva");
        }

        return ResponseEntity.ok(reserva);
    }

    @PutMapping("/{id}")
    @Operation(summary ="actualiza reserva por ID",description = "actualiza los datos de la reserva seleccionada")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id, @RequestBody @Valid Reserva reservaActualizada) {
        Reserva actualizada = reservaService.actualizarReserva(id, reservaActualizada);

        if (actualizada == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró para actualizar");
        }

        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "eliminar reserva",
            description = "elimina reserva por ID")
    public ResponseEntity<String> eliminarReserva(
            @PathVariable Long id) {

        reservaService.eliminarReserva(id);

        return ResponseEntity.ok(
                "La reserva fue eliminada correctamente.");
    }

}