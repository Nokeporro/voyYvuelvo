package com.voy.vuelvo.ms_pago.service;

import com.voy.vuelvo.ms_pago.model.Pago;
import java.util.List;

public interface PagoService {
    List<Pago> findAll();
    Pago save(Pago pago);
    Pago findById(Long id);
}