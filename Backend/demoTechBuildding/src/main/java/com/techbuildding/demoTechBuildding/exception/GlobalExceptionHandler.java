package com.techbuildding.demoTechBuildding.exception;

import com.techbuildding.demoTechBuildding.dto.response.ResponseError;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.jdbc.CannotGetJdbcConnectionException;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Converts backend failures into messages that a user can act on.
 *
 * The response contains a stable {@code code} for frontend logic and, only for
 * unexpected/infrastructure failures, a short {@code supportCode}. The latter
 * is a lookup key for the server log and is never used as the main message.
 * Stack traces and dependency details stay in server logs only.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleValidationException(MethodArgumentNotValidException exception,
                                                    HttpServletRequest request) {
        Map<String, String> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> defaultMessage(error.getDefaultMessage()),
                        (first, ignored) -> first,
                        LinkedHashMap::new));

        String message = fieldErrors.isEmpty()
                ? "Thông tin nhập vào chưa đúng. Vui lòng kiểm tra lại các trường được đánh dấu."
                : "Vui lòng kiểm tra: " + fieldErrors.entrySet().stream()
                .map(entry -> validationFieldLabel(entry.getKey()) + " " + entry.getValue())
                .collect(Collectors.joining("; ")) + ".";

        log.warn("API validation rejected code={} method={} path={} fields={}",
                ApiErrorCode.VALIDATION_FAILED,
                request.getMethod(),
                request.getRequestURI(),
                fieldErrors.keySet());

        return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.VALIDATION_FAILED,
                message, null, fieldErrors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleMalformedRequest(HttpMessageNotReadableException exception,
                                                HttpServletRequest request) {
        log.warn("API malformed request code={} method={} path={}",
                ApiErrorCode.REQUEST_MALFORMED, request.getMethod(), request.getRequestURI());
        return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.REQUEST_MALFORMED,
                "Dữ liệu gửi lên không đúng định dạng. Vui lòng kiểm tra nội dung và thử lại.", null);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleMissingRequestParameter(MissingServletRequestParameterException exception,
                                                        HttpServletRequest request) {
        log.warn("API missing parameter code={} method={} path={} parameter={}",
                ApiErrorCode.REQUEST_INVALID, request.getMethod(), request.getRequestURI(), exception.getParameterName());
        return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.REQUEST_INVALID,
                "Yêu cầu đang thiếu thông tin bắt buộc. Vui lòng kiểm tra lại và thử lại.", null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleArgumentTypeMismatch(MethodArgumentTypeMismatchException exception,
                                                    HttpServletRequest request) {
        log.warn("API parameter type mismatch code={} method={} path={} parameter={}",
                ApiErrorCode.REQUEST_INVALID, request.getMethod(), request.getRequestURI(), exception.getName());
        return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.REQUEST_INVALID,
                "Một giá trị trong yêu cầu không đúng định dạng. Vui lòng kiểm tra lại thông tin.", null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ResponseError handleMethodNotSupported(HttpRequestMethodNotSupportedException exception,
                                                  HttpServletRequest request) {
        log.warn("API method not allowed code={} method={} path={}",
                ApiErrorCode.REQUEST_METHOD_NOT_ALLOWED, request.getMethod(), request.getRequestURI());
        return error(HttpStatus.METHOD_NOT_ALLOWED.value(), ApiErrorCode.REQUEST_METHOD_NOT_ALLOWED,
                "Thao tác này không được hỗ trợ ở chức năng hiện tại.", null);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    public ResponseError handleUnsupportedMediaType(HttpMediaTypeNotSupportedException exception,
                                                    HttpServletRequest request) {
        log.warn("API media type rejected code={} method={} path={}",
                ApiErrorCode.REQUEST_MEDIA_TYPE_UNSUPPORTED, request.getMethod(), request.getRequestURI());
        return error(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(), ApiErrorCode.REQUEST_MEDIA_TYPE_UNSUPPORTED,
                "Định dạng dữ liệu gửi lên chưa được hỗ trợ.", null);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleUploadTooLarge(MaxUploadSizeExceededException exception,
                                              HttpServletRequest request) {
        log.warn("API upload rejected code={} method={} path={}",
                ApiErrorCode.REQUEST_INVALID, request.getMethod(), request.getRequestURI());
        return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.REQUEST_INVALID,
                "Tệp tải lên vượt quá dung lượng cho phép. Vui lòng chọn tệp nhỏ hơn.", null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseError handleBadCredentialsException(BadCredentialsException exception,
                                                        HttpServletRequest request) {
        log.warn("API authentication rejected code={} method={} path={}",
                ApiErrorCode.AUTH_INVALID_CREDENTIALS,
                request.getMethod(),
                request.getRequestURI());
        return error(HttpStatus.UNAUTHORIZED.value(), ApiErrorCode.AUTH_INVALID_CREDENTIALS,
                "Tên đăng nhập hoặc mật khẩu không chính xác.", null);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseError handleUsernameNotFoundException(UsernameNotFoundException exception,
                                                          HttpServletRequest request) {
        log.warn("API authentication rejected code={} method={} path={}",
                ApiErrorCode.AUTH_INVALID_CREDENTIALS,
                request.getMethod(),
                request.getRequestURI());
        return error(HttpStatus.UNAUTHORIZED.value(), ApiErrorCode.AUTH_INVALID_CREDENTIALS,
                "Tên đăng nhập hoặc mật khẩu không chính xác.", null);
    }

    @ExceptionHandler(DisabledException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseError handleDisabledAccount(DisabledException exception, HttpServletRequest request) {
        log.warn("API authentication rejected code={} method={} path={}",
                ApiErrorCode.AUTH_ACCOUNT_INACTIVE,
                request.getMethod(),
                request.getRequestURI());
        return error(HttpStatus.FORBIDDEN.value(), ApiErrorCode.AUTH_ACCOUNT_INACTIVE,
                "Tài khoản đang bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.", null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseError handleUnauthorizedException(UnauthorizedException exception,
                                                      HttpServletRequest request) {
        String message = defaultMessage(exception.getMessage());
        String normalized = message.toLowerCase(Locale.ROOT);
        String code = normalized.contains("chưa được kích hoạt")
                ? ApiErrorCode.AUTH_ACCOUNT_PENDING
                : normalized.contains("vô hiệu hóa")
                ? ApiErrorCode.AUTH_ACCOUNT_INACTIVE
                : normalized.contains("tên đăng nhập") || normalized.contains("mật khẩu")
                ? ApiErrorCode.AUTH_INVALID_CREDENTIALS
                : ApiErrorCode.SESSION_EXPIRED;

        log.warn("API authentication rejected code={} method={} path={}",
                code, request.getMethod(), request.getRequestURI());

        String userMessage = switch (code) {
            case ApiErrorCode.AUTH_ACCOUNT_PENDING ->
                    "Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP trước khi đăng nhập.";
            case ApiErrorCode.AUTH_ACCOUNT_INACTIVE ->
                    "Tài khoản đang bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
            case ApiErrorCode.AUTH_INVALID_CREDENTIALS ->
                    "Tên đăng nhập hoặc mật khẩu không chính xác.";
            default -> "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.";
        };
        return error(HttpStatus.UNAUTHORIZED.value(), code, userMessage, null);
    }

    @ExceptionHandler({DuplicateResourceException.class, DataIntegrityViolationException.class})
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseError handleDuplicateResourceException(Exception exception,
                                                           HttpServletRequest request) {
        String message = exception instanceof DuplicateResourceException
                ? defaultMessage(exception.getMessage())
                : "Dữ liệu đã tồn tại hoặc đang trùng với một bản ghi khác. Vui lòng kiểm tra lại.";
        log.warn("API conflict code={} method={} path={} message={}",
                ApiErrorCode.DUPLICATE_RESOURCE,
                request.getMethod(),
                request.getRequestURI(),
                message);
        return error(HttpStatus.CONFLICT.value(), ApiErrorCode.DUPLICATE_RESOURCE, message, null);
    }

    @ExceptionHandler({RedisSystemException.class, RedisConnectionFailureException.class})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ResponseError handleRedisServiceException(Exception exception, HttpServletRequest request) {
        return dependencyUnavailable(ApiErrorCode.OTP_SERVICE_UNAVAILABLE,
                "Dịch vụ xác thực tạm thời chưa sẵn sàng. Vui lòng thử lại sau ít phút.",
                "redis", exception, request);
    }

    @ExceptionHandler({DataAccessResourceFailureException.class,
            CannotGetJdbcConnectionException.class,
            QueryTimeoutException.class})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ResponseError handleDataAccessFailure(DataAccessException exception,
                                                  HttpServletRequest request) {
        if (isRedisFailure(exception)) {
            return dependencyUnavailable(ApiErrorCode.OTP_SERVICE_UNAVAILABLE,
                    "Dịch vụ xác thực tạm thời chưa sẵn sàng. Vui lòng thử lại sau ít phút.",
                    "redis", exception, request);
        }
        return dependencyUnavailable(ApiErrorCode.DATABASE_UNAVAILABLE,
                "Hệ thống tạm thời không kết nối được cơ sở dữ liệu. Vui lòng thử lại sau ít phút.",
                "database", exception, request);
    }

    @ExceptionHandler(DataAccessException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ResponseError handleOtherDataAccessFailure(DataAccessException exception,
                                                       HttpServletRequest request) {
        String code = isRedisFailure(exception)
                ? ApiErrorCode.OTP_SERVICE_UNAVAILABLE
                : ApiErrorCode.SERVICE_UNAVAILABLE;
        String message = isRedisFailure(exception)
                ? "Dịch vụ xác thực tạm thời chưa sẵn sàng. Vui lòng thử lại sau ít phút."
                : "Hệ thống tạm thời không thể hoàn tất yêu cầu. Vui lòng thử lại sau ít phút.";
        return dependencyUnavailable(code, message,
                isRedisFailure(exception) ? "redis" : "data-service", exception, request);
    }

    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleBadRequestException(BadRequestException exception,
                                                    HttpServletRequest request) {
        String message = defaultMessage(exception.getMessage());
        log.warn("API request rejected code={} method={} path={} message={}",
                ApiErrorCode.REQUEST_INVALID,
                request.getMethod(),
                request.getRequestURI(),
                message);
        return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.REQUEST_INVALID, message, null);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseError handleResourceNotFoundException(ResourceNotFoundException exception,
                                                         HttpServletRequest request) {
        String message = humanResourceNotFoundMessage(exception.getMessage());
        log.warn("API resource not found code={} method={} path={} message={}",
                ApiErrorCode.RESOURCE_NOT_FOUND,
                request.getMethod(),
                request.getRequestURI(),
                message);
        return error(HttpStatus.NOT_FOUND.value(), ApiErrorCode.RESOURCE_NOT_FOUND, message, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseError handleRouteNotFound(NoResourceFoundException exception,
                                             HttpServletRequest request) {
        log.warn("API route not found code={} method={} path={}",
                ApiErrorCode.ROUTE_NOT_FOUND,
                request.getMethod(),
                request.getRequestURI());
        return error(HttpStatus.NOT_FOUND.value(), ApiErrorCode.ROUTE_NOT_FOUND,
                "Không tìm thấy chức năng hoặc địa chỉ yêu cầu. Vui lòng tải lại trang và thử lại.", null);
    }

    @ExceptionHandler(ProtectedResourceException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseError handleProtectedResourceException(ProtectedResourceException exception,
                                                           HttpServletRequest request) {
        String message = defaultMessage(exception.getMessage());
        log.warn("API protected resource rejected code={} method={} path={} message={}",
                ApiErrorCode.PROTECTED_RESOURCE,
                request.getMethod(),
                request.getRequestURI(),
                message);
        return error(HttpStatus.FORBIDDEN.value(), ApiErrorCode.PROTECTED_RESOURCE, message, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseError handleAccessDeniedException(AccessDeniedException exception,
                                                      HttpServletRequest request) {
        log.warn("API authorization rejected code={} method={} path={}",
                ApiErrorCode.ACCESS_DENIED,
                request.getMethod(),
                request.getRequestURI());
        return error(HttpStatus.FORBIDDEN.value(), ApiErrorCode.ACCESS_DENIED,
                "Bạn không có quyền thực hiện thao tác này. Nếu cần, hãy liên hệ quản trị viên để được cấp quyền.", null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseError handleIllegalArgumentException(IllegalArgumentException exception,
                                                         HttpServletRequest request) {
        log.warn("API argument rejected code={} method={} path={}",
                ApiErrorCode.REQUEST_INVALID,
                request.getMethod(),
                request.getRequestURI());
        return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.REQUEST_INVALID,
                "Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại thông tin.", null);
    }

    /**
     * A compatibility boundary for older services that still throw RuntimeException.
     * Known business cases are converted to a useful response; unknown cases are
     * treated as internal failures and never expose the exception message.
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseError handleRuntimeException(RuntimeException exception,
                                                HttpServletRequest request) {
        ResponseError businessError = classifyKnownRuntimeFailure(exception, request);
        return businessError != null ? businessError : internalError(exception, request);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseError handleException(Exception exception, HttpServletRequest request) {
        return internalError(exception, request);
    }

    private ResponseError classifyKnownRuntimeFailure(RuntimeException exception,
                                                      HttpServletRequest request) {
        String message = defaultMessage(exception.getMessage());
        String normalized = message.toLowerCase(Locale.ROOT);
        String path = request.getRequestURI().toLowerCase(Locale.ROOT);

        if (path.endsWith("/auth/login")) {
            if (normalized.contains("not activated") || normalized.contains("chưa được kích hoạt")) {
                log.warn("API authentication rejected code={} method={} path={}",
                        ApiErrorCode.AUTH_ACCOUNT_PENDING, request.getMethod(), request.getRequestURI());
                return error(HttpStatus.UNAUTHORIZED.value(), ApiErrorCode.AUTH_ACCOUNT_PENDING,
                        "Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP trước khi đăng nhập.", null);
            }
            if (normalized.contains("vô hiệu hóa") || normalized.contains("disabled")) {
                log.warn("API authentication rejected code={} method={} path={}",
                        ApiErrorCode.AUTH_ACCOUNT_INACTIVE, request.getMethod(), request.getRequestURI());
                return error(HttpStatus.FORBIDDEN.value(), ApiErrorCode.AUTH_ACCOUNT_INACTIVE,
                        "Tài khoản đang bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.", null);
            }
            if (normalized.contains("user not found") || normalized.contains("không tìm thấy người dùng")) {
                log.warn("API authentication rejected code={} method={} path={}",
                        ApiErrorCode.AUTH_INVALID_CREDENTIALS, request.getMethod(), request.getRequestURI());
                return error(HttpStatus.UNAUTHORIZED.value(), ApiErrorCode.AUTH_INVALID_CREDENTIALS,
                        "Tên đăng nhập hoặc mật khẩu không chính xác.", null);
            }
        }

        if (normalized.contains("invalid or expired otp") || normalized.contains("otp không đúng")
                || normalized.contains("mã otp không hợp lệ")) {
            log.warn("API OTP rejected code={} method={} path={}",
                    ApiErrorCode.OTP_INVALID, request.getMethod(), request.getRequestURI());
            return error(HttpStatus.BAD_REQUEST.value(), ApiErrorCode.OTP_INVALID,
                    "Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra email và nhập lại mã mới.", null);
        }

        if (normalized.contains("đã tồn tại") || normalized.contains("already exists")
                || normalized.contains("already assigned")) {
            log.warn("API conflict code={} method={} path={}",
                    ApiErrorCode.DUPLICATE_RESOURCE, request.getMethod(), request.getRequestURI());
            return error(HttpStatus.CONFLICT.value(), ApiErrorCode.DUPLICATE_RESOURCE,
                    "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại thông tin trùng lặp.", null);
        }

        if (normalized.contains("not found") || normalized.contains("không tìm thấy")
                || normalized.contains("không tồn tại")) {
            log.warn("API resource not found code={} method={} path={}",
                    ApiErrorCode.RESOURCE_NOT_FOUND, request.getMethod(), request.getRequestURI());
            return error(HttpStatus.NOT_FOUND.value(), ApiErrorCode.RESOURCE_NOT_FOUND,
                    "Không tìm thấy dữ liệu yêu cầu hoặc dữ liệu đã bị xóa.", null);
        }

        return null;
    }

    private ResponseError dependencyUnavailable(String code,
                                                String message,
                                                String dependency,
                                                Exception exception,
                                                HttpServletRequest request) {
        String supportCode = newSupportCode();
        log.error("API dependency failure code={} supportCode={} dependency={} method={} path={}",
                code,
                supportCode,
                dependency,
                request.getMethod(),
                request.getRequestURI(),
                exception);
        return error(HttpStatus.SERVICE_UNAVAILABLE.value(), code, message, supportCode);
    }

    private ResponseError internalError(Exception exception, HttpServletRequest request) {
        String supportCode = newSupportCode();
        log.error("API unhandled failure code={} supportCode={} method={} path={}",
                ApiErrorCode.INTERNAL_ERROR,
                supportCode,
                request.getMethod(),
                request.getRequestURI(),
                exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR.value(), ApiErrorCode.INTERNAL_ERROR,
                "Hệ thống đang gặp sự cố tạm thời. Thông tin của bạn chưa được thay đổi. Vui lòng thử lại sau.",
                supportCode);
    }

    private ResponseError error(int status, String code, String message, String supportCode) {
        return new ResponseError(status, code, message, supportCode);
    }

    private ResponseError error(int status,
                                String code,
                                String message,
                                String supportCode,
                                Map<String, String> fieldErrors) {
        return new ResponseError(status, code, message, supportCode, fieldErrors);
    }

    private boolean isRedisFailure(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            String className = current.getClass().getName().toLowerCase(Locale.ROOT);
            String message = current.getMessage() == null ? "" : current.getMessage().toLowerCase(Locale.ROOT);
            if (className.contains("redis") || className.contains("lettuce")
                    || message.contains("redis") || message.contains("lettuce")) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private String humanResourceNotFoundMessage(String message) {
        String normalized = defaultMessage(message).toLowerCase(Locale.ROOT);
        if (normalized.contains("project") || normalized.contains("dự án")) {
            return "Không tìm thấy dự án yêu cầu hoặc dự án đã bị xóa.";
        }
        if (normalized.contains("user") || normalized.contains("người dùng")
                || normalized.contains("nhân sự")) {
            return "Không tìm thấy tài khoản hoặc nhân sự yêu cầu.";
        }
        return "Không tìm thấy dữ liệu yêu cầu hoặc dữ liệu đã bị xóa.";
    }

    private String defaultMessage(String message) {
        if (message == null || message.isBlank()) {
            return "Yêu cầu không thể hoàn tất. Vui lòng kiểm tra lại và thử lại.";
        }

        String normalized = message.trim();
        return switch (normalized) {
            case "Username must not be blank", "Password must not be blank",
                    "OTP code must not be blank", "Refresh token must not be blank" ->
                    "không được để trống";
            case "OTP code must be exactly 6 digits" -> "phải gồm đúng 6 chữ số";
            case "Project ID is required", "User ID is required", "Log date is required",
                    "Quantity is required" -> "là bắt buộc";
            case "Project ID must not be null", "GPS latitude must not be null",
                    "GPS longitude must not be null", "GPS accuracy must not be null",
                    "User ID must not be null" -> "là bắt buộc";
            case "GPS accuracy must not be negative" -> "không được âm";
            case "Email is not valid" -> "không đúng định dạng";
            default -> normalized;
        };
    }

    private String newSupportCode() {
        return "ERR-" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private String validationFieldLabel(String field) {
        return Map.ofEntries(
                Map.entry("username", "Tên đăng nhập"),
                Map.entry("password", "Mật khẩu"),
                Map.entry("fullName", "Họ và tên"),
                Map.entry("phone", "Số điện thoại"),
                Map.entry("email", "Email"),
                Map.entry("otpCode", "Mã OTP"),
                Map.entry("projectId", "Dự án"),
                Map.entry("userId", "Người dùng"),
                Map.entry("latitude", "Vĩ độ GPS"),
                Map.entry("longitude", "Kinh độ GPS"),
                Map.entry("accuracy", "Độ chính xác GPS"),
                Map.entry("requestedQuantity", "Số lượng"),
                Map.entry("logDate", "Ngày nhật ký"),
                Map.entry("startTime", "Giờ bắt đầu"),
                Map.entry("endTime", "Giờ kết thúc")
        ).getOrDefault(field, field);
    }
}
