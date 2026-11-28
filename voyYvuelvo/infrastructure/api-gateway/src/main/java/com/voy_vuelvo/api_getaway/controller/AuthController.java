package com.voy_vuelvo.api_getaway.controller;

import com.voy_vuelvo.api_getaway.dto.LoginRequest;
import com.voy_vuelvo.api_getaway.dto.TokenResponse;
import com.voy_vuelvo.api_getaway.model.Usuario;
import com.voy_vuelvo.api_getaway.service.AuthService;
import com.voy_vuelvo.api_getaway.util.JwtUtil;

import io.jsonwebtoken.JwtException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final AuthService authService;

    public AuthController(
            JwtUtil jwtUtil,
            AuthService authService) {

        this.jwtUtil = jwtUtil;
        this.authService = authService;
    }

    // 1. INICIO DE SESION
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        if (loginRequest == null
                || loginRequest.getUsername() == null
                || loginRequest.getPassword() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Debes ingresar usuario y contraseña.");
        }

        Usuario usuario = authService.autenticar(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        if (usuario == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales inválidas.");
        }

        String rol;

        try {

            rol = authService.obtenerRol(usuario);

        } catch (IllegalStateException ex) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("La cuenta no tiene un rol válido asignado.");
        }

        String token = jwtUtil.generateToken(
                usuario.getUsername(),
                rol
        );

        return ResponseEntity.ok(
                new TokenResponse(token)
        );
    }

    // 2. REGISTRO DE USUARIOS
    @PostMapping("/register")
    public ResponseEntity<String> registrar(
            @RequestBody Usuario usuarioDTO) {

        if (usuarioDTO == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Debes ingresar los datos del usuario.");
        }

        try {

            authService.registrarUsuario(
                    usuarioDTO.getUsername(),
                    usuarioDTO.getPassword()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("Usuario registrado correctamente.");

        } catch (IllegalArgumentException ex) {

            HttpStatus status = "El usuario ya está registrado."
                    .equals(ex.getMessage())
                    ? HttpStatus.CONFLICT
                    : HttpStatus.BAD_REQUEST;

            return ResponseEntity
                    .status(status)
                    .body(ex.getMessage());
        }
    }

    // 3. RENOVACION DEL TOKEN JWT
    @PostMapping("/refresh")
    public Mono<ResponseEntity<?>> renovarToken(
            @RequestHeader(
                    value = HttpHeaders.AUTHORIZATION,
                    required = false
            ) String authorization) {

        return Mono.<ResponseEntity<?>>fromCallable(() -> {

            if (authorization == null
                    || !authorization.startsWith("Bearer ")) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Token requerido.");
            }

            try {

                String token =
                        authorization.substring(7).trim();

                // Validar firma y vencimiento.
                jwtUtil.validateToken(token);

                // Obtener la identidad del usuario.
                String username =
                        jwtUtil.extractUsername(token);

                // Consultar el rol actual en MySQL.
                String rolActual =
                        authService.obtenerRolActual(username);

                if (rolActual == null) {

                    return ResponseEntity
                            .status(HttpStatus.UNAUTHORIZED)
                            .body("La cuenta no existe.");
                }

                // Generar un nuevo JWT.
                String nuevoToken =
                        jwtUtil.renovarToken(token, rolActual);

                return ResponseEntity.ok(
                        new TokenResponse(nuevoToken)
                );

            } catch (JwtException | IllegalArgumentException ex) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Debes iniciar sesión nuevamente.");

            } catch (IllegalStateException ex) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("La cuenta no tiene permisos válidos.");
            }

        }).subscribeOn(Schedulers.boundedElastic());
    }
}
