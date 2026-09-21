package org.venusgiti.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}")
            String secret,

            @Value("${jwt.expiration-ms}")
            long expirationMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(
                        StandardCharsets.UTF_8
                )
        );

        this.expirationMs = expirationMs;
    }

    public String generateToken(
            RocUser user
    ) {
        Date now = new Date();

        Date expiry = new Date(
                now.getTime() + expirationMs
        );

        return Jwts.builder()
                .subject(user.username())
                .claim(
                        "userId",
                        user.id()
                )
                .claim(
                        "fullName",
                        user.fullName()
                )
                .claim(
                        "role",
                        user.role().name()
                )
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(
            String token
    ) {
        return getClaims(token)
                .getSubject();
    }

    public String extractRole(
            String token
    ) {
        return getClaims(token)
                .get(
                        "role",
                        String.class
                );
    }

    public boolean isValid(
            String token
    ) {
        try {
            Claims claims =
                    getClaims(token);

            return claims
                    .getExpiration()
                    .after(new Date());

        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(
            String token
    ) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}