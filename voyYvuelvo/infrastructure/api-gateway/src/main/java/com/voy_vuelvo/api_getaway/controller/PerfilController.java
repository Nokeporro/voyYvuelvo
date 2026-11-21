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

    // ==========================================
    // 2. REGISTRAR PERFIL DEL CLIENTE
    // POST /auth/perfil
    // ==========================================

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

        // Validar el correo.
        if (!email.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            return Mono.error(new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes ingresar un correo valido."
            ));
        }

        // Obtener usuario autenticado.
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

                    // Comprobar rol CLIENTE.
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

                    String username = authentication.getName();

                    // Consultar si ya existe un perfil.
                    // JPA es bloqueante, por eso usamos
                    // boundedElastic.
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

                                // Crear el perfil en ms-usuario.
                                return usuarioClient.post()
                                        .uri("/api/usuarios")
                                        .bodyValue(Map.of(
                                                "nombre", nombre,
                                                "email", email,
                                                "telefono", telefono
                                        ))
                                        .retrieve()
                                        .bodyToMono(JsonNode.class)

                                        // Gestionar errores del microservicio.
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

                                            // Obtener el ID creado.
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

                                            // Vincular perfil con la cuenta JWT.
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

    // ==========================================
    // 3. CONSULTAR MI PERFIL CON JWT
    // GET /auth/perfil
    // NUEVO METODO
    // ==========================================

    @GetMapping("/perfil")
    public Mono<ResponseEntity<JsonNode>> consultarMiPerfil() {

        // Recuperar el usuario autenticado
        // desde Spring Security.
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

                    // Solo CLIENTE puede consultar
                    // este endpoint de perfil personal.
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
                                        "Solo los clientes pueden consultar su perfil."
                                )
                        );
                    }

                    // El username viene del JWT validado.
                    // No aceptamos un ID desde React.
                    String username = authentication.getName();

                    // Buscar el perfil vinculado en bd_gateway.
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

                                if (perfilId <= 0) {
                                    return Mono.error(
                                            new ResponseStatusException(
                                                    HttpStatus.NOT_FOUND,
                                                    "La cuenta no tiene un perfil vinculado."
                                            )
                                    );
                                }

                                // Consultar el perfil en ms-usuario.
                                return usuarioClient.get()
                                        .uri(
                                                "/api/usuarios/{id}",
                                                perfilId
                                        )
                                        .retrieve()
                                        .bodyToMono(JsonNode.class)

                                        // Si el perfil no existe.
                                        .onErrorMap(
                                                WebClientResponseException.class,
                                                error ->
                                                        new ResponseStatusException(
                                                                error.getStatusCode().value() == 404
                                                                        ? HttpStatus.NOT_FOUND
                                                                        : HttpStatus.BAD_GATEWAY,
                                                                "No fue posible consultar el perfil.",
                                                                error
                                                        )
                                        )

                                        // Si ms-usuario no responde.
                                        .onErrorMap(
                                                WebClientRequestException.class,
                                                error ->
                                                        new ResponseStatusException(
                                                                HttpStatus.BAD_GATEWAY,
                                                                "No se pudo conectar con ms-usuario.",
                                                                error
                                                        )
                                        )

                                        .map(ResponseEntity::ok);
                            });
                });
    }

    // ==========================================
    // 4. VINCULAR PERFIL EN BD_GATEWAY
    // ==========================================

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
                            "mensaje",
                            "Perfil creado y vinculado correctamente.",
                            "perfilUsuarioId", idVinculado,
                            "nombre", nombre,
                            "email", email,
                            "telefono", telefono
                    );

                    return ResponseEntity
                            .status(HttpStatus.CREATED)
                            .body(respuesta);
                })

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
