package com.voy.vuelvo.ms_ruta.repository;


import com.voy.vuelvo.ms_ruta.model.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RutaRepository extends JpaRepository<Ruta, Long> {

}