package com.voy_vuelvo.api_getaway.config;

import com.voy_vuelvo.api_getaway.filter.JwtFilter;
import com.voy_vuelvo.api_getaway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import java.util.Arrays;

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

    @Value("${APP_CORS_ORIGINS:http://localhost:5173,http://127.0.0.1:5173}")
    private String corsOrigins;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtFilter = new JwtFilter(jwtUtil);
    }

    // 1. CONFIGURACION CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(Arrays.asList(corsOrigins.split(",")));

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

                // Desactivar autenticacion tradicional
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                // Activar CORS
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
                                "/auth/register",
                                "/actuator/health"
                        )
                        .permitAll()

                        // 5. CREAR PERFIL DEL CLIENTE
                        .pathMatchers(
                                HttpMethod.POST,
                                "/auth/perfil"
                        )
                        .hasRole("CLIENTE")

                        // 6. CONSULTAR PERFIL PROPIO
                        .pathMatchers(
                                HttpMethod.GET,
                                "/auth/perfil"
                        )
                        .hasRole("CLIENTE")

                        // 7. CONSULTAR CUENTAS REALES
                        // Solo Administrador
                        .pathMatchers(
                                HttpMethod.GET,
                                "/auth/cuentas"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 8. RESERVAS SEGURAS DEL CLIENTE
                        .pathMatchers(
                                HttpMethod.POST,
                                "/auth/reservas"
                        )
                        .hasRole("CLIENTE")

                        // 9. DOCUMENTACION SWAGGER
                        // Se conserva la configuracion de main
                        .pathMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/api/*/v3/api-docs",
                                "/api/*/v3/api-docs/**"
                        )
                        .permitAll()

                        .pathMatchers("/api/equipamiento/interno", "/api/equipamiento/interno/**",
                                "/api/rutas/*/descontar-cupos", "/api/rutas/*/aumentar-cupos").denyAll()

                        // 10. CONSULTAR RUTAS Y EQUIPAMIENTO
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/rutas",
                                "/api/rutas/**",
                                "/api/equipamiento",
                                "/api/equipamiento/**"
                        )
                        .permitAll()

                        // 11. CONSULTAR RESERVAS
                        // Administrador y Vendedor
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/reservas",
                                "/api/reservas/**"
                        )
                        .hasAnyRole(
                                "ADMINISTRADOR",
                                "VENDEDOR"
                        )

                        // 12. CREAR RESERVAS ADMINISTRATIVAS
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/reservas"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 13. CREAR PERFILES ADMINISTRATIVOS
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/usuarios"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 14. ADMINISTRACION DE USUARIOS
                        .pathMatchers(
                                "/api/usuarios",
                                "/api/usuarios/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 15. ADMINISTRACION DE PAGOS
                        .pathMatchers(
                                "/api/pagos",
                                "/api/pagos/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 16. MODIFICAR RUTAS
                        .pathMatchers(
                                "/api/rutas",
                                "/api/rutas/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 17. MODIFICAR EQUIPAMIENTO
                        .pathMatchers(
                                "/api/equipamiento",
                                "/api/equipamiento/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 18. OTRAS OPERACIONES DE RESERVAS
                        .pathMatchers(
                                "/api/reservas",
                                "/api/reservas/**"
                        )
                        .hasRole("ADMINISTRADOR")

                        // 19. BLOQUEAR RUTAS NO DEFINIDAS
                        .anyExchange()
                        .denyAll()
                )

                // 20. VALIDACION JWT
                .addFilterAt(
                        jwtFilter,
                        SecurityWebFiltersOrder.AUTHENTICATION
                )

                .build();
    }
}
