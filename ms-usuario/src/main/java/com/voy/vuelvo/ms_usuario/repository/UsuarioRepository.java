package com.voy.vuelvo.ms_usuario.repository;

import com.voy.vuelvo.ms_usuario.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

}