package com.techbuildding.demoTechBuildding.exception;

import com.techbuildding.demoTechBuildding.dto.response.ResponseError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler that catches all exceptions across the application
 * and returns standardized {@link ResponseError} responses.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle validation errors from @Valid annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleValidationException(MethodArgumentNotValidException e) {
        String errorMessage = e.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");

        log.warn("Validation error: {}", errorMessage);
        return new ResponseError(HttpStatus.BAD_REQUEST.value(), errorMessage);
    }

    /**
     * Handle bad credentials (wrong username/password).
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseError handleBadCredentialsException(BadCredentialsException e) {
        log.warn("Authentication failed: {}", e.getMessage());
        return new ResponseError(HttpStatus.UNAUTHORIZED.value(), "Invalid username or password");
    }

    /**
     * Handle user not found during authentication.
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseError handleUsernameNotFoundException(UsernameNotFoundException e) {
        log.warn("User not found: {}", e.getMessage());
        return new ResponseError(HttpStatus.UNAUTHORIZED.value(), "Invalid username or password");
    }

    /**
     * Handle duplicate resource or data integrity violations (e.g., unique constraints).
     */
    @ExceptionHandler({DuplicateResourceException.class, DataIntegrityViolationException.class})
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseError handleDuplicateResourceException(Exception e) {
        String message = e instanceof DuplicateResourceException 
                ? e.getMessage() 
                : "Dữ liệu đã tồn tại hoặc vi phạm ràng buộc hệ thống.";
        log.warn("Data conflict: {}", message);
        return new ResponseError(HttpStatus.CONFLICT.value(), message);
    }

    /**
     * Handle all RuntimeExceptions (e.g., duplicate username, entity not found).
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseError handleRuntimeException(RuntimeException e) {
        log.error("Runtime error: {}", e.getMessage(), e);
        return new ResponseError(HttpStatus.INTERNAL_SERVER_ERROR.value(), e.getMessage());
    }

    /**
     * Handle any uncaught exception as a fallback.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseError handleException(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        return new ResponseError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Debug Exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());
    }
}