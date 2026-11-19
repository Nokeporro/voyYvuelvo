
package com.voy_vuelvo.api_getaway.filter;

import com.voy_vuelvo.api_getaway.util.JwtUtil;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;

import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class JwtFilter implements WebFilter {

    private final JwtUtil jwtUtil;

    // Constructor
    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            WebFilterChain chain) {

        // 1. Obtener ruta y metodo HTTP.
        String path = exchange.getRequest()
                .getPath()
                .value();

        HttpMethod method = exchange.getRequest()
                .getMethod();

        // 2. Identificar rutas publicas.
        boolean publicRoute =

                // Solicitudes CORS.
                HttpMethod.OPTIONS.equals(method)

                // Inicio de sesion y registro.
                || path.equals("/auth/login")
                || path.equals("/auth/register")

                // Documentacion Swagger.
                || path.equals("/swagger-ui.html")
                || path.startsWith("/swagger-ui/")
                || path.equals("/v3/api-docs")
                || path.startsWith("/v3/api-docs/")
                || path.contains("/v3/api-docs")

                // Consultar rutas y equipamiento.
                || (HttpMethod.GET.equals(method)
                    && (
                        path.equals("/api/rutas")
                        || path.startsWith("/api/rutas/")
                        || path.equals("/api/equipamiento")
                        || path.startsWith("/api/equipamiento/")
                    ));

        // 3. Obtener encabezado de autorizacion.
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        // 4. Permitir rutas publicas sin JWT.
        if (authHeader == null || authHeader.isBlank()) {

            if (publicRoute) {
                return chain.filter(exchange);
            }

            // Las rutas protegidas requieren token.
            return unauthorized(exchange);
        }

        // 5. Comprobar formato Bearer.
        if (!authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7).trim();

        if (token.isBlank()) {
            return unauthorized(exchange);
        }

        try {

            // 6. Validar firma y vencimiento del JWT.
            jwtUtil.validateToken(token);

            // 7. Extraer identidad y rol del token.
            String username = jwtUtil.extractUsername(token);
            String rol = jwtUtil.extractRole(token);

            if (username == null
                    || username.isBlank()
                    || rol == null
                    || rol.isBlank()) {

                return unauthorized(exchange);
            }

            // Normalizar el rol.
            rol = rol.trim()
                    .toUpperCase(Locale.ROOT)
                    .replaceFirst("^ROLE_", "");

            // 8. Comprobar que sea un rol permitido.
            if (!Set.of(
                    "ADMINISTRADOR",
                    "VENDEDOR",
                    "CLIENTE"
            ).contains(rol)) {

                return unauthorized(exchange);
            }

            // 9. Crear permiso para Spring Security.
            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority(
                            "ROLE_" + rol
                    );

            // 10. Crear autenticacion del usuario.
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            List.of(authority)
                    );

            // 11. Compartir la autenticacion
            // con Spring Security y continuar la solicitud.
            return chain.filter(exchange)
                    .contextWrite(
                            ReactiveSecurityContextHolder
                                    .withAuthentication(authentication)
                    );

        } catch (Exception ex) {

            // Rechazar JWT invalido o vencido.
            return unauthorized(exchange);
        }
    }

    // 12. Respuesta para solicitudes no autenticadas.
    private Mono<Void> unauthorized(
            ServerWebExchange exchange) {

        exchange.getResponse()
                .setStatusCode(HttpStatus.UNAUTHORIZED);

        return exchange.getResponse()
                .setComplete();
    }
}
