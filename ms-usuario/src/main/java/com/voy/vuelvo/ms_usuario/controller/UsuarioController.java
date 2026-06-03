package com.voy.vuelvo.ms_usuario.controller;

import com.voy.vuelvo.ms_usuario.models.Usuario;
import com.voy.vuelvo.ms_usuario.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;


    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.findAll());
    }


    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(
            @RequestBody @Valid Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.save(usuario);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevoUsuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.findById(id);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado con ID: " + id);
        }
    }
}