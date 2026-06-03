package com.voy.vuelvo.ms_pago.service;

import com.voy.vuelvo.ms_pago.model.Pago;
import com.voy.vuelvo.ms_pago.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagoServiceImpl implements PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    @Override
    public List<Pago> findAll() {
        return (List<Pago>) pagoRepository.findAll();
    }

    @Override
    public Pago save(Pago pago) {
        return pagoRepository.save(pago);
    }
}