package com.voy_vuelvo.ms_equipamiento.config;

import com.voy_vuelvo.ms_equipamiento.model.Equipamiento;
import com.voy_vuelvo.ms_equipamiento.repository.EquipamientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DatosEquipamientoConfig {

    private final EquipamientoRepository repository;

    @Bean
    CommandLineRunner cargarEquipamientoInicial() {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Equipamiento(null, "Mochila Trekking", "Mochila para llevar agua, abrigo y accesorios durante la ruta.", true, 1, true, "Fácil", true, 7000));
                repository.save(new Equipamiento(null, "Linterna Frontal", "Linterna recargable para regreso con poca luz.", false, 1, true, "Fácil", true, 4000));
                repository.save(new Equipamiento(null, "Carpa de Montaña", "Carpa resistente para rutas de más de un día.", true, 2, true, "Media", true, 18000));
                repository.save(new Equipamiento(null, "Chaqueta Outdoor", "Capa exterior para viento y cambios de clima.", true, 1, true, "Media", true, 10000));
                repository.save(new Equipamiento(null, "Saco de Dormir", "Saco térmico para descanso en campamento.", true, 1, false, "Media", true, 9000));
                repository.save(new Equipamiento(null, "Bastones de Trekking", "Apoyo para pendientes y terrenos exigentes.", false, 1, true, "Alta", true, 6000));
                repository.save(new Equipamiento(null, "Botas de Trekking", "Calzado de montaña para senderos de dificultad alta.", true, 1, true, "Alta", true, 12000));
            }
        };
    }
}
