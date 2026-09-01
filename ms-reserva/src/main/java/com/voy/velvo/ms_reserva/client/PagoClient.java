package com.voy.velvo.ms_reserva.client;

import com.voy.velvo.ms_reserva.model.Dto.PagoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@FeignClient(contextId = "pagoClient", name = "ms-pago", url = "http://ms-pago:8085")
public interface PagoClient {

    @PostMapping("/api/pagos")
    void crearPagoInterno(@RequestBody PagoDTO pagoDTO);
}