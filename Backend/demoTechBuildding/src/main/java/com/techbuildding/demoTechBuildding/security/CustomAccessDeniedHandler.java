package com.techbuildding.demoTechBuildding.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techbuildding.demoTechBuildding.dto.response.ResponseError;
import com.techbuildding.demoTechBuildding.exception.ApiErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles 403 Forbidden responses when user has a valid token but lacks
 * required role/permission.
 * Returns a JSON ResponseError instead of Spring Security's default empty
 * response.
 */
@Slf4j
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {

        log.warn("API authorization rejected code={} method={} path={}",
                ApiErrorCode.ACCESS_DENIED,
                request.getMethod(),
                request.getRequestURI());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setCharacterEncoding("UTF-8");

        ResponseError error = new ResponseError(
                HttpStatus.FORBIDDEN.value(),
                ApiErrorCode.ACCESS_DENIED,
                "Bạn không có quyền thực hiện thao tác này. Nếu cần, hãy liên hệ quản trị viên để được cấp quyền.",
                null);

        objectMapper.writeValue(response.getOutputStream(), error);
    }
}
