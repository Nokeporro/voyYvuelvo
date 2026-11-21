package com.voy_vuelvo.api_getaway.controller;

import com.voy_vuelvo.api_getaway.model.Usuario;
import com.voy_vuelvo.api_getaway.repository.UsuarioRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;

// CONTROLADOR PARA ADMINISTRAR CONSULTAS DE CUENTAS
@RestController
@RequestMapping("/auth")
public class AdminCuentasController {

    private final UsuarioRepository usuarioRepository;

    // 1. CONSTRUCTOR
    public AdminCuentasController(
            UsuarioRepository usuarioRepository) {

        this.usuarioRepository = usuarioRepository;
    }

    // 2. RESPUESTA SEGURA
    // No exponemos contrasenas ni hashes.
    public record CuentaResumen(
            Long id,
            String username,
            String rol,
            Long perfilUsuarioId
    ) {
    }

    // 3. CONSULTAR TODAS LAS CUENTAS
    // GET /auth/cuentas
    // Acceso exclusivo del ADMINISTRADOR.
    @GetMapping("/cuentas")
    public Mono<List<CuentaResumen>> listarCuentas() {

        // Las consultas JPA son bloqueantes.
        // Las ejecutamos fuera del hilo reactivo.
        return Mono.fromCallable(() ->

                usuarioRepository.findAll()
                        .stream()
                        .map(this::convertirCuenta)
                        .toList()

        ).subscribeOn(Schedulers.boundedElastic());
    }

    // 4. CONVERTIR USUARIO A RESPUESTA SEGURA
    private CuentaResumen convertirCuenta(Usuario usuario) {

        return new CuentaResumen(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol(),
                usuario.getPerfilUsuarioId()
        );
    }
}
