package com.voy_vuelvo.api_getaway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Component
public class JwtUtil {

    // Duracion del token: 1 hora.
    private static final long EXPIRATION = 3600000L;

    // Duracion maxima de la sesion: 8 horas.
    private static final long SESSION_EXPIRATION =
            28800000L;

    private final SecretKey key;

    public JwtUtil(
            @Value("${JWT_SECRET_BASE64}")
            String secretBase64) {

        byte[] secret =
                Base64.getDecoder().decode(secretBase64);

        if (secret.length < 32) {
            throw new IllegalArgumentException(
                    "La clave JWT debe tener al menos 32 bytes.");
        }

        this.key = Keys.hmacShaKeyFor(secret);
    }

    // Compatibilidad con el sistema anterior.
    public String generateToken(String username) {

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(
                        System.currentTimeMillis() + EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Generar un JWT al iniciar sesion.
    public String generateToken(
            String username,
            String rol) {

        return crearToken(
                username,
                rol,
                System.currentTimeMillis()
        );
    }

    // Crear token conservando el inicio de la sesion.
    private String crearToken(
            String username,
            String rol,
            long inicioSesion) {

        if (rol == null) {
            throw new IllegalArgumentException(
                    "El rol es obligatorio.");
        }

        String normalizedRole = rol.trim()
                .toUpperCase(Locale.ROOT)
                .replaceFirst("^ROLE_", "");

        if (!Set.of(
                "ADMINISTRADOR",
                "VENDEDOR",
                "CLIENTE"
        ).contains(normalizedRole)) {

            throw new IllegalArgumentException(
                    "Rol no permitido.");
        }

        long ahora = System.currentTimeMillis();

        long limiteSesion =
                inicioSesion + SESSION_EXPIRATION;

        if (ahora >= limiteSesion) {
            throw new IllegalArgumentException(
                    "La sesion alcanzo su duracion maxima.");
        }

        long vencimiento = Math.min(
                ahora + EXPIRATION,
                limiteSesion
        );

        return Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(username)
                .claim("rol", normalizedRole)
                .claim("inicioSesion", inicioSesion)
                .setIssuedAt(new Date(ahora))
                .setExpiration(new Date(vencimiento))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Renovar un token valido.
    public String renovarToken(
            String token,
            String rolActual) {

        Claims claims = getClaims(token);

        String username = claims.getSubject();

        String rolAnterior =
                claims.get("rol", String.class);

        if (username == null
                || username.isBlank()
                || rolActual == null
                || !rolActual.equals(rolAnterior)) {

            throw new IllegalArgumentException(
                    "La cuenta o sus permisos cambiaron.");
        }

        Object inicio = claims.get("inicioSesion");

        long inicioSesion;

        if (inicio instanceof Number) {

            inicioSesion =
                    ((Number) inicio).longValue();

        } else {

            // Compatibilidad con tokens anteriores.
            inicioSesion =
                    claims.getIssuedAt().getTime();
        }

        return crearToken(
                username,
                rolActual,
                inicioSesion
        );
    }

    // Validar firma y vencimiento.
    public void validateToken(String token) {
        getClaims(token);
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return getClaims(token)
                .get("rol", String.class);
    }

    private Claims getClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
