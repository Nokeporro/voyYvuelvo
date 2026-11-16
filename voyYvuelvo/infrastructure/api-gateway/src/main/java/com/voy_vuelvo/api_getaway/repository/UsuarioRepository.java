package com.voy_vuelvo.api_getaway.repository;

import com.voy_vuelvo.api_getaway.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Usuario findByUsername(String username);

}