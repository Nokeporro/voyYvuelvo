
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

@Component
public class JwtUtil {

    // Duración del token: 1 hora
    private static final long EXPIRATION = 3600000L;

    private final SecretKey key;

    // La clave se obtiene del entorno, no del código fuente.
    public JwtUtil(
            @Value("${JWT_SECRET_BASE64}") String secretBase64) {

        byte[] secret = Base64.getDecoder().decode(secretBase64);

        if (secret.length < 32) {
            throw new IllegalArgumentException(
                    "La clave JWT debe tener al menos 32 bytes.");
        }

        this.key = Keys.hmacShaKeyFor(secret);
    }

    // Compatibilidad temporal con el login actual.
    // Este método no concede ningún rol.
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Genera un token con el rol verificado del usuario.
    public String generateToken(String username, String rol) {

        if (rol == null) {
            throw new IllegalArgumentException("El rol es obligatorio.");
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
                    "Rol no permitido: " + normalizedRole);
        }

        return Jwts.builder()
                .setSubject(username)
                .claim("rol", normalizedRole)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Comprueba la firma y el vencimiento del token.
    public void validateToken(String token) {
        getClaims(token);
    }

    // Obtiene el usuario incluido en el token.
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Obtiene el rol incluido en el token.
    public String extractRole(String token) {
        return getClaims(token).get("rol", String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
