package com.javastudy.shared.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final JwtProperties properties;
    private SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + properties.getExpiration());

        return Jwts.builder()
            .subject(email)
            .claim("userId", userId)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
    }

    public String generateRefreshToken(String email, boolean rememberMe) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + properties.getRefreshExpiration());

        return Jwts.builder()
            .subject(email)
            .claim("type", "refresh")
            .claim("rememberMe", rememberMe)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token);
    }

    public String extractEmail(String token) {
        return parseToken(token).getPayload().getSubject();
    }

    public Long extractUserId(String token) {
        return parseToken(token).getPayload().get("userId", Long.class);
    }

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            Claims claims = parseToken(token).getPayload();
            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean extractRememberMe(String token) {
        Object rememberMe = parseToken(token).getPayload().get("rememberMe");
        return Boolean.TRUE.equals(rememberMe);
    }
}
