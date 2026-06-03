package com.voy_vuelvo.ms_equipamiento.service;

import com.voy_vuelvo.ms_equipamiento.client.RutaClient;
import com.voy_vuelvo.ms_equipamiento.dto.EquipamientoDto;
import com.voy_vuelvo.ms_equipamiento.dto.RutaDTO;
import com.voy_vuelvo.ms_equipamiento.model.Equipamiento;
import com.voy_vuelvo.ms_equipamiento.repository.EquipamientoRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipamientoService {

    private final EquipamientoRepository repository;
    private final RutaClient rutaClient;

    public EquipamientoService(
            EquipamientoRepository repository,
            RutaClient rutaClient) {

        this.repository = repository;
        this.rutaClient = rutaClient;
    }

    // CREAR
    public Equipamiento crear(EquipamientoDto dto) {

        Equipamiento e = new Equipamiento();

        e.setNombre(dto.getNombre());
        e.setDescripcion(dto.getDescripcion());
        e.setObligatorio(dto.isObligatorio());
        e.setCapacidadPersonas(dto.getCapacidadPersonas());
        e.setImpermeable(dto.isImpermeable());
        e.setDificultad(dto.getDificultad());
        e.setDisponible(dto.isDisponible());
        e.setValorArriendo(dto.getValorArriendo());

        return repository.save(e);
    }

    // LISTAR TODOS
    public List<Equipamiento> listar() {

        return repository.findAll();
    }

    // OBTENER POR ID
    public Equipamiento obtener(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipamiento no encontrado"));
    }

    // ACTUALIZAR
    public Equipamiento actualizar(Long id, EquipamientoDto dto) {

        Equipamiento e = obtener(id);

        e.setNombre(dto.getNombre());
        e.setDescripcion(dto.getDescripcion());
        e.setObligatorio(dto.isObligatorio());
        e.setCapacidadPersonas(dto.getCapacidadPersonas());
        e.setImpermeable(dto.isImpermeable());
        e.setDificultad(dto.getDificultad());
        e.setDisponible(dto.isDisponible());
        e.setValorArriendo(dto.getValorArriendo());

        return repository.save(e);
    }

    // ELIMINAR
    public void eliminar(Long id) {

        if (!repository.existsById(id)) {

            throw new RuntimeException(
                    "Equipamiento no encontrado");
        }

        repository.deleteById(id);
    }

    // LISTAR DISPONIBLES
    public List<Equipamiento> disponibles() {

        return repository.findByDisponibleTrue();
    }

    // BUSCAR POR DIFICULTAD
    public List<Equipamiento> buscarPorDificultad(
            String dificultad) {

        return repository.findByDificultad(dificultad);
    }

    // RECOMENDAR SEGÚN RUTA
    public List<Equipamiento> recomendarPorRuta(Long rutaId) {

        RutaDTO ruta = rutaClient.buscarPorId(rutaId);

        return repository.findByDificultad(
                ruta.getDificultad());
    }
}
