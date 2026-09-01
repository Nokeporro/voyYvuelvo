package com.voy.velvo.ms_reserva.client;

import com.voy.velvo.ms_reserva.model.Dto.UsuarioDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(contextId = "usuarioClient", name = "ms-usuario", url = "http://ms-usuario:8084")
public interface UsuarioClient {

    @GetMapping("/api/usuarios/{id}")
    UsuarioDTO obtenerUsuarioPorId(@PathVariable("id") Long id);
}