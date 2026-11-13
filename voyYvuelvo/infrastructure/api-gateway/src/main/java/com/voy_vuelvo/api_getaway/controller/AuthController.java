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

    public AuthController(JwtUtil jwtUtil, AuthService authService) {
        this.jwtUtil = jwtUtil;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        if (authService.validarCredenciales(
                loginRequest.getUsername(),
                loginRequest.getPassword())) {

            String token =
                    jwtUtil.generateToken(
                            loginRequest.getUsername());

            return ResponseEntity.ok(
                    new TokenResponse(token));
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Credenciales inválidas");
    }

    @PostMapping("/register")
    public ResponseEntity<String> registrar(
            @RequestBody Usuario usuarioDTO) {

        authService.registrarUsuario(
                usuarioDTO.getUsername(),
                usuarioDTO.getPassword());

        return ResponseEntity.ok(
                "Usuario registrado correctamente");
    }
}