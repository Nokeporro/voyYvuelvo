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

                rutaRepository.save(new Ruta(null, "Cajón del Maipo", "San José de Maipo", "Media", 35000.0, 20, true, false));
                rutaRepository.save(new Ruta(null, "Tour Torres del Paine", "Patagonia", "Alta", 150000.0, 10, false, false));
                rutaRepository.save(new Ruta(null, "Valle de la Luna Mágico", "San Pedro de Atacama", "Fácil", 25000.0, 30, true, true));
                rutaRepository.save(new Ruta(null, "Ruta del Vino", "Valle de Colchagua", "Fácil", 45000.0, 15, true, false));

                System.out.println("Rutas cargadas con filtros de niños y mascotas");
            } else {
                System.out.println("No se requiere carga inicial.");
            }
        };
    }
}