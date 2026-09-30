package com.techbuildding.demoTechBuildding.exception;

import com.techbuildding.demoTechBuildding.dto.response.ResponseError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

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
                .map(fieldError -> validationFieldLabel(fieldError.getField()) + " " + fieldError.getDefaultMessage())
                .distinct()
                .collect(Collectors.joining("; "));

        if (errorMessage.isBlank()) {
            errorMessage = "Thông tin nhập vào chưa đúng. Vui lòng kiểm tra lại các trường bắt buộc.";
        }

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
     * Handle an invalid/expired refresh token as an authentication failure,
     * rather than exposing it as an internal server error.
     */
    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseError handleUnauthorizedException(UnauthorizedException e) {
        log.warn("Unauthorized request: {}", e.getMessage());
        return new ResponseError(HttpStatus.UNAUTHORIZED.value(), e.getMessage());
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
     * Keep OTP/Redis outages actionable for the user without exposing the
     * underlying connection details. The complete stack trace stays in the
     * server log under a short correlation code.
     */
    @ExceptionHandler({RedisSystemException.class, RedisConnectionFailureException.class})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ResponseError handleRedisServiceException(Exception e) {
        String errorCode = "ERR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        log.error("OTP infrastructure unavailable [{}]", errorCode, e);
        return new ResponseError(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "Dịch vụ xác thực OTP đang tạm thời gián đoạn. Bạn chưa nhập sai thông tin. Vui lòng bật Redis hoặc thử lại sau.",
                errorCode);
    }

    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleBadRequestException(BadRequestException e) {
        log.warn("Business validation error: {}", e.getMessage());
        return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseError handleResourceNotFoundException(ResourceNotFoundException e) {
        log.warn("Resource not found: {}", e.getMessage());
        return new ResponseError(HttpStatus.NOT_FOUND.value(), e.getMessage());
    }

    /**
     * Handle protected system resources such as the canonical admin account.
     */
    @ExceptionHandler(ProtectedResourceException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseError handleProtectedResourceException(ProtectedResourceException e) {
        log.warn("Protected resource mutation rejected: {}", e.getMessage());
        return new ResponseError(HttpStatus.FORBIDDEN.value(), e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseError handleAccessDeniedException(AccessDeniedException e) {
        log.warn("Business authorization rejected: {}", e.getMessage());
        return new ResponseError(HttpStatus.FORBIDDEN.value(), e.getMessage());
    }

    /**
     * Handle all RuntimeExceptions (e.g., duplicate username, entity not found).
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseError handleRuntimeException(RuntimeException e) {
        return internalError(e);
    }

    /**
     * Handle any uncaught exception as a fallback.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseError handleException(Exception e) {
        return internalError(e);
    }

    private ResponseError internalError(Exception exception) {
        String errorCode = "ERR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        log.error("Unhandled server error [{}]", errorCode, exception);
        return new ResponseError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Hệ thống đang gặp sự cố tạm thời. Bạn không cần thay đổi thông tin đã nhập. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
                errorCode);
    }

    private String validationFieldLabel(String field) {
        return Map.of(
                        "username", "Tên đăng nhập",
                        "password", "Mật khẩu",
                        "fullName", "Họ và tên",
                        "phone", "Số điện thoại",
                        "email", "Email"
                )
                .getOrDefault(field, field);
    }
}
