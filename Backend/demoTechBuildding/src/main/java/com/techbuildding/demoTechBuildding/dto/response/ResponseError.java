package com.techbuildding.demoTechBuildding.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.io.Serializable;
import java.util.Collections;
import java.util.Map;

/**
 * Standard API response wrapper for error/failure operations.
 * Unlike {@link ResponseData}, this class does not contain a data payload.
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ResponseError implements Serializable {

    private final int status;
    /** Stable machine-readable category; this is not a random support code. */
    private final String code;
    private final String message;
    /** Short value used by support/server logs to correlate unexpected failures. */
    private final String supportCode;
    /** Field-level input errors for forms that need to highlight a specific field. */
    private final Map<String, String> fieldErrors;

    public ResponseError(int status, String message) {
        this(status, defaultCode(status), message, null, Collections.emptyMap());
    }

    /**
     * Kept for source compatibility with older handlers. The third argument is
     * now treated as a support/correlation code, never as the user-facing error
     * category.
     */
    public ResponseError(int status, String message, String supportCode) {
        this(status, defaultCode(status), message, supportCode, Collections.emptyMap());
    }

    public ResponseError(int status, String code, String message, String supportCode) {
        this(status, code, message, supportCode, Collections.emptyMap());
    }

    public ResponseError(int status,
                         String code,
                         String message,
                         String supportCode,
                         Map<String, String> fieldErrors) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.supportCode = supportCode;
        this.fieldErrors = fieldErrors == null ? Collections.emptyMap() : fieldErrors;
    }

    /**
     * Java compatibility for callers compiled against the old DTO. It is
     * intentionally hidden from JSON so clients migrate to supportCode.
     */
    @JsonIgnore
    public String getErrorCode() {
        return supportCode;
    }

    private static String defaultCode(int status) {
        if (status == 400) return "REQUEST_INVALID";
        if (status == 401) return "AUTHENTICATION_REQUIRED";
        if (status == 403) return "ACCESS_DENIED";
        if (status == 404) return "RESOURCE_NOT_FOUND";
        if (status == 409) return "DUPLICATE_RESOURCE";
        if (status == 503) return "SERVICE_UNAVAILABLE";
        return "INTERNAL_ERROR";
    }
}
