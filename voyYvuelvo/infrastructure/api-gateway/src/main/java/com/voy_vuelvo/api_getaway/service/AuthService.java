package com.voy_vuelvo.api_getaway.service;

import com.voy_vuelvo.api_getaway.model.Usuario;
import com.voy_vuelvo.api_getaway.repository.UsuarioRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // 1. AUTENTICAR USUARIO
    public Usuario autenticar(String username, String password) {

        if (username == null || username.isBlank()
                || password == null) {
            return null;
        }

        Usuario usuario =
                usuarioRepository.findByUsername(username.trim());

        if (usuario == null || usuario.getPassword() == null) {
            return null;
        }

        boolean passwordCorrecta = passwordEncoder.matches(
                password,
                usuario.getPassword()
        );

        return passwordCorrecta ? usuario : null;
    }

    // 2. VALIDAR CREDENCIALES
    public boolean validarCredenciales(
            String username,
            String password) {

        return autenticar(username, password) != null;
    }

    // 3. OBTENER ROL DEL USUARIO
    public String obtenerRol(Usuario usuario) {

        if (usuario == null
                || usuario.getRol() == null
                || usuario.getRol().isBlank()) {

            throw new IllegalStateException(
                    "El usuario no tiene un rol asignado."
            );
        }

        String rol = usuario.getRol()
                .trim()
                .toUpperCase(Locale.ROOT)
                .replaceFirst("^ROLE_", "");

        if (!Set.of(
                "ADMINISTRADOR",
                "VENDEDOR",
                "CLIENTE"
        ).contains(rol)) {

            throw new IllegalStateException(
                    "El usuario tiene un rol no válido."
            );
        }

        return rol;
    }

    // 4. REGISTRAR USUARIO
    public void registrarUsuario(
            String username,
            String password) {

        if (username == null || username.isBlank()) {

            throw new IllegalArgumentException(
                    "El nombre de usuario es obligatorio."
            );
        }

        if (password == null || password.length() < 8) {

            throw new IllegalArgumentException(
                    "La contraseña debe tener al menos 8 caracteres."
            );
        }

        String nombreUsuario = username.trim();

        if (usuarioRepository.findByUsername(nombreUsuario) != null) {

            throw new IllegalArgumentException(
                    "El usuario ya está registrado."
            );
        }

        String hash = passwordEncoder.encode(password);

        Usuario usuario = new Usuario(nombreUsuario, hash);

        usuario.setRol("CLIENTE");
        usuario.setPerfilUsuarioId(null);

        usuarioRepository.save(usuario);
    }

    // 5. CONSULTAR PERFIL VINCULADO
    @Transactional(readOnly = true)
    public Long obtenerPerfilUsuarioId(String username) {

        if (username == null || username.isBlank()) {

            throw new IllegalArgumentException(
                    "Usuario inválido."
            );
        }

        Usuario usuario =
                usuarioRepository.findByUsername(username);

        if (usuario == null) {

            throw new IllegalArgumentException(
                    "La cuenta no existe."
            );
        }

        return usuario.getPerfilUsuarioId();
    }

    // 6. VINCULAR PERFIL NUEVO
    @Transactional
    public Long vincularPerfilNuevo(
            String username,
            Long perfilUsuarioId) {

        if (username == null || username.isBlank()) {

            throw new IllegalArgumentException(
                    "Usuario inválido."
            );
        }

        if (perfilUsuarioId == null || perfilUsuarioId <= 0) {

            throw new IllegalArgumentException(
                    "El ID del perfil es inválido."
            );
        }

        Usuario usuario =
                usuarioRepository.findByUsername(username);

        if (usuario == null) {

            throw new IllegalArgumentException(
                    "La cuenta no existe."
            );
        }

        if (!"CLIENTE".equals(obtenerRol(usuario))) {

            throw new IllegalStateException(
                    "Solo una cuenta Cliente puede registrar un perfil."
            );
        }

        if (usuario.getPerfilUsuarioId() != null) {

            throw new IllegalStateException(
                    "La cuenta ya tiene un perfil vinculado."
            );
        }

        usuario.setPerfilUsuarioId(perfilUsuarioId);

        usuarioRepository.saveAndFlush(usuario);

        return perfilUsuarioId;
    }

    // 7. CONSULTAR ROL ACTUAL PARA RENOVAR JWT
    @Transactional(readOnly = true)
    public String obtenerRolActual(String username) {

        Usuario usuario =
                usuarioRepository.findByUsername(username);

        if (usuario == null) {
            return null;
        }

        return obtenerRol(usuario);
    }
}
