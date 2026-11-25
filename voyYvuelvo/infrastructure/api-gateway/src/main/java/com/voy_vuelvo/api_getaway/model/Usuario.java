package com.voy_vuelvo.api_getaway.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre utilizado para iniciar sesión.
    @Column(nullable = false, unique = true)
    private String username;

    // Contraseña cifrada con BCrypt.
    private String password;

    // CLIENTE, VENDEDOR o ADMINISTRADOR.
    private String rol;

    // ID del perfil correspondiente en bd_usuario.
    // Puede quedar vacío mientras no exista vinculación.
    @Column(
        name = "perfil_usuario_id",
        unique = true
    )
    private Long perfilUsuarioId;

    // Constructor utilizado al registrar una cuenta.
    public Usuario(String username, String password) {
        this.username = username;
        this.password = password;
        this.rol = "CLIENTE";
    }
}
