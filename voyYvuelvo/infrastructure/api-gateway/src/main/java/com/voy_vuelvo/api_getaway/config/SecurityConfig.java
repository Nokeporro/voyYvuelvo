package com.voy_vuelvo.api_getaway.config;

import com.voy_vuelvo.api_getaway.filter.JwtFilter;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // 1. CONFIGURACION CORS
    // Permite la comunicacion entre React y Spring Boot.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Direcciones permitidas durante el desarrollo.
        config.setAllowedOrigins(List.of(
                "http://127.0.0.1:5173",
                "http://localhost:5173"
        ));

        // Metodos HTTP permitidos.
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Encabezados necesarios para JSON y JWT.
        config.setAllowedHeaders(List.of(
                "Content-Type",
                "Authorization"
        ));

        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // 2. SEGURIDAD DEL API GATEWAY
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        return http

                // Desactivar autenticacion tradicional.
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                // Activar configuracion CORS.
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                // 3. REGLAS DE ACCESO
                .authorizeExchange(exchange -> exchange

                        // Solicitudes previas CORS.
                        .pathMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        // 4. LOGIN Y REGISTRO
                        // Acceso publico.
                        .pathMatchers(
                                "/auth/login",
                                "/auth/register"
                        )
                        .permitAll()

                        // 5. PERFIL DEL CLIENTE
                        // Solo CLIENTE con JWT valido.
                        .pathMatchers(
                                HttpMethod.POST,
                                "/auth/perfil"
                        )
                        .hasRole("CLIENTE")

                        // 6. RESERVAS SEGURAS DEL CLIENTE
                        // El ID del usuario se obtiene desde
                        // su cuenta autenticada y no desde React.
                        .pathMatchers(
                                HttpMethod.POST,
                                "/auth/reservas"
                        )
                        .hasRole("CLIENTE")

                        // 7. CONSULTAR RUTAS Y EQUIPAMIENTO
                        // Acceso publico para GET.
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/rutas",
                                "/api/rutas/**",
                                "/api/equipamiento",
                                "/api/equipamiento/**"
                        )
                        .permitAll()

                        // 8. CONSULTAR RESERVAS
                        // Administrador y Vendedor.
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/reservas",
                                "/api/reservas/**"
                        )
                        .hasAnyRole(
                                "ADMINISTRADOR",
                                "VENDEDOR"
                        )

                        // 9. CREAR RESERVAS
                        // TEMPORALMENTE solo Administrador.
                        // El Cliente podra crear reservas cuando
                        // el backend obtenga su perfil desde JWT
                        // y no desde un ID enviado por React.
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/reservas"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 10. CREAR USUARIOS
                        // Solo Administrador mediante API Gateway.
                        // El Cliente debe utilizar /auth/perfil.
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/usuarios"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 11. ADMINISTRACION DE USUARIOS
                        .pathMatchers(
                                "/api/usuarios",
                                "/api/usuarios/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 12. ADMINISTRACION DE PAGOS
                        .pathMatchers(
                                "/api/pagos",
                                "/api/pagos/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 13. MODIFICAR RUTAS
                        .pathMatchers(
                                "/api/rutas",
                                "/api/rutas/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 14. MODIFICAR EQUIPAMIENTO
                        .pathMatchers(
                                "/api/equipamiento",
                                "/api/equipamiento/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 15. OTRAS OPERACIONES DE RESERVAS
                        // Solo Administrador.
                        .pathMatchers(
                                "/api/reservas",
                                "/api/reservas/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 16. BLOQUEAR RUTAS NO DEFINIDAS
                        .anyExchange()
                        .denyAll()
                )

                // 17. VALIDACION JWT
                .addFilterAt(
                        jwtFilter,
                        SecurityWebFiltersOrder.AUTHENTICATION
                )

                .build();
    }
}
