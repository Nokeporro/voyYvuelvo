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
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://127.0.0.1:5173",
                "http://localhost:5173"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

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

                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                .authorizeExchange(exchange -> exchange

                        // 3. SOLICITUDES CORS
                        .pathMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        // 4. LOGIN Y REGISTRO PUBLICOS
                        .pathMatchers(
                                "/auth/login",
                                "/auth/register"
                        )
                        .permitAll()

                        // 5. RENOVACION DEL JWT
                        .pathMatchers(
                                HttpMethod.POST,
                                "/auth/refresh"
                        )
                        .hasAnyRole(
                                "ADMINISTRADOR",
                                "VENDEDOR",
                                "CLIENTE"
                        )

                        // 6. CREAR PERFIL DEL CLIENTE
                        .pathMatchers(
                                HttpMethod.POST,
                                "/auth/perfil"
                        )
                        .hasRole("CLIENTE")

                        // 7. CONSULTAR PERFIL PROPIO
                        .pathMatchers(
                                HttpMethod.GET,
                                "/auth/perfil"
                        )
                        .hasRole("CLIENTE")

                        // 8. CONSULTAR CUENTAS REALES
                        .pathMatchers(
                                HttpMethod.GET,
                                "/auth/cuentas"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 9. RESERVAS SEGURAS DEL CLIENTE
                        .pathMatchers(
                                HttpMethod.POST,
                                "/auth/reservas"
                        )
                        .hasRole("CLIENTE")

                        // 10. DOCUMENTACION SWAGGER
                        .pathMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/api/*/v3/api-docs",
                                "/api/*/v3/api-docs/**"
                        )
                        .permitAll()

                        // 11. CONSULTAR RUTAS Y EQUIPAMIENTO
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/rutas",
                                "/api/rutas/**",
                                "/api/equipamiento",
                                "/api/equipamiento/**"
                        )
                        .permitAll()

                        // 12. CONSULTAR RESERVAS
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/reservas",
                                "/api/reservas/**"
                        )
                        .hasAnyRole(
                                "ADMINISTRADOR",
                                "VENDEDOR"
                        )

                        // 13. CREAR RESERVAS ADMINISTRATIVAS
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/reservas"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 14. CREAR PERFILES ADMINISTRATIVOS
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/usuarios"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 15. ADMINISTRACION DE USUARIOS
                        .pathMatchers(
                                "/api/usuarios",
                                "/api/usuarios/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 16. ADMINISTRACION DE PAGOS
                        .pathMatchers(
                                "/api/pagos",
                                "/api/pagos/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 17. MODIFICAR RUTAS
                        .pathMatchers(
                                "/api/rutas",
                                "/api/rutas/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 18. MODIFICAR EQUIPAMIENTO
                        .pathMatchers(
                                "/api/equipamiento",
                                "/api/equipamiento/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 19. OTRAS OPERACIONES DE RESERVAS
                        .pathMatchers(
                                "/api/reservas",
                                "/api/reservas/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 20. BLOQUEAR RUTAS NO DEFINIDAS
                        .anyExchange()
                        .denyAll()
                )

                // 21. VALIDACION JWT
                .addFilterAt(
                        jwtFilter,
                        SecurityWebFiltersOrder.AUTHENTICATION
                )

                .build();
    }
}
