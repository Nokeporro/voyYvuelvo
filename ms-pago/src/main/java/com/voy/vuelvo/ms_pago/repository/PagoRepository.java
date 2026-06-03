package com.voy.vuelvo.ms_pago.repository;

import com.voy.vuelvo.ms_pago.model.Pago;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoRepository extends CrudRepository<Pago, Long> {
}