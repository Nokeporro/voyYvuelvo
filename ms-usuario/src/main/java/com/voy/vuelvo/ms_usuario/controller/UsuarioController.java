package com.voy.vuelvo.ms_usuario.controller;

import com.voy.vuelvo.ms_usuario.models.Usuario;
import com.voy.vuelvo.ms_usuario.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name="Usuario", description = "Gestor de usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

//-------------------------------------------------------------------------
    @Operation(summary = "Listar usuarios",
            description = "Obtiene todos los usuarios registrados")
    @GetMapping
    public CollectionModel<Usuario> listarTodos() {

        List<Usuario> usuarios = usuarioService.findAll();

        return CollectionModel.of(usuarios,
                linkTo(methodOn(UsuarioController.class).listarTodos()).withSelfRel()
        );
    }
//----------------------------------------------------------------------

@Operation(summary = "Crear usuario",
        description = "Registra un nuevo usuario")
@PostMapping
public EntityModel<Usuario> crearUsuario(
        @RequestBody @Valid Usuario usuario) {

    Usuario nuevoUsuario = usuarioService.save(usuario);

    return EntityModel.of(nuevoUsuario,
            linkTo(methodOn(UsuarioController.class).obtenerPorId(nuevoUsuario.getId())).withSelfRel(),
            linkTo(methodOn(UsuarioController.class).listarTodos()).withRel("usuarios")
    );
}
//-------------------------------------------------------------------------
@Operation(summary = "Buscar usuario por ID",
        description = "Obtiene un usuario según su identificador")
@GetMapping("/{id}")
public ResponseEntity<?> obtenerPorId(
        @PathVariable Long id) {

    Usuario usuario = usuarioService.findById(id);

    if (usuario != null) {
        EntityModel<Usuario> model = EntityModel.of(usuario,
                linkTo(methodOn(UsuarioController.class).obtenerPorId(id)).withSelfRel(),
                linkTo(methodOn(UsuarioController.class).listarTodos()).withRel("usuarios")
                );
        return ResponseEntity.ok(model);
    }
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body("Usuario no encontrado con ID: " + id);
    }
}
