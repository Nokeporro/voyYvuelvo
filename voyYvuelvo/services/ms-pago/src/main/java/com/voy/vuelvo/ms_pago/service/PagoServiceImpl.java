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
        return pagoRepository.findAll();
    }

    @Override
    public Pago findById(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pago no encontrado con ID: " + id));
    }

    @Override
    public Pago save(Pago pago) {
        return pagoRepository.save(pago);
    }

    @Override
    public Pago update(Long id, Pago pago) {

        Pago existente = findById(id);

        existente.setIdReserva(pago.getIdReserva());
        existente.setMonto(pago.getMonto());
        existente.setEstado(pago.getEstado());
        existente.setFechaPago(pago.getFechaPago());

        return pagoRepository.save(existente);
    }

    @Override
    public void delete(Long id) {

        Pago existente = findById(id);

        pagoRepository.delete(existente);
    }




    //-------------------------------------------------------------------------
    @Override
    public Pago confirmarPago(Long id) {

        Pago pago = findById(id);

        if ("PAGADO".equalsIgnoreCase(pago.getEstado())) {
            throw new RuntimeException("El pago ya se encuentra PAGADO.");
        }

        pago.setEstado("PAGADO");

        return pagoRepository.save(pago);
    }
}