package com.voy.velvo.ms_reserva.service;

import com.voy.velvo.ms_reserva.client.PagoClient;
import com.voy.velvo.ms_reserva.client.RutaClient;
import com.voy.velvo.ms_reserva.client.UsuarioClient;
import com.voy.velvo.ms_reserva.exception.CuposInsuficientesException;
import com.voy.velvo.ms_reserva.exception.RecursoDuplicadoException;
import com.voy.velvo.ms_reserva.exception.RecursoNoEncontradoException;
import com.voy.velvo.ms_reserva.model.Dto.RutaDTO;
import com.voy.velvo.ms_reserva.model.Dto.UsuarioDTO;
import com.voy.velvo.ms_reserva.model.Reserva;
import com.voy.velvo.ms_reserva.repository.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private PagoClient pagoClient;

    @Mock
    private UsuarioClient usuarioClient;

    @Mock
    private RutaClient rutaClient;

    @InjectMocks
    private ReservaService reservaService;

    private Reserva reserva;
    private UsuarioDTO usuario;
    private RutaDTO ruta;

    @BeforeEach
    void setUp() {
        reserva = new Reserva();
        reserva.setUsuarioId(1L);
        reserva.setRutaId(1L);
        reserva.setCantidadPersonas(2);
        reserva.setNecesitaGuia(true);
        reserva.setFechaReserva(LocalDate.of(2026, 6, 25));

        usuario = new UsuarioDTO();
        usuario.setId(1L);
        usuario.setNombre("Usuario prueba");
        usuario.setEmail("usuario@correo.cl");
        usuario.setTelefono("999999999");

        ruta = new RutaDTO();
        ruta.setId(1L);
        ruta.setNombre("Cajón del Maipo");
        ruta.setUbicacion("San José de Maipo");
        ruta.setDificultad("Media");
        ruta.setPrecio(35000.0);
        ruta.setCupoMaximo(15);
        ruta.setAptoNinos(true);
        ruta.setAptoMascotas(false);
    }

    @Test
    void crearReserva_deberiaGuardarReservaYCrearPago() {
        when(usuarioClient.obtenerUsuarioPorId(1L)).thenReturn(usuario);
        when(reservaRepository.existsByUsuarioIdAndRutaId(1L, 1L)).thenReturn(false);
        when(rutaClient.obtenerRutaPorId(1L)).thenReturn(ruta);

        Reserva reservaGuardada = new Reserva();
        reservaGuardada.setId(1L);
        reservaGuardada.setUsuarioId(1L);
        reservaGuardada.setRutaId(1L);
        reservaGuardada.setCantidadPersonas(2);
        reservaGuardada.setNecesitaGuia(true);
        reservaGuardada.setFechaReserva(LocalDate.of(2026, 6, 25));
        reservaGuardada.setEstadoPago("PENDIENTE");

        when(reservaRepository.save(any(Reserva.class)))
                .thenReturn(reservaGuardada);

        Reserva resultado = reservaService.crearReserva(reserva);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("PROCESANDO", resultado.getEstadoPago());

        verify(usuarioClient).obtenerUsuarioPorId(1L);
        verify(rutaClient).obtenerRutaPorId(1L);
        verify(rutaClient).descontarCupos(1L, 2);
        verify(pagoClient).crearPagoInterno(any());
        verify(reservaRepository, times(2)).save(any(Reserva.class));
    }

    @Test
    void crearReserva_deberiaLanzarErrorSiUsuarioNoExiste() {
        when(usuarioClient.obtenerUsuarioPorId(999L))
                .thenThrow(new RuntimeException("Usuario no encontrado"));

        reserva.setUsuarioId(999L);

        assertThrows(RecursoNoEncontradoException.class,
                () -> reservaService.crearReserva(reserva));

        verify(reservaRepository, never()).save(any());
    }

    @Test
    void crearReserva_deberiaLanzarErrorSiReservaDuplicada() {
        when(usuarioClient.obtenerUsuarioPorId(1L)).thenReturn(usuario);
        when(reservaRepository.existsByUsuarioIdAndRutaId(1L, 1L)).thenReturn(true);

        assertThrows(RecursoDuplicadoException.class,
                () -> reservaService.crearReserva(reserva));

        verify(reservaRepository, never()).save(any());
    }

    @Test
    void crearReserva_deberiaLanzarErrorSiRutaNoExiste() {
        when(usuarioClient.obtenerUsuarioPorId(1L)).thenReturn(usuario);
        when(reservaRepository.existsByUsuarioIdAndRutaId(1L, 1L)).thenReturn(false);
        when(rutaClient.obtenerRutaPorId(1L))
                .thenThrow(new RuntimeException("Ruta no encontrada"));

        assertThrows(RecursoNoEncontradoException.class,
                () -> reservaService.crearReserva(reserva));

        verify(reservaRepository, never()).save(any());
    }

    @Test
    void crearReserva_deberiaLanzarErrorSiNoHayCupos() {
        ruta.setCupoMaximo(1);

        when(usuarioClient.obtenerUsuarioPorId(1L)).thenReturn(usuario);
        when(reservaRepository.existsByUsuarioIdAndRutaId(1L, 1L)).thenReturn(false);
        when(rutaClient.obtenerRutaPorId(1L)).thenReturn(ruta);

        assertThrows(CuposInsuficientesException.class,
                () -> reservaService.crearReserva(reserva));

        verify(rutaClient, never()).descontarCupos(anyLong(), anyInt());
        verify(reservaRepository, never()).save(any());
    }
}