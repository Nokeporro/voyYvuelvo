package com.voy.vuelvo.ms_ruta.config;


import com.voy.vuelvo.ms_ruta.model.Ruta;
import com.voy.vuelvo.ms_ruta.repository.RutaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSeedConfig {

    private final RutaRepository rutaRepository;

    @Bean
    public CommandLineRunner cargarDatosIniciales() {
        return args -> {
            if (rutaRepository.count() == 0) {

                rutaRepository.save(new Ruta(null, "Circuito Base Torres", "Torres del Paine · Magallanes", "Alta", 210000.0, 12, false, false));
                rutaRepository.save(new Ruta(null, "Laguna del Inca", "Cajón del Maipo · Metropolitana", "Fácil", 35000.0, 24, true, true));
                rutaRepository.save(new Ruta(null, "Sendero Los Lirios", "Parque Conguillío · Araucanía", "Media", 78000.0, 18, true, false));

                System.out.println("Rutas cargadas con filtros de niños y mascotas");
            } else {
                System.out.println("No se requiere carga inicial.");
            }
        };
    }
}