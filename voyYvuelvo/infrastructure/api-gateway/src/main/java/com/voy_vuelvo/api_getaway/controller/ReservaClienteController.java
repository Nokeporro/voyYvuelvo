package com.voy_vuelvo.api_getaway.controller;

import com.fasterxml.jackson.databind.JsonNode;

import com.voy_vuelvo.api_getaway.dto.ReservaClienteRequest;
import com.voy_vuelvo.api_getaway.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import org.springframework.web.server.ResponseStatusException;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class ReservaClienteController {

    private final AuthService authService;
    private final WebClient reservaClient;

    // ---------------------------------------------------------
    // 1. CONSTRUCTOR
    // ---------------------------------------------------------

    public ReservaClienteController(AuthService authService) {

        this.authService = authService;

        // Conexion interna con el microservicio de reservas.
        this.reservaClient = WebClient.builder()
                .baseUrl("http://ms-reserva:8083")
                .build();
    }

    // ---------------------------------------------------------
    // 2. CREAR RESERVA DEL CLIENTE
    // POST /auth/reservas
    // ---------------------------------------------------------

    @PostMapping("/reservas")
    public Mono<ResponseEntity<JsonNode>> crearReserva(
            @RequestBody ReservaClienteRequest request) {

        // 3. VALIDAR DATOS OBLIGATORIOS
        if (request == null
                || request.rutaId() == null
                || request.rutaId() <= 0
                || request.cantidadPersonas() == null
                || request.cantidadPersonas() <= 0
                || request.fechaReserva() == null
                || request.necesitaGuia() == null) {

            return Mono.error(
                    new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Debes ingresar una ruta, cantidad de personas, fecha y opcion de guia validas."
                    )
            );
        }

        // 4. VALIDAR EQUIPAMIENTOS
        if (request.equipamientos() != null) {

            for (var equipo : request.equipamientos()) {

                if (equipo == null
                        || equipo.equipamientoId() == null
                        || equipo.equipamientoId() <= 0
                        || equipo.cantidad() == null
                        || equipo.cantidad() <= 0) {

                    return Mono.error(
                            new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Los equipamientos deben tener ID y cantidad validos."
                            )
                    );
                }
            }
        }

        // ---------------------------------------------------------
        // 5. OBTENER EL CLIENTE DESDE EL JWT
        // ---------------------------------------------------------

        return ReactiveSecurityContextHolder.getContext()

                .switchIfEmpty(
                        Mono.error(
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Debes iniciar sesion."
                                )
                        )
                )

                .flatMap(context -> {

                    Authentication authentication =
                            context.getAuthentication();

                    if (authentication == null
                            || !authentication.isAuthenticated()) {

                        return Mono.error(
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Usuario no autenticado."
                                )
                        );
                    }

                    // -------------------------------------------------
                    // 6. COMPROBAR QUE SEA CLIENTE
                    // -------------------------------------------------

                    boolean esCliente = authentication
                            .getAuthorities()
                            .stream()
                            .anyMatch(autoridad ->
                                    "ROLE_CLIENTE".equals(
                                            autoridad.getAuthority()
                                    )
                            );

                    if (!esCliente) {

                        return Mono.error(
                                new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "Solo los clientes pueden crear reservas."
                                )
                        );
                    }

                    // Username obtenido de la autenticacion JWT.
                    String username = authentication.getName();

                    // -------------------------------------------------
                    // 7. BUSCAR PERFIL VINCULADO EN MYSQL
                    // -------------------------------------------------

                    // AuthService usa JPA, por eso ejecutamos
                    // la consulta fuera del hilo reactivo.
                    return Mono.fromCallable(() -> {

                                Long perfilId =
                                        authService.obtenerPerfilUsuarioId(
                                                username
                                        );

                                return perfilId == null
                                        ? 0L
                                        : perfilId;
                            })

                            .subscribeOn(Schedulers.boundedElastic())

                            .flatMap(perfilId -> {

                                // Si no tiene perfil, no puede reservar.
                                if (perfilId <= 0) {

                                    return Mono.error(
                                            new ResponseStatusException(
                                                    HttpStatus.CONFLICT,
                                                    "Primero debes registrar tu perfil."
                                            )
                                    );
                                }

                                // -------------------------------------
                                // 8. PREPARAR EQUIPAMIENTOS
                                // -------------------------------------

                                List<Map<String, Object>> equipamientos =
                                        request.equipamientos() == null
                                                ? List.of()
                                                : request.equipamientos()
                                                        .stream()
                                                        .map(equipo ->
                                                                Map.<String, Object>of(
                                                                        "equipamientoId",
                                                                        equipo.equipamientoId(),
                                                                        "cantidad",
                                                                        equipo.cantidad()
                                                                )
                                                        )
                                                        .toList();

                                // -------------------------------------
                                // 9. CONSTRUIR LOS DATOS DE LA RESERVA
                                // -------------------------------------

                                Map<String, Object> datosReserva =
                                        new LinkedHashMap<>();

                                // El ID viene de MySQL.
                                // Nunca se recibe desde React.
                                datosReserva.put(
                                        "usuarioId",
                                        perfilId
                                );

                                datosReserva.put(
                                        "rutaId",
                                        request.rutaId()
                                );

                                datosReserva.put(
                                        "cantidadPersonas",
                                        request.cantidadPersonas()
                                );

                                datosReserva.put(
                                        "fechaReserva",
                                        request.fechaReserva()
                                );

                                datosReserva.put(
                                        "necesitaGuia",
                                        request.necesitaGuia()
                                );

                                datosReserva.put(
                                        "equipamientos",
                                        equipamientos
                                );

                                // No enviamos estadoPago.
                                // ReservaService lo establece.

                                // -------------------------------------
                                // 10. ENVIAR RESERVA A MS-RESERVA
                                // -------------------------------------

                                return reservaClient.post()
                                        .uri("/api/reservas")
                                        .bodyValue(datosReserva)
                                        .retrieve()
                                        .bodyToMono(JsonNode.class)

                                        // ---------------------------------
                                        // 11. MANEJAR ERRORES DEL SERVICIO
                                        // ---------------------------------

                                        .onErrorMap(
                                                WebClientResponseException.class,
                                                error -> {

                                                    int codigo =
                                                            error.getStatusCode()
                                                                    .value();

                                                    HttpStatus estado;

                                                    if (codigo == 400) {

                                                        estado =
                                                                HttpStatus.BAD_REQUEST;

                                                    } else if (codigo == 404) {

                                                        estado =
                                                                HttpStatus.NOT_FOUND;

                                                    } else if (codigo == 409) {

                                                        estado =
                                                                HttpStatus.CONFLICT;

                                                    } else if (codigo >= 400
                                                            && codigo < 500) {

                                                        estado =
                                                                HttpStatus.BAD_REQUEST;

                                                    } else {

                                                        estado =
                                                                HttpStatus.BAD_GATEWAY;
                                                    }

                                                    return new ResponseStatusException(
                                                            estado,
                                                            "No fue posible crear la reserva.",
                                                            error
                                                    );
                                                }
                                        )

                                        // Error de conexion con ms-reserva.
                                        .onErrorMap(
                                                WebClientRequestException.class,
                                                error ->
                                                        new ResponseStatusException(
                                                                HttpStatus.BAD_GATEWAY,
                                                                "No se pudo conectar con ms-reserva.",
                                                                error
                                                        )
                                        )

                                        // ---------------------------------
                                        // 12. DEVOLVER RESERVA CREADA
                                        // ---------------------------------

                                        .map(reservaCreada ->
                                                ResponseEntity
                                                        .status(HttpStatus.CREATED)
                                                        .body(reservaCreada)
                                        );
                            });
                });
    }
}
