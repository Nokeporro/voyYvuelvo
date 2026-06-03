package com.voy_vuelvo.ms_equipamiento.repository;

import com.voy_vuelvo.ms_equipamiento.model.Equipamiento;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface EquipamientoRepository extends JpaRepository<Equipamiento, Long> {

    List<Equipamiento> findByDisponibleTrue();


    List<Equipamiento> findByDisponibleTrueAndObligatorioTrue();


    List<Equipamiento> findByDisponibleTrueAndObligatorioTrueAndImpermeableTrue();

    List<Equipamiento> findByDificultad(String dificultad);



}