package com.voy.vuelvo.ms_ruta.repository;


import com.voy.vuelvo.ms_ruta.model.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface RutaRepository extends JpaRepository<Ruta, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Ruta r where r.id = :id")
    Optional<Ruta> buscarParaActualizar(@Param("id") Long id);

}