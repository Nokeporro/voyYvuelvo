package com.voy.velvo.ms_reserva.repository;

import com.voy.velvo.ms_reserva.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
}
