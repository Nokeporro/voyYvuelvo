package com.voy.velvo.ms_reserva.service;


import com.voy.velvo.ms_reserva.client.PagoClient;

import com.voy.velvo.ms_reserva.client.RutaClient;
import com.voy.velvo.ms_reserva.client.UsuarioClient;
import com.voy.velvo.ms_reserva.exception.CuposInsuficientesException;
import com.voy.velvo.ms_reserva.exception.RecursoDuplicadoException;
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

        // 1. VALIDAR QUE EL USUARIO EXISTA
        try {
            UsuarioDTO usuario = usuarioClient.obtenerUsuarioPorId(reserva.getUsuarioId());
            System.out.println("Usuario encontrado: " + usuario);
        } catch (Exception e) {
            throw new RecursoNoEncontradoException(
                    "El usuario con ID " + reserva.getUsuarioId() + " no existe.");
        }

        // 2. VALIDAR QUE EL USUARIO NO TENGA UNA RESERVA PARA LA MISMA RUTA
        if (reservaRepository.existsByUsuarioIdAndRutaId(
                reserva.getUsuarioId(),
                reserva.getRutaId())) {

            throw new RecursoDuplicadoException(
                    "Ya tienes una reserva para esta ruta.");
        }

        // 3. VALIDAR QUE LA RUTA EXISTA
        RutaDTO ruta;

        try {
            ruta = rutaClient.obtenerRutaPorId(reserva.getRutaId());
        } catch (Exception e) {
            throw new RecursoNoEncontradoException(
                    "La ruta con ID " + reserva.getRutaId() + " no existe.");
        }

        // 4. VALIDAR CUPOS DISPONIBLES
        if (ruta.getCupoMaximo() < reserva.getCantidadPersonas()) {
            throw new CuposInsuficientesException(
                    "No hay cupos suficientes para esta ruta.");
        }

        // 5. DESCONTAR CUPOS EN MS-RUTA
        rutaClient.descontarCupos(
                reserva.getRutaId(),
                reserva.getCantidadPersonas());

        // 6. ESTABLECER ESTADO INICIAL DE LA RESERVA
        reserva.setEstadoPago("PENDIENTE");

        // 7. GUARDAR LA RESERVA
        Reserva reservaGuardada = reservaRepository.save(reserva);

        // 8. CALCULAR EL TOTAL A PAGAR
        Double totalAPagar = ruta.getPrecio() * reserva.getCantidadPersonas();

        // 9. CREAR EL PAGO
        PagoDTO pagoParaEnviar = new PagoDTO();
        pagoParaEnviar.setIdReserva(reservaGuardada.getId());
        pagoParaEnviar.setMonto(totalAPagar);
        pagoParaEnviar.setEstado("PENDIENTE");
        pagoParaEnviar.setFechaPago(reservaGuardada.getFechaReserva().toString());

        pagoClient.crearPagoInterno(pagoParaEnviar);

        // 10. ACTUALIZAR EL ESTADO DE LA RESERVA
        reservaGuardada.setEstadoPago("PROCESANDO");

        return reservaRepository.save(reservaGuardada);
    }

//------------------------------------------------------------------------------------------
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

    // Metodo para eliminar una reserva y vuelva a estar disponible el cupo
    public void eliminarReserva(Long id) {

        Reserva reserva = obtenerPorId(id);

        rutaClient.aumentarCupos(
                reserva.getRutaId(),
                reserva.getCantidadPersonas());

        reservaRepository.deleteById(id);
    }
}