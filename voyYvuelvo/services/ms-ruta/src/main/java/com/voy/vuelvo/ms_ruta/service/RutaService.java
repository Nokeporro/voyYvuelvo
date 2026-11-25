package com.voy.vuelvo.ms_ruta.service;

import com.voy.vuelvo.ms_ruta.client.EquipamientoClient;
import com.voy.vuelvo.ms_ruta.dto.EquipamientoDTO;
import com.voy.vuelvo.ms_ruta.dto.RutaResponseDTO;
import com.voy.vuelvo.ms_ruta.model.Ruta;
import com.voy.vuelvo.ms_ruta.repository.RutaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.voy.vuelvo.ms_ruta.dto.RutaDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RutaService {


    private final RutaRepository rutaRepository;
    private final EquipamientoClient equipamientoClient;


    public List<Ruta> obtenerTodas() {
        return rutaRepository.findAll();
    }

    public Ruta obtenerPorId(Long id) {
        return rutaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada con ID: " + id));
    }

    //CREA RUTA
    public Ruta crearRuta(RutaDTO dto) {

        Ruta ruta = new Ruta();

        ruta.setNombre(dto.getNombre());
        ruta.setUbicacion(dto.getUbicacion());
        ruta.setDificultad(dto.getDificultad());
        ruta.setPrecio(dto.getPrecio());
        ruta.setCupoMaximo(dto.getCupoMaximo());
        ruta.setAptoNinos(dto.getAptoNinos());
        ruta.setAptoMascotas(dto.getAptoMascotas());

        return rutaRepository.save(ruta);
    }

    // Metodos que llaman al cliente Feign
    public List<EquipamientoDTO> obtenerEquipamientos() {
        return equipamientoClient.listar();
    }

    public List<EquipamientoDTO> obtenerDisponibles() {
        return equipamientoClient.disponibles();
    }

//-------------------------
    public List<EquipamientoDTO> obtenerEquipamientoPorRuta(Long rutaId) {

        Ruta ruta = rutaRepository.findById(rutaId)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));

        return equipamientoClient.buscarPorDificultad(ruta.getDificultad());
    }


    public RutaResponseDTO obtenerRutaConEquipamiento(Long id) {

        Ruta ruta = rutaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));

        List<EquipamientoDTO> equipamiento =
                equipamientoClient.buscarPorDificultad(
                        ruta.getDificultad());

        RutaResponseDTO response = new RutaResponseDTO();

        response.setId(ruta.getId());
        response.setNombre(ruta.getNombre());
        response.setUbicacion(ruta.getUbicacion());
        response.setDificultad(ruta.getDificultad());
        response.setPrecio(ruta.getPrecio());
        response.setCupoMaximo(ruta.getCupoMaximo());
        response.setAptoNinos(ruta.getAptoNinos());
        response.setAptoMascotas(ruta.getAptoMascotas());

        response.setEquipamiento(equipamiento);

        return response;
    }

//-----------------------------------------------------------

    @Transactional
    public Ruta descontarCupos(Long id, Integer cantidad) {
        if (cantidad == null || cantidad <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad inválida");

        Ruta ruta = rutaRepository.buscarParaActualizar(id)
                .orElseThrow(() ->
                        new RuntimeException("Ruta no encontrada"));

        if (ruta.getCupoMaximo() < cantidad) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No hay cupos suficientes");
        }

        ruta.setCupoMaximo(
                ruta.getCupoMaximo() - cantidad);

        return rutaRepository.save(ruta);
    }
//-------------------------
@Transactional
    public Ruta aumentarCupos(Long id, Integer cantidad) {
        if (cantidad == null || cantidad <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad inválida");

    Ruta ruta = rutaRepository.buscarParaActualizar(id)
            .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));

    ruta.setCupoMaximo(ruta.getCupoMaximo() + cantidad);

    return rutaRepository.save(ruta);
}
}