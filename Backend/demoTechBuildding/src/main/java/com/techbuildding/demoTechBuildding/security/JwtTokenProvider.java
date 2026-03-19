package com.techbuildding.demoTechBuildding.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * JWT Token Provider - handles all token operations.
 *
 * Key design decisions (from reference project):
 * - Separate keys for access token and refresh token (more secure)
 * - Access token contains roles, refresh token does not
 * - Provides getCurrentUserLogin() utility for service layer
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.accessKey}")
    private String accessKeyBase64;

    @Value("${jwt.refreshKey}")
    private String refreshKeyBase64;

    @Value("${jwt.expiryMinutes}")
    private long expiryMinutes;

    @Value("${jwt.expiryDay}")
    private long expiryDay;

    private Key accessKey;
    private Key refreshKey;
    private final org.springframework.data.redis.core.RedisTemplate<String, String> redisTemplate;

    public JwtTokenProvider(org.springframework.data.redis.core.RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Initialize keys from Base64-encoded strings on startup.
     */
    @PostConstruct
    public void init() {
        accessKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(accessKeyBase64));
        refreshKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(refreshKeyBase64));
    }

    // ===================== ACCESS TOKEN =====================

    /**
     * Generate access token from Authentication (used after login).
     * Contains username + roles, expires in configured minutes.
     */
    public String generateAccessToken(Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();

        String roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return buildToken(principal.getUsername(), roles, accessKey, getAccessTokenExpiryDate());
    }

    /**
     * Generate access token from UserDetails (used for refresh).
     */
    public String generateAccessToken(UserDetails userDetails) {
        String roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return buildToken(userDetails.getUsername(), roles, accessKey, getAccessTokenExpiryDate());
    }

    /**
     * Validate access token signature and expiration.
     */
    public boolean validateAccessToken(String token) {
        return validateToken(token, accessKey);
    }

    /**
     * Extract username from access token.
     */
    public String getUsernameFromAccessToken(String token) {
        return extractClaims(token, accessKey).getSubject();
    }

    /**
     * Extract roles from access token.
     */
    public String getRolesFromAccessToken(String token) {
        return extractClaims(token, accessKey).get("roles", String.class);
    }

    /**
     * Get access token expiration as LocalDateTime.
     */
    public LocalDateTime getAccessTokenExpiry(String token) {
        return toLocalDateTime(extractClaims(token, accessKey).getExpiration());
    }

    // ===================== BLACKLIST =====================

    public void blacklistToken(String token) {
        Date expiryDate = extractClaims(token, accessKey).getExpiration();
        long ttlSeconds = (expiryDate.getTime() - System.currentTimeMillis()) / 1000;

        if (ttlSeconds > 0) {
            redisTemplate.opsForValue().set("blacklist:" + token, "1", ttlSeconds,
                    java.util.concurrent.TimeUnit.SECONDS);
            log.info("Token blacklisted successfully, ttl: {} seconds", ttlSeconds);
        }
    }

    public boolean isBlacklisted(String token) {
        return redisTemplate.hasKey("blacklist:" + token);
    }

    // ===================== REFRESH TOKEN =====================

    /**
     * Generate refresh token (long-lived, contains only username) and save to
     * Redis.
     */
    public String generateRefreshToken(String username) {
        String token = buildToken(username, null, refreshKey, getRefreshTokenExpiryDate());

        // Save to Redis: key = refresh:{username}, value = token, TTL = expiryDay
        redisTemplate.opsForValue().set(
                "refresh:" + username,
                token,
                expiryDay,
                java.util.concurrent.TimeUnit.DAYS);
        log.info("Refresh token generated and saved to Redis for user: {}", username);

        return token;
    }

    /**
     * Validate refresh token signature, expiration and check existence in Redis.
     */
    public boolean validateRefreshToken(String token) {
        if (!validateToken(token, refreshKey)) {
            return false;
        }

        // Extract username to check in Redis
        String username = getUsernameFromRefreshToken(token);
        String redisToken = redisTemplate.opsForValue().get("refresh:" + username);

        if (redisToken == null || !redisToken.equals(token)) {
            log.warn("Refresh token not found in Redis or doesn't match for user: {}", username);
            return false;
        }

        return true;
    }

    public void removeRefreshToken(String username) {
        redisTemplate.delete("refresh:" + username);
        log.info("Refresh token removed from Redis for user: {}", username);
    }

    /**
     * Extract username from refresh token.
     */
    public String getUsernameFromRefreshToken(String token) {
        return extractClaims(token, refreshKey).getSubject();
    }

    // ===================== UTILITY =====================

    /**
     * Get the currently authenticated user's username from SecurityContext.
     * Useful in service layer to know who is making the request.
     *
     * Usage: JwtTokenProvider.getCurrentUserLogin().orElse("anonymous")
     */
    public static Optional<String> getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(extractPrincipal(securityContext.getAuthentication()));
    }

    private static String extractPrincipal(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof String) {
            return (String) principal;
        }

        return null;
    }

    // ===================== INTERNAL HELPERS =====================

    private String buildToken(String subject, String roles, Key key, Date expiryDate) {
        JwtBuilder builder = Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(expiryDate)
                .signWith(key);

        if (roles != null) {
            builder.claim("roles", roles);
        }

        return builder.compact();
    }

    private boolean validateToken(String token, Key key) {
        try {
            Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    private Claims extractClaims(String token, Key key) {
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Date getAccessTokenExpiryDate() {
        long expiryMillis = System.currentTimeMillis() + 1000 * 60 * expiryMinutes;
        return new Date(expiryMillis);
    }

    public Date getRefreshTokenExpiryDate() {
        long expiryMillis = System.currentTimeMillis() + 1000L * 60 * 60 * 24 * expiryDay;
        return new Date(expiryMillis);
    }

    private LocalDateTime toLocalDateTime(Date date) {
        return date.toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDateTime();
    }
}
