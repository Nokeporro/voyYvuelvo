//package com.voy.velvo.ms_reserva.config;

import com.voy.velvo.ms_reserva.model.Reserva;
import com.voy.velvo.ms_reserva.repository.ReservaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

//@Configuration
    //public class DatosPruebaConfig {

        //@Bean
       /* CommandLineRunner cargarDatos(ReservaRepository reservaRepository) {
            return args -> {
                // Esto evita que se dupliquen los datos cada vez que le des "Play" al proyecto.
                if (reservaRepository.count() == 0) {

                    System.out.println("Cargando datos de reservas en la base de datos...");

                    Reserva reserva1 = new Reserva(
                            null, 101L, 5L, 2, LocalDate.of(2026, 5, 20),
                            true, // necesitaGuia
                            "PAGADO" // estadoPago
                    );

                    Reserva reserva2 = new Reserva(
                            null,
                            105L,
                            2L,
                            4,
                            LocalDate.of(2026, 8, 15),
                            false,
                            "PENDIENTE"
                    );

                    Reserva reserva3 = new Reserva(
                            null,
                            108L,
                            10L,
                            1,
                            LocalDate.of(2026, 12, 10),
                            true,
                            "PAGADO"
                    );

                    // Guardamos todas de golpe en la base de datos
                    reservaRepository.saveAll(List.of(reserva1, reserva2, reserva3));

                    System.out.println("¡Datos cargados exitosamente!");
                } else {
                    System.out.println("Omitiendo carga de prueba.");
                }
            };
        }
    }
*/
