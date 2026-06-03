package com.voy.velvo.ms_reserva.service;


import com.voy.velvo.ms_reserva.client.PagoClient;

import com.voy.velvo.ms_reserva.client.RutaClient;
import com.voy.velvo.ms_reserva.client.UsuarioClient;
import com.voy.velvo.ms_reserva.model.Dto.PagoDTO;

import com.voy.velvo.ms_reserva.model.Dto.RutaDTO;
import com.voy.velvo.ms_reserva.model.Dto.UsuarioDTO;
import com.voy.velvo.ms_reserva.model.Reserva;
import com.voy.velvo.ms_reserva.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.voy.velvo.ms_reserva.exception.RecursoNoEncontradoException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final PagoClient pagoClient;
    private final UsuarioClient usuarioClient;
    private final RutaClient rutaClient;



    public Reserva crearReserva(Reserva reserva) {

        // 1. VALIDACIÓN DE USUARIO
        try {
            UsuarioDTO usuario = usuarioClient.obtenerUsuarioPorId(reserva.getUsuarioId());
            if (usuario == null) throw new RuntimeException("Usuario nulo");
        } catch (Exception e) {
            throw new RecursoNoEncontradoException("Error: El usuario " + reserva.getUsuarioId() + " no existe.");
        }

        // 2. VALIDACIÓN DE RUTA Y OBTENCIÓN DE PRECIO
        RutaDTO ruta; // Guardamos la ruta aquí para usar su precio más abajo
        try {
            ruta = rutaClient.obtenerRutaPorId(reserva.getRutaId());
            if (ruta == null) throw new RuntimeException("Ruta nula");
        } catch (Exception e) {
            throw new RecursoNoEncontradoException("Error: La ruta " + reserva.getRutaId() + " no existe.");
        }

        // 3. Guardamos la reserva como PENDIENTE
        reserva.setEstadoPago("PENDIENTE");
        Reserva reservaGuardada = reservaRepository.save(reserva);

        // 4. CÁLCULO DEL TOTAL Y ENVÍO A PAGOS
        Double totalAPagar = ruta.getPrecio() * reserva.getCantidadPersonas();

        PagoDTO pagoParaEnviar = new PagoDTO();
        pagoParaEnviar.setIdReserva(reservaGuardada.getId());
        pagoParaEnviar.setMonto(totalAPagar);
        pagoParaEnviar.setEstado("PENDIENTE");
        pagoParaEnviar.setFechaPago(reservaGuardada.getFechaReserva().toString());

        pagoClient.crearPagoInterno(pagoParaEnviar);

        // 5. Actualizamos estado
        reservaGuardada.setEstadoPago("PROCESANDO");
        return reservaRepository.save(reservaGuardada);
    }


    // Metodo para confirmar que el pago fue exitoso
    public Reserva confirmarPago(Long id) {
        Reserva reservaExistente = obtenerPorId(id);
        reservaExistente.setEstadoPago("PAGADO");
        return reservaRepository.save(reservaExistente);
    }

    // Metodo para buscar todas las reservas
    public List<Reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    // Metodo para buscar UNA sola reserva por su ID
    public Reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: La reserva con ID " + id + " no existe."));
    }

    // Metodo para actualizar una reserva existente
    public Reserva actualizarReserva(Long id, Reserva detallesNuevos) {
        Reserva reservaExistente = obtenerPorId(id);

        // 2. Actualizamos los datos que permitimos cambiar
        reservaExistente.setCantidadPersonas(detallesNuevos.getCantidadPersonas());
        reservaExistente.setFechaReserva(detallesNuevos.getFechaReserva());
        reservaExistente.setNecesitaGuia(detallesNuevos.getNecesitaGuia());
        // No actualizamos el ID ni el usuarioId por seguridad
        return reservaRepository.save(reservaExistente);
    }

    // Metodo para eliminar una reserva
    public void eliminarReserva(Long id) {
        obtenerPorId(id);

        reservaRepository.deleteById(id);
    }
}