
package com.voy_vuelvo.api_getaway.controller;

import com.voy_vuelvo.api_getaway.dto.LoginRequest;
import com.voy_vuelvo.api_getaway.dto.TokenResponse;
import com.voy_vuelvo.api_getaway.model.Usuario;
import com.voy_vuelvo.api_getaway.service.AuthService;
import com.voy_vuelvo.api_getaway.util.JwtUtil;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // INICIO DE SESIÓN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        // Comprobar que se ingresaron las credenciales.
        if (loginRequest == null
                || loginRequest.getUsername() == null
                || loginRequest.getPassword() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Debes ingresar usuario y contraseña.");
        }

        // Verificar las credenciales en MySQL.
        Usuario usuario = authService.autenticar(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        if (usuario == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenciales inválidas.");
        }

        // Obtener el rol real del usuario.
        String rol;

        try {
            rol = authService.obtenerRol(usuario);
        } catch (IllegalStateException ex) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("La cuenta no tiene un rol válido asignado.");
        }

        // Generar JWT con usuario y rol verificados.
        String token = jwtUtil.generateToken(
                usuario.getUsername(),
                rol
        );

        return ResponseEntity.ok(
                new TokenResponse(token)
        );
    }

    // REGISTRO DE USUARIOS
    @PostMapping("/register")
    public ResponseEntity<String> registrar(
            @RequestBody Usuario usuarioDTO) {

        if (usuarioDTO == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Debes ingresar los datos del usuario.");
        }

        try {

            // AuthService asigna siempre el rol CLIENTE.
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
}
