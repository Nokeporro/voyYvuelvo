package com.voy_vuelvo.api_getaway.controller;

import com.fasterxml.jackson.databind.JsonNode;

import com.voy_vuelvo.api_getaway.dto.PerfilRequest;
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

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class PerfilController {

    private final AuthService authService;
    private final WebClient usuarioClient;

    // 1. CONSTRUCTOR
    public PerfilController(AuthService authService) {

        this.authService = authService;

        // Conexion interna con ms-usuario en Docker.
        this.usuarioClient = WebClient.builder()
                .baseUrl("http://ms-usuario:8084")
                .build();
    }

    // 2. REGISTRAR PERFIL
    // POST /auth/perfil
    @PostMapping("/perfil")
    public Mono<ResponseEntity<Map<String, Object>>> crearPerfil(
            @RequestBody PerfilRequest request) {

        // Comprobar los datos recibidos.
        if (request == null
                || request.getNombre() == null
                || request.getNombre().isBlank()
                || request.getEmail() == null
                || request.getEmail().isBlank()
                || request.getTelefono() == null
                || request.getTelefono().isBlank()) {

            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nombre, correo y telefono son obligatorios."
            ));
        }

        String nombre = request.getNombre().trim();

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        String telefono = request.getTelefono().trim();

        // Validar el formato del correo.
        if (!email.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes ingresar un correo valido."
            ));
        }

        // 3. OBTENER USUARIO AUTENTICADO
        return ReactiveSecurityContextHolder.getContext()

                .switchIfEmpty(Mono.error(
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Debes iniciar sesion."
                        )
                ))

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

                    // 4. COMPROBAR ROL CLIENTE
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
                                        "Solo los clientes pueden crear perfiles."
                                )
                        );
                    }

                    // Identidad obtenida desde Spring Security.
                    String username = authentication.getName();

                    // 5. COMPROBAR PERFIL EXISTENTE
                    // JPA es bloqueante; se ejecuta
                    // fuera del hilo reactivo principal.
                    return Mono.fromCallable(() -> {

                                Long perfilExistente =
                                        authService.obtenerPerfilUsuarioId(
                                                username
                                        );

                                return perfilExistente == null
                                        ? 0L
                                        : perfilExistente;
                            })

                            .subscribeOn(Schedulers.boundedElastic())

                            .flatMap(perfilExistente -> {

                                if (perfilExistente > 0) {

                                    return Mono.error(
                                            new ResponseStatusException(
                                                    HttpStatus.CONFLICT,
                                                    "La cuenta ya tiene un perfil vinculado."
                                            )
                                    );
                                }

                                // 6. CREAR PERFIL EN MS-USUARIO
                                // No recibimos ningun ID del navegador.
                                return usuarioClient.post()
                                        .uri("/api/usuarios")
                                        .bodyValue(Map.of(
                                                "nombre", nombre,
                                                "email", email,
                                                "telefono", telefono
                                        ))
                                        .retrieve()
                                        .bodyToMono(JsonNode.class)

                                        // Gestionar errores del servicio.
                                        .onErrorMap(
                                                WebClientResponseException.class,
                                                error -> {
                                                    HttpStatus status =
                                                            error.getStatusCode().value() == 409
                                                                    ? HttpStatus.CONFLICT
                                                                    : error.getStatusCode().is4xxClientError()
                                                                    ? HttpStatus.BAD_REQUEST
                                                                    : HttpStatus.BAD_GATEWAY;

                                                    return new ResponseStatusException(
                                                            status,
                                                            "No fue posible crear el perfil.",
                                                            error
                                                    );
                                                }
                                        )

                                        .onErrorMap(
                                                WebClientRequestException.class,
                                                error ->
                                                        new ResponseStatusException(
                                                                HttpStatus.BAD_GATEWAY,
                                                                "No se pudo conectar con ms-usuario.",
                                                                error
                                                        )
                                        )

                                        .flatMap(perfilCreado -> {

                                            // 7. OBTENER ID DEL NUEVO PERFIL
                                            // ms-usuario entrega el ID
                                            // en la respuesta JSON.
                                            Long perfilId = perfilCreado
                                                    .path("id")
                                                    .asLong(0L);

                                            if (perfilId <= 0) {
                                                return Mono.error(
                                                        new ResponseStatusException(
                                                                HttpStatus.BAD_GATEWAY,
                                                                "El servicio no entrego un ID valido."
                                                        )
                                                );
                                            }

                                            // 8. VINCULAR PERFIL A LA CUENTA JWT
                                            return vincularPerfil(
                                                    username,
                                                    perfilId,
                                                    nombre,
                                                    email,
                                                    telefono
                                            );
                                        });
                            });
                });
    }

    // 9. GUARDAR VINCULACION EN BD_GATEWAY
    private Mono<ResponseEntity<Map<String, Object>>> vincularPerfil(
            String username,
            Long perfilId,
            String nombre,
            String email,
            String telefono) {

        return Mono.fromCallable(() ->

                        authService.vincularPerfilNuevo(
                                username,
                                perfilId
                        )
                )

                .subscribeOn(Schedulers.boundedElastic())

                .map(idVinculado -> {

                    Map<String, Object> respuesta = Map.of(
                            "mensaje", "Perfil creado y vinculado correctamente.",
                            "perfilUsuarioId", idVinculado,
                            "nombre", nombre,
                            "email", email,
                            "telefono", telefono
                    );

                    return ResponseEntity
                            .status(HttpStatus.CREATED)
                            .body(respuesta);
                })

                // 10. RECUPERACION ANTE ERRORES
                // Si falla la vinculacion, intentar
                // eliminar el perfil recien creado.
                .onErrorResume(error ->

                        usuarioClient.delete()
                                .uri(
                                        "/api/usuarios/{id}",
                                        perfilId
                                )
                                .retrieve()
                                .toBodilessEntity()

                                .onErrorResume(
                                        errorEliminacion ->
                                                Mono.empty()
                                )

                                .then(Mono.error(
                                        new ResponseStatusException(
                                                HttpStatus.CONFLICT,
                                                "No se pudo vincular el perfil.",
                                                error
                                        )
                                ))
                );
    }
}
