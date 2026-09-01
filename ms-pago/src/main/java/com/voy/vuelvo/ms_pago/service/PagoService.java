package com.voy.vuelvo.ms_pago.service;

import com.voy.vuelvo.ms_pago.model.Pago;
import java.util.List;

public interface PagoService {

    List<Pago> findAll();

    Pago findById(Long id);

    Pago save(Pago pago);

    Pago update(Long id, Pago pago);

    void delete(Long id);



    //-------------------------------------------------

    Pago confirmarPago(Long id);
}