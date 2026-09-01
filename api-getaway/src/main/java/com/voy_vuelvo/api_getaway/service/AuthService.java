package com.voy_vuelvo.api_getaway.service;

import com.voy_vuelvo.api_getaway.model.Usuario;
import com.voy_vuelvo.api_getaway.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public boolean validarCredenciales(String username, String password) {

        Usuario usuario =
                usuarioRepository.findByUsername(username);

        if (usuario != null) {

            return passwordEncoder.matches(
                    password,
                    usuario.getPassword()
            );
        }

        return false;
    }

    public void registrarUsuario(
            String username,
            String password
    ) {

        String hash =
                passwordEncoder.encode(password);

        Usuario usuario =
                new Usuario(username, hash);

        usuarioRepository.save(usuario);
    }
}