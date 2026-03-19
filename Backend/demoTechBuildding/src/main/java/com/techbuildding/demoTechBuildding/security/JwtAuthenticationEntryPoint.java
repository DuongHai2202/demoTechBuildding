package com.techbuildding.demoTechBuildding.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techbuildding.demoTechBuildding.dto.response.ResponseError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles 401 Unauthorized responses when user accesses a protected API without
 * a valid token.
 * Returns a JSON ResponseError instead of Spring Security's default empty
 * response.
 */
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        log.warn("Unauthorized access attempt: {} {}", request.getMethod(), request.getRequestURI());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setCharacterEncoding("UTF-8");

        ResponseError error = new ResponseError(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized: Please provide a valid access token");

        objectMapper.writeValue(response.getOutputStream(), error);
    }
}
