package com.techbuildding.demoTechBuildding.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter - intercepts every HTTP request.
 *
 * Flow:
 * 1. Skip public endpoints (auth, swagger)
 * 2. Extract JWT token from "Authorization: Bearer xxx" header
 * 3. Check if token is blacklisted (logged out)
 * 4. Validate token signature and expiration
 * 5. Load user from database and set SecurityContext
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    /**
     * Skip filtering for public endpoints (no token needed).
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        
        // Ngoại trừ các path cần check token
        if (path.equals("/api/v1/auth/logout") || path.equals("/api/v1/auth/my-profile")) {
            return false;
        }

        return path.startsWith("/api/v1/auth/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        log.debug("JWT Filter processing request: {} {}", request.getMethod(), request.getServletPath());

        String token = extractTokenFromHeader(request);
        String username = null;

        if (token != null) {
            // Check if token is blacklisted (user logged out)
            if (jwtTokenProvider.isBlacklisted(token)) {
                log.warn("Access token is blacklisted");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Access token is blacklisted");
                return;
            }

            // Validate token
            if (jwtTokenProvider.validateAccessToken(token)) {
                username = jwtTokenProvider.getUsernameFromAccessToken(token);
            } else {
                log.warn("Invalid access token");
            }
        }

        // Set authentication if username found and no existing auth
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("Authenticated user: {}, roles: {}", username, userDetails.getAuthorities());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from "Authorization: Bearer xxx" header.
     */
    private String extractTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
